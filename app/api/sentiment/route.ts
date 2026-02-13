import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

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

        const promptText = `Journal History:\n${history.map((h: any) => `- [${h.timestamp}] ${h.note}`).join("\n")}`;
        const contents = [{ role: "user", parts: [{ text: promptText }] }];

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
        console.error("Sentiment API Error:", error);
        return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 });
    }
}
