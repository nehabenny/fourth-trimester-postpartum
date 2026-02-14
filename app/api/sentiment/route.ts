/**
 * Sentiment Pulse Endpoint
 * Analyzes the mother's mood journal history using Gemini AI to detect emotional trends,
 * burnout risk, and suggest interventions for family members. Runs once per session
 * to conserve API quota.
 */

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the Google GenAI client
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SENTIMENT_PROMPT = `
You are a clinical postpartum sentiment analyst. Analyze the provided journal history (last few days) of a postpartum mother.
Return ONLY a JSON object with the following structure:
{
  "sentiment_score": number (0 to 1, where 0 is very low/distressed and 1 is very positive),
  "burnout_risk": "low" | "medium" | "high",
  "suggested_intervention": string (a short, actionable advice for her family members),
  "analysis_summary": string (a very short summary of her emotional state)
}

Focus on "reading between the lines" for signs of isolation, exhaustion, or loss of self. 
Be highly sensitive but medically cautious.
`;

export async function POST(req: Request) {
    try {
        const { history } = await req.json();

        if (!history || history.length === 0) {
            return NextResponse.json({ error: "No history provided" }, { status: 400 });
        }

        // Format the mood history into a readable prompt for Gemini
        const promptText = `Journal History:\n${history.map((h: any) => `- [${h.timestamp}] ${h.note}`).join("\n")}`;
        const contents = [{ role: "user", parts: [{ text: promptText }] }];

        // Send to Gemini with JSON response mode for structured output

        const result = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                systemInstruction: SENTIMENT_PROMPT
            }
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        return NextResponse.json(JSON.parse(text));
    } catch (error: any) {
        console.error("--- SENTIMENT ANALYSIS ERROR TRACE ---");
        console.error("Status:", error.status);
        console.error("Message:", error.message);
        console.error("Raw Error JSON:", JSON.stringify(error, null, 2));
        console.error("--------------------------------------");

        let status = error.status || 500;
        let errorMessage = "Sentiment check failed";

        if (status === 429 || error.message?.includes("RESOURCE_EXHAUSTED")) {
            errorMessage = "Quota Exceeded (429)";
        }

        return NextResponse.json({
            error: errorMessage,
            sentiment: "stable",
            debug: {
                message: error.message,
                status: error.status
            }
        }, { status });
    }
}
