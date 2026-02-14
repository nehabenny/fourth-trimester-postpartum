/**
 * Nurse AI Vision Endpoint
 * Accepts a base64-encoded image from the mother's camera, sends it to Gemini 2.5 Flash
 * for multimodal analysis, and returns clinical insights about fatigue, nutrition, or emotional state.
 * Results are also logged to Supabase for history tracking.
 */

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Initialize the Google GenAI client
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const NURSE_PROMPT = `
As an expert postpartum nurse, analyze this image with high clinical empathy.
FOCUS AREA: 
1. If you see a FACE: Look for specific markers of exhaustion (dark circles, eye strain, pale skin tone, drooping eyelids).
2. If you see FOOD: Analyze nutritional value for a recovering mother (protein, iron, hydration).

OUTPUT RULES:
- If a human face is present, calculate the "fatigue_index" (1-10) based ONLY on visible facial markers.
- If no face is clearly visible, set "fatigue_index" to null.
- "ai_analysis_type" must be "exhaustion" if a face is detected, "nutrition" if food is detected, or "observation" otherwise.
- In "ai_insight_text", explicitly describe WHAT you saw in the face (e.g., "I notice some fatigue around your eyes...").
- JSON FORMAT ONLY. No markdown blocks.

{
  "ai_analysis_type": "nutrition" | "exhaustion" | "observation",
  "ai_insight_text": string,
  "fatigue_index": number | null,
  "alert_level": "stable" | "caution" | "urgent"
}
`;

export async function POST(req: Request) {
    try {
        const { image } = await req.json();
        console.log("Nurse Vision API: Received image (base64 length: " + (image?.length || 0) + ")");

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Construct the multimodal payload: image data is sent as inlineData
        // Gemini processes both the image and the system prompt to generate clinical insights
        const contents = [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            data: image,
                            mimeType: "image/jpeg",
                        },
                    },
                ],
            },
        ];

        console.log("Nurse Vision API: Sending to Gemini with model ID: gemini-2.5-flash");
        const result = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                systemInstruction: NURSE_PROMPT,
                temperature: 0.4
            }
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        console.log("Nurse Vision API: Gemini raw response: ", responseText);

        // More robust JSON cleaning
        let cleanedJson = responseText.trim();
        if (cleanedJson.includes("```")) {
            const matches = cleanedJson.match(/```json\s?([\s\S]*?)\s?```/);
            if (matches && matches[1]) {
                cleanedJson = matches[1].trim();
            } else {
                cleanedJson = cleanedJson.replace(/```(json)?/g, "").trim();
            }
        }

        let analysis;
        try {
            analysis = JSON.parse(cleanedJson);
        } catch (parseError) {
            console.error("Nurse Vision API: JSON Parse Error", parseError);
            analysis = {
                ai_analysis_type: "observation",
                ai_insight_text: "I've reviewed your photo. It's hard for me to see details clearly here—try another photo with better lighting!",
                alert_level: "stable",
                fatigue_index: null
            };
        }

        // Ensure ai_insight_text is never empty
        if (!analysis.ai_insight_text || analysis.ai_insight_text.trim() === "") {
            console.log("Nurse Vision API: Insight text was empty, applying fallback.");
            analysis.ai_insight_text = "I've reviewed your photo. You're doing a great job caring for yourself and the baby!";
        }

        const logEntry = {
            ai_analysis_type: analysis.ai_analysis_type || 'observation',
            ai_insight_text: analysis.ai_insight_text,
            fatigue_index: analysis.fatigue_index || null,
            alert_level: analysis.alert_level || 'stable',
            user_id: "00000000-0000-0000-0000-000000000000"
        };

        console.log("Nurse Vision API: Final log entry to be saved/returned:", logEntry);

        // Save to Supabase (wrapped in try-catch to avoid blocking the response)
        try {
            const { data: dbData, error: dbError } = await supabase
                .from('daily_logs')
                .insert(logEntry)
                .select(); // Select back to confirm

            if (dbError) {
                console.error("Nurse Vision API: Supabase Error:", dbError);
            } else {
                console.log("Nurse Vision API: Saved to Supabase successfully. Record:", dbData?.[0]);
            }
        } catch (dbEx) {
            console.error("Nurse Vision API: Supabase Exception:", dbEx);
        }

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("--- NURSE VISION ERROR TRACE ---");
        console.error("Status:", error.status);
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Raw Error JSON:", JSON.stringify(error, null, 2));
        console.error("-------------------------------");

        let status = error.status || 500;
        let errorMessage = "Diagnostic: AI call failed";
        let insightFallback = `I'm having a technical hiccup: ${error.message || "Unknown error"}. Check the console for more details.`;

        if (status === 429 || error.message?.includes("RESOURCE_EXHAUSTED")) {
            errorMessage = "Quota Exceeded (429)";
            insightFallback = "I'm taking a 60-second break to rest (Quota reached). I'll be back shortly, Mama!";
        }

        return NextResponse.json({
            error: errorMessage,
            ai_insight_text: insightFallback,
            alert_level: "stable",
            debug: {
                message: error.message,
                status: error.status,
                full: error
            }
        }, { status });
    }
}
