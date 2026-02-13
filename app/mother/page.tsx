"use client";

import { useState, useEffect } from "react";
import { Smile, HeartPulse, ClipboardCheck, Sparkles, MessageSquare, X, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { RecoveryTracker } from "@/components/mother/RecoveryTracker";
import { MentalHealthScreening } from "@/components/mother/MentalHealthScreening";
import { SupportTools } from "@/components/mother/SupportTools";
import { AiChat } from "@/components/mother/AiChat";
import { CameraCapture } from "@/components/mother/CameraCapture";
import { CommunityForum } from "@/components/mother/CommunityForum";
import { AnimatePresence, motion } from "framer-motion";

const moods = [
    { emoji: "😢", label: "Very Low", bg: "bg-red-50" },
    { emoji: "😐", label: "Low", bg: "bg-orange-50" },
    { emoji: "🙂", label: "Okay", bg: "bg-yellow-50" },
    { emoji: "😊", label: "Good", bg: "bg-green-50" },
    { emoji: "😍", label: "Great", bg: "bg-pink-50" },
];

const affirmations = [
    "You are exactly the mother your baby needs.",
    "Be gentle with yourself; you're doing something incredible.",
    "It's okay to ask for help; it's a sign of strength, not weakness.",
    "Your worth is not measured by how much you get done today.",
    "Rest is productive. Your body and mind deserve it.",
    "You are doing a great job, even on the hardest days.",
    "Small wins are still wins. Celebrate them.",
    "Your baby loves you for who you are, through every mood.",
    "You're learning and growing alongside your baby.",
    "It's okay to take it one hour at a time."
];

export default function MotherPage() {
    const [activeTab, setActiveTab] = useState<"daily" | "physical" | "mental" | "support" | "community">("daily");
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [stressLevel, setStressLevel] = useState(3);
    const [journalNote, setJournalNote] = useState("");
    const [lastLog, setLastLog] = useState<any>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentAffirmation, setCurrentAffirmation] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (activeTab === "daily") {
            const random = affirmations[Math.floor(Math.random() * affirmations.length)];
            setCurrentAffirmation(random);
        }
    }, [activeTab]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const role = localStorage.getItem("user_role");
        if (!token || role !== "MOTHER") {
            router.push("/login?error=unauthorized");
        }
    }, [router]);

    useEffect(() => {
        const saved = localStorage.getItem("mother_log");
        if (saved) {
            setLastLog(JSON.parse(saved));
        }
    }, []);

    const handleSaveMood = () => {
        if (selectedMood === null) return;
        const newLog = {
            mood: selectedMood,
            stress: stressLevel,
            note: journalNote,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem("mother_log", JSON.stringify(newLog));

        // Track journal history (last 5 entries) for AI sentiment pulse
        const history = JSON.parse(localStorage.getItem("journal_history") || "[]");
        const updatedHistory = [{ note: journalNote, timestamp: new Date().toISOString() }, ...history].slice(0, 5);
        localStorage.setItem("journal_history", JSON.stringify(updatedHistory));

        setLastLog(newLog);
        alert("Daily check-in saved!");
    };

    const tabs = [
        { id: "daily", label: "Daily", icon: <Smile className="h-4 w-4" /> },
        { id: "physical", label: "Physical", icon: <HeartPulse className="h-4 w-4" /> },
        { id: "mental", label: "Wellness", icon: <ClipboardCheck className="h-4 w-4" /> },
        { id: "support", label: "Support", icon: <Sparkles className="h-4 w-4" /> },
        { id: "community", label: "Community", icon: <Users className="h-4 w-4" /> },
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-muted/20">
            <div className="container mx-auto flex flex-col md:flex-row gap-8 px-4 py-8">

                {/* Desktop Sidebar Navigation */}
                <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2">
                    <div className="mb-6 px-4">
                        <h1 className="font-serif text-2xl font-bold italic">Bloom Mode</h1>
                        <p className="text-xs text-muted-foreground italic">You're doing great, Bloom.</p>
                    </div>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-white/50"
                            )}
                        >
                            <div className={cn("p-1.5 rounded-lg", activeTab === tab.id ? "bg-white/20" : "bg-muted/50")}>
                                {tab.icon}
                            </div>
                            <span className="text-sm font-medium">{tab.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Mobile Tab Navigation (Fixed at bottom or top - let's stick to sticky top for now) */}
                <nav className="md:hidden sticky top-16 z-40 flex w-full border-b bg-background/80 px-2 py-2 backdrop-blur-md">
                    <div className="flex w-full justify-around">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all",
                                    activeTab === tab.id
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "text-muted-foreground"
                                )}
                            >
                                {tab.icon}
                                <span className="text-[10px] uppercase tracking-wider">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                <main className="flex-1 w-full max-w-2xl mx-auto md:mx-0">
                    <div className="md:hidden mb-8 text-center pt-4">
                        <h1 className="font-serif text-3xl font-bold italic">Bloom Circle</h1>
                        <p className="text-muted-foreground">You're doing a great job, Bloom.</p>
                    </div>

                    <div className="pb-20">
                        {activeTab === "daily" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                {currentAffirmation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-3xl bg-secondary/10 p-6 text-center border-2 border-dashed border-secondary/20 italic text-secondary-foreground shadow-sm"
                                    >
                                        <Sparkles className="mx-auto mb-2 h-5 w-5 text-secondary animate-pulse" />
                                        "{currentAffirmation}"
                                    </motion.div>
                                )}

                                <section className="rounded-3xl border bg-card p-6 shadow-sm">
                                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                        How are you feeling?
                                    </h2>
                                    <div className="flex justify-between gap-2">
                                        {moods.map((mood, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedMood(idx)}
                                                className={cn(
                                                    "flex flex-1 flex-col items-center rounded-2xl p-4 transition-all hover:scale-105",
                                                    selectedMood === idx ? cn(mood.bg, "ring-2 ring-primary shadow-md") : "bg-muted/30"
                                                )}
                                            >
                                                <span className="text-3xl mb-1">{mood.emoji}</span>
                                                <span className="hidden sm:inline text-[10px] uppercase font-medium">{mood.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <CameraCapture />

                                <section className="rounded-3xl border bg-card p-6 shadow-sm">
                                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                        Daily Reflection
                                    </h2>
                                    <textarea
                                        value={journalNote}
                                        onChange={(e) => setJournalNote(e.target.value)}
                                        placeholder="What's on your heart today?"
                                        className="h-32 w-full resize-none rounded-2xl border-none bg-muted/30 p-4 focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                        onClick={handleSaveMood}
                                        disabled={selectedMood === null}
                                        className="mt-4 w-full rounded-2xl bg-primary py-4 font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
                                    >
                                        Save Reflection
                                    </button>
                                </section>

                                {lastLog && (
                                    <div className="rounded-2xl bg-primary/5 p-4 text-center text-xs text-muted-foreground italic">
                                        Last check-in: {new Date(lastLog.timestamp).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "physical" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <RecoveryTracker />
                            </div>
                        )}

                        {activeTab === "mental" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <MentalHealthScreening />
                            </div>
                        )}

                        {activeTab === "support" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <SupportTools />
                            </div>
                        )}

                        {activeTab === "community" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <CommunityForum />
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Floating 3AM Chat Overlay */}
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatePresence>
                    {isChatOpen && (
                        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-[400px]">
                            <AiChat onClose={() => setIsChatOpen(false)} />
                        </div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95",
                        isChatOpen ? "bg-white text-muted-foreground" : "bg-secondary text-secondary-foreground"
                    )}
                >
                    {isChatOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
                    {!isChatOpen && (
                        <div className="absolute -top-1 -right-1 flex h-6 w-12 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-bounce">
                            3AM AI
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
