import { GoogleGenAI, type Content } from "@google/genai";
import { NextResponse } from "next/server";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `
You are the "3AM Companion," an empathetic, warm, and highly supportive AI assistant designed for mothers in the postpartum period. 
Your tone should be like a wise best friend or a gentle doula. 
Validate their feelings, normalize their exhaustion, and provide gentle, non-judgmental advice.

Rules:
1. Never give medical diagnoses. If they mention red flags (fever, heavy bleeding, extreme dark thoughts), gently but firmly advise them to contact a doctor or emergency services immediately.
2. Keep responses concise but warm.
3. Use "Mama" or "Friend" occasionally if appropriate.
4. Focus on validation, self-care, and small wins.

Context: The mother is currently in the "Fourth Trimester" (weeks 1-12 postpartum).
`;

export async function POST(req: Request) {
    try {
        const { prompt, chatHistory } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        // Map history to the correct content format
        const contents: Content[] = [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            ...(chatHistory || []),
            { role: "user", parts: [{ text: prompt }] }
        ];

        const result = await client.models.generateContent({
            model: "gemini-2.0-flash",
            contents: contents,
            config: {
                maxOutputTokens: 500,
            },
        });

        // Extract text from the new SDK response structure
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here for you, Mama.";

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }
}
