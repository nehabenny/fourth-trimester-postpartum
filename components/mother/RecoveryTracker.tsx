"use client";

import { AlertTriangle, Thermometer, Droplets, HeartPulse, Moon, UtensilsCrossed } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const physicalChecklist = [
    { id: "fever", label: "Fever 🤒", icon: <Thermometer className="h-4 w-4" /> },
    { id: "bleeding", label: "Excess Bleeding 🩸", icon: <Droplets className="h-4 w-4" /> },
    { id: "pain_c", label: "C-Section Pain 🤕", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "pain_b", label: "Breast Pain 🤱", icon: <HeartPulse className="h-4 w-4" /> },
];

export function RecoveryTracker() {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [sleepHours, setSleepHours] = useState(4);
    const [appetite, setAppetite] = useState("Normal");
    const [showUrgentAlert, setShowUrgentAlert] = useState(false);

    useEffect(() => {
        // Red flag logic: Fever + Bleeding + Any Pain = urgent alert
        const hasFever = selectedSymptoms.includes("fever");
        const hasBleeding = selectedSymptoms.includes("bleeding");
        const hasPain = selectedSymptoms.includes("pain_c") || selectedSymptoms.includes("pain_b");
        const isExhausted = sleepHours <= 3; // "hitting a physical limit"

        if (hasFever && hasBleeding && hasPain) {
            setShowUrgentAlert(true);
        } else {
            setShowUrgentAlert(false);
        }

        // Silent SOS Wow: Sleep <= 3 + Any Pain
        const hasSilentSOS = isExhausted && hasPain;

        // Save to localStorage specifically for Family Mode to see
        localStorage.setItem("physical_status", JSON.stringify({
            symptoms: selectedSymptoms,
            sleep: sleepHours,
            appetite,
            isUrgent: hasFever && hasBleeding && hasPain,
            hasSilentSOS
        }));
    }, [selectedSymptoms, sleepHours, appetite]);

    const toggleSymptom = (id: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            {showUrgentAlert && (
                <div className="flex animate-pulse items-start gap-3 rounded-2xl bg-red-600 p-4 text-white shadow-lg">
                    <AlertTriangle className="h-6 w-6 shrink-0" />
                    <div>
                        <p className="font-bold">Urgent Alert Identified</p>
                        <p className="text-sm opacity-90">Please contact your doctor or local health provider immediately.</p>
                    </div>
                </div>
            )}

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <HeartPulse className="h-5 w-5 text-pink-500" />
                    Physical Check-in
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    {physicalChecklist.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => toggleSymptom(item.id)}
                            className={cn(
                                "flex items-center gap-2 rounded-xl border p-3 text-sm transition-all",
                                selectedSymptoms.includes(item.id)
                                    ? "border-primary bg-primary/10 text-primary-foreground font-medium"
                                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Moon className="h-4 w-4 text-blue-400" />
                                Sleep Hours 😴
                            </label>
                            <span className="text-lg font-bold text-primary">{sleepHours}h</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="12"
                            step="1"
                            value={sleepHours}
                            onChange={(e) => setSleepHours(parseInt(e.target.value))}
                            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-3 flex items-center gap-2 text-sm font-medium">
                            <UtensilsCrossed className="h-4 w-4 text-orange-400" />
                            Appetite 🍽️
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {["None", "Low", "Normal", "Good"].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setAppetite(level)}
                                    className={cn(
                                        "rounded-xl border py-2 text-xs transition-all",
                                        appetite === level
                                            ? "border-secondary bg-secondary/20 text-secondary-foreground font-semibold"
                                            : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
