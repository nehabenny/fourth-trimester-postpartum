"use client";

import { useState, useEffect } from "react";
import { Quote, Wind, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const affirmations = [
    "You are doing an incredible job, even on the hard days.",
    "This season is temporary. Your strength is lasting.",
    "Taking care of yourself is part of taking care of your baby.",
    "You are the perfect mother for your child.",
    "It is okay to ask for help. You don't have to do it all alone.",
    "Your worth is not measured by your productivity today.",
];

export function SupportTools() {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [isBreathing, setIsBreathing] = useState(false);
    const [breathStage, setBreathStage] = useState<"In" | "Hold" | "Out">("In");

    useEffect(() => {
        setQuoteIndex(Math.floor(Math.random() * affirmations.length));
    }, []);

    useEffect(() => {
        localStorage.setItem("is_breathing", isBreathing ? "true" : "false");
        let timer: NodeJS.Timeout;
        if (isBreathing) {
            const cycle = () => {
                setBreathStage("In");
                timer = setTimeout(() => {
                    setBreathStage("Hold");
                    timer = setTimeout(() => {
                        setBreathStage("Out");
                        timer = setTimeout(cycle, 8000); // 8s out
                    }, 7000); // 7s hold
                }, 4000); // 4s in
            };
            cycle();
        }
        return () => {
            clearTimeout(timer);
        };
    }, [isBreathing]);

    return (
        <div className="space-y-6">
            {/* Daily Affirmation */}
            <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-8 shadow-sm">
                <Quote className="absolute -left-2 -top-2 h-16 w-16 opacity-5" />
                <div className="relative z-10 text-center">
                    <Sparkles className="mx-auto mb-4 h-6 w-6 text-primary/40" />
                    <p className="font-serif text-xl italic leading-relaxed text-foreground">
                        "{affirmations[quoteIndex]}"
                    </p>
                    <div className="mt-6 flex justify-center gap-2">
                        <Heart className="h-4 w-4 fill-primary/20 text-primary" />
                        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Daily Affirmation
                        </span>
                    </div>
                </div>
            </div>

            {/* Breathing Coach */}
            <div className="rounded-3xl border bg-card p-8 shadow-sm text-center">
                <h2 className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold">
                    <Wind className="h-5 w-5 text-blue-400" />
                    Pause & Breathe
                </h2>

                <div className="relative flex h-64 items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isBreathing ? (
                            <motion.div
                                key="breathing"
                                className="relative flex items-center justify-center"
                            >
                                {/* Outer Glow */}
                                <motion.div
                                    animate={{
                                        scale: breathStage === "In" ? 1.5 : breathStage === "Hold" ? 1.5 : 1,
                                        opacity: breathStage === "Hold" ? 0.3 : 0.1,
                                    }}
                                    transition={{
                                        duration: breathStage === "In" ? 4 : breathStage === "Out" ? 8 : 0.5,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute h-48 w-48 rounded-full bg-primary/30 blur-3xl"
                                />

                                {/* Breathing Circle */}
                                <motion.div
                                    animate={{
                                        scale: breathStage === "In" ? 2 : breathStage === "Hold" ? 2 : 1,
                                    }}
                                    transition={{
                                        duration: breathStage === "In" ? 4 : breathStage === "Out" ? 8 : 0.5,
                                        ease: "easeInOut",
                                    }}
                                    className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary bg-white shadow-2xl"
                                >
                                    <span className="text-lg font-bold text-primary">
                                        {breathStage}
                                    </span>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <button
                                onClick={() => setIsBreathing(true)}
                                className="group relative flex h-32 w-32 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95"
                            >
                                <span className="text-lg font-bold">Start</span>
                                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75" />
                            </button>
                        )}
                    </AnimatePresence>
                </div>

                {isBreathing && (
                    <button
                        onClick={() => setIsBreathing(false)}
                        className="mt-8 text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors"
                    >
                        Stop Exercise
                    </button>
                )}

                {!isBreathing && (
                    <p className="mt-4 text-xs text-muted-foreground italic">
                        A simple 4-7-8 breathing exercise to calm your nervous system.
                    </p>
                )}
            </div>
        </div>
    );
}
