import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const NURSE_PROMPT = `
As a warm postpartum nurse, analyze this image.
JSON FORMAT ONLY. No markdown blocks. No extra text.
{
  "ai_analysis_type": "nutrition" | "exhaustion",
  "ai_insight_text": "Detailed, supportive advice (2-3 sentences)",
  "fatigue_index": number (1-10),
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

        // Use the pattern that worked in sentiment/route.ts
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

        console.log("Nurse Vision API: Sending to Gemini...");
        const result = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                systemInstruction: NURSE_PROMPT
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
            console.error("Nurse Vision API: JSON Parse Error, attempting fallback extraction");
            // Fallback: try to extract fields manually if JSON is mangled
            analysis = {
                ai_analysis_type: cleanedJson.includes("nutrition") ? "nutrition" : "exhaustion",
                ai_insight_text: "I've reviewed your photo. Please check your daily logs for details.",
                alert_level: "stable"
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
        console.error("Nurse Vision Error:", error);
        return NextResponse.json({ error: "Nurse is currently busy: " + error.message }, { status: 500 });
    }
}
