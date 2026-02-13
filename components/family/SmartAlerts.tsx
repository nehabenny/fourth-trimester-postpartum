"use client";

import { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Heart, Sparkles, Wind, Camera, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function SmartAlerts() {
    const [motherLog, setMotherLog] = useState<any>(null);
    const [physicalStatus, setPhysicalStatus] = useState<any>(null);
    const [mentalScore, setMentalScore] = useState<number | null>(null);
    const [sentimentPulse, setSentimentPulse] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isBreathing, setIsBreathing] = useState(false);
    const [nurseLog, setNurseLog] = useState<any>(null);

    useEffect(() => {
        const updateStates = () => {
            try {
                const log = localStorage.getItem("mother_log");
                const physical = localStorage.getItem("physical_status");
                const mental = localStorage.getItem("mental_health_score");
                const history = localStorage.getItem("journal_history");
                const breathing = localStorage.getItem("is_breathing");

                if (log) setMotherLog(JSON.parse(log));
                if (physical) setPhysicalStatus(JSON.parse(physical));
                if (mental) setMentalScore(parseInt(mental));
                setIsBreathing(breathing === "true");

                if (history && !sentimentPulse && !isAnalyzing) {
                    analyzeSentiment(JSON.parse(history));
                }
            } catch (e) {
                console.error("Error updating states from storage", e);
            }
        };

        const fetchNurseLogs = async () => {
            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data && !error) {
                setNurseLog(data);
            }
        };

        updateStates();
        fetchNurseLogs();

        // Sync every 3 seconds to catch changes in the same tab or other tabs
        const interval = setInterval(() => {
            updateStates();
            fetchNurseLogs();
        }, 3000);

        window.addEventListener("storage", updateStates);
        return () => {
            window.removeEventListener("storage", updateStates);
            clearInterval(interval);
        };
    }, [sentimentPulse, isAnalyzing]);

    const analyzeSentiment = async (history: any[]) => {
        setIsAnalyzing(true);
        try {
            const res = await fetch("/api/sentiment", {
                method: "POST",
                body: JSON.stringify({ history }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (data && !data.error) {
                setSentimentPulse(data);
            }
        } catch (e) {
            console.error("Failed to analyze sentiment", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getAlert = () => {
        const symptoms = physicalStatus?.symptoms || [];
        const hasFever = symptoms.includes("fever");
        const hasBleeding = symptoms.includes("bleeding");
        const hasPain = symptoms.includes("pain_c") || symptoms.includes("pain_b");

        // Priority -1. Nurse AI Urgent/Caution
        if (nurseLog?.alert_level === 'urgent' || nurseLog?.alert_level === 'caution') {
            return {
                type: nurseLog.alert_level.toUpperCase(),
                level: nurseLog.alert_level === 'urgent' ? 'red' : 'amber',
                title: nurseLog.ai_analysis_type === 'exhaustion' ? "High Fatigue Detected" : "Nutritional Alert",
                message: nurseLog.ai_insight_text,
                suggestions: nurseLog.ai_analysis_type === 'exhaustion'
                    ? ["Take over the next feed", "Let her sleep for 4+ hours", "Monitor for burnout"]
                    : ["Ensure she eats her meal", "Hydrate her", "Check if she needs more iron"],
                icon: <AlertTriangle className="h-6 w-6" />,
            };
        }

        // 0. URGENT Physical Red Flag (Fever + Bleeding + Pain)
        if (physicalStatus?.isUrgent) {
            return {
                type: "URGENT",
                level: "red",
                title: "Immediate Action Required",
                message: "Severe physical symptoms logged together (fever, bleeding, and pain).",
                suggestions: ["Call her doctor immediately", "Ensure she is resting", "Take over all duties"],
                icon: <AlertCircle className="h-6 w-6" />,
            };
        }

        // 0.5 Silent SOS (Wow Feature) - Sleep <= 3 + Pain
        if (physicalStatus?.hasSilentSOS) {
            return {
                type: "ACTION REQUIRED",
                level: "amber",
                title: "Silent SOS: Physical Limit",
                message: "Mom is hitting a severe physical limit (extreme exhaustion + active pain).",
                suggestions: [
                    "Take the baby for 2+ hours immediately",
                    "Ensure she reaches REM sleep",
                    "Do not wake her for anything"
                ],
                icon: <AlertTriangle className="h-6 w-6" />,
            };
        }

        // NEW 1. Independent Fever or Bleeding Alert
        if (hasFever || hasBleeding) {
            return {
                type: "MEDICAL CAUTION",
                level: "amber",
                title: hasFever ? "Fever Detected" : "Excess Bleeding Noted",
                message: "A significant postpartum red flag symptom was logged. Monitor closely.",
                suggestions: ["Consult her discharge instructions", "Check her temperature again in 1hr", "Ensure she is hydrated"],
                icon: <AlertCircle className="h-6 w-6" />,
            };
        }

        // NEW 2. Independent Pain Alert
        if (hasPain) {
            return {
                type: "PAIN MANAGEMENT",
                level: "amber",
                title: "Active Pain Logged",
                message: "She is experiencing significant physical pain (C-section or Breast).",
                suggestions: ["Prep a heating pad or ice pack", "Check her medication schedule", "Bring her a glass of water"],
                icon: <HeartPulse className="h-6 w-6" />,
            };
        }

        // 3. High Emotional Distress (PPD Screening)
        if (mentalScore && mentalScore >= 11) {
            return {
                type: "HIGH SUPPORT",
                level: "red",
                title: "Emotional Support Needed",
                message: "Her wellness screening indicates she is struggling emotionally right now.",
                suggestions: ["Ask how she's really feeling", "Listen without judgment", "Book a professional consult"],
                icon: <AlertTriangle className="h-6 w-6" />,
            };
        }

        // NEW 4. Appetite Alert
        if (physicalStatus?.appetite === "None" || physicalStatus?.appetite === "Low") {
            return {
                type: "NUTRITION",
                level: "yellow",
                title: "Low Appetite Noted",
                message: "She isn't eating much today. Recovery requires fuel.",
                suggestions: ["Bring her small, nutrient-dense snacks", "Make her a protein smoothie", "Ensure she has easy-to-reach food"],
                icon: <Info className="h-6 w-6" />,
            };
        }

        // 5. Mood Alert (Fixed logic: if mood is great/good, it shouldn't show)
        if (motherLog && (motherLog.mood === 0 || motherLog.mood === 1)) {
            return {
                type: "CAUTION",
                level: "yellow",
                title: "Mood Dip Noted",
                message: motherLog.note
                    ? `She's feeling low today. She shared: "${motherLog.note}"`
                    : "She's logged a low mood. She needs a little extra love today.",
                suggestions: ["Make her favorite tea", "Take the baby for a 30m walk", "Offer a warm bath"],
                icon: <Info className="h-6 w-6" />,
            };
        }

        // 6. Normal / Good
        return {
            type: "STABLE",
            level: "green",
            title: "Doing Well",
            message: "Everything looks stable! She's doing an amazing job, and so are you.",
            suggestions: ["Tell her she's a great mom", "Prepare a healthy snack"],
            icon: <CheckCircle className="h-6 w-6" />,
        };
    };

    const alert = getAlert();

    const levelColors: Record<string, string> = {
        red: "bg-red-50 border-red-200 text-red-900",
        amber: "bg-amber-50 border-amber-200 text-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        yellow: "bg-orange-50 border-orange-200 text-orange-900",
        green: "bg-green-50 border-green-200 text-green-900",
    };

    const iconColors: Record<string, string> = {
        red: "text-red-600",
        amber: "text-amber-600",
        yellow: "text-orange-500",
        green: "text-green-600",
    };

    return (
        <div className="space-y-4">
            {/* 3AM Breathing Sync (Wow Feature 3) */}
            {isBreathing && (
                <div className="flex animate-pulse items-center gap-3 rounded-2xl bg-blue-500 p-4 text-white shadow-lg shadow-blue-500/20">
                    <Wind className="h-6 w-6 shrink-0" />
                    <div>
                        <p className="text-sm font-bold tracking-tight">Mom is practicing mindfulness right now.</p>
                        <p className="text-[10px] opacity-90 uppercase font-medium">Please keep the house quiet and supportive.</p>
                    </div>
                </div>
            )}

            <div className={cn("rounded-3xl border-2 p-6 shadow-sm transition-all", levelColors[alert.level])}>
                <div className="mb-4 flex items-center gap-3">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm", iconColors[alert.level] || "text-primary")}>
                        {alert.icon}
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{alert.type}</span>
                        <h2 className="text-xl font-bold">{alert.title}</h2>
                    </div>
                </div>

                <p className="mb-6 text-sm leading-relaxed opacity-90">
                    {alert.message}
                </p>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-60">
                        <Heart className="h-3 w-3" />
                        Suggested Support
                    </div>
                    <div className="grid gap-2">
                        {alert.suggestions.map((s, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                                <div className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    alert.level === 'red' ? 'bg-red-500' :
                                        alert.level === 'amber' ? 'bg-amber-500' :
                                            alert.level === 'yellow' ? 'bg-orange-400' : 'bg-green-500'
                                )} />
                                {s}
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Sentiment Pulse Pulse (Wow Feature 2) */}
                {sentimentPulse && (
                    <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-5 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">AI Sentiment Pulse</h3>
                            </div>
                            <div className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                sentimentPulse.burnout_risk === "high" ? "bg-red-500 text-white" :
                                    sentimentPulse.burnout_risk === "medium" ? "bg-amber-500 text-white" : "bg-green-500 text-white"
                            )}>
                                {sentimentPulse.burnout_risk} Risk
                            </div>
                        </div>

                        <p className="mb-4 text-sm font-medium leading-relaxed italic text-foreground/80">
                            "{sentimentPulse.analysis_summary}"
                        </p>

                        <div className="flex items-start gap-3 rounded-xl bg-white/50 p-3 text-xs shadow-sm">
                            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Info className="h-3 w-3" />
                            </div>
                            <div>
                                <p className="font-bold text-primary">Suggested Intervention:</p>
                                <p className="text-muted-foreground">{sentimentPulse.suggested_intervention}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Nurse Vision (Wow Feature 4) */}
                {nurseLog && (
                    <div className="mt-4 rounded-2xl border-2 border-dashed border-indigo-500/20 bg-indigo-500/5 p-5 animate-in fade-in slide-in-from-top-4 duration-700">
                        {console.log("SmartAlerts: Rendering Nurse Log:", nurseLog)}
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4 text-indigo-500" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900">Nurse AI Vision</h3>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-indigo-500/60">
                                {new Date(nurseLog.created_at).toLocaleTimeString()}
                            </span>
                        </div>

                        <p className="mb-4 text-sm font-medium leading-relaxed italic text-indigo-900/80">
                            "{nurseLog.ai_insight_text || "Analysis complete. Click for more details."}"
                        </p>

                        {nurseLog.fatigue_index && (
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 flex-1 rounded-full bg-indigo-100 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-1000",
                                            nurseLog.fatigue_index > 7 ? "bg-red-500" : "bg-indigo-500"
                                        )}
                                        style={{ width: `${nurseLog.fatigue_index * 10}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-indigo-500">Fatigue Index: {nurseLog.fatigue_index}/10</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
