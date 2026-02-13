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

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here") {
            console.error("Gemini Error: API Key not configured correctly in .env.local");
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        // Prepare contents: Gemini requires alternating turns if history is provided
        // If history is empty, we just send the user prompt
        const contents: Content[] = [...(chatHistory || []), { role: "user", parts: [{ text: prompt }] }];

        console.log("Sending request to Gemini...", { model: "gemini-2.5-flash", promptLength: prompt.length });

        const result = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                maxOutputTokens: 800,
                temperature: 0.7,
            },
        });

        // Extract text from the new SDK response structure (candidates array)
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm right here with you, Mama.";

        console.log("Gemini Response received:", { textLength: text.length });

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("Gemini API Error Detail:", error);

        const fallback = "The Nurse is taking a 60-second break to check on other patients... You're doing great. Take a deep breath while I process your data.";

        // Specific handling for Quota Exceeded
        if (error.status === 429 || error.message?.includes("RESOURCE_EXHAUSTED")) {
            return NextResponse.json({
                error: "Quota Exceeded",
                text: fallback
            }, { status: 429 });
        }

        return NextResponse.json({
            error: "AI is currently resting",
            text: fallback
        }, { status: 500 });
    }
}
