"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "model";
    parts: [{ text: string }];
}

export function AiChat({ onClose }: { onClose?: () => void }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", parts: [{ text: input }] };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: input,
                    chatHistory: messages,
                }),
            });

            const data = await response.json();

            if (response.ok && data.text) {
                setMessages((prev) => [...prev, { role: "model", parts: [{ text: data.text }] }]);
            } else {
                const errorMsg = data.error === "API Key not configured"
                    ? "Mama, it looks like the AI companion needs its key (API Key) to wake up. Check the .env.local file."
                    : (data.message || "I'm having a little trouble connecting right now, Mama.");

                setMessages((prev) => [...prev, { role: "model", parts: [{ text: errorMsg }] }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { role: "model", parts: [{ text: "I'm sorry, Mama, I'm having a little trouble connecting right now. Just know I'm here for you." }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="flex h-[500px] w-full max-w-md flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold">3AM AI Companion</h3>
                        <span className="text-[10px] opacity-80">Online & Listening</span>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scroll-smooth"
            >
                {messages.length === 0 && (
                    <div className="mt-8 text-center text-sm text-muted-foreground px-4">
                        <div className="mb-4 flex justify-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <p className="italic">"It's 3AM, everything is quiet, and I'm right here with you. How are you doing, Mama?"</p>
                    </div>
                )}

                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex flex-col",
                            m.role === "user" ? "items-end" : "items-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                m.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-white border rounded-tl-none text-foreground"
                            )}
                        >
                            {m.parts[0].text}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start">
                        <div className="bg-white border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="border-t p-4 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border-none bg-muted/30 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
