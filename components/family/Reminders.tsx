"use client";

import { Bell, Heart, Coffee, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const reminderData = [
    {
        time: "Morning",
        label: "Tell her she's doing great.",
        icon: <Heart className="h-4 w-4 text-pink-500" />,
        action: "Send Encouragement",
        text: "You are doing an incredible job. I'm so proud of you!",
    },
    {
        time: "Afternoon",
        label: "Offer baby-duty for 30 minutes.",
        icon: <Coffee className="h-4 w-4 text-orange-500" />,
        action: "Remind Me",
        text: "Checking in to see if you need some quiet time while I take the baby!",
    },
    {
        time: "Evening",
        label: "Ask how she's really feeling.",
        icon: <Bell className="h-4 w-4 text-blue-500" />,
        action: "Set Check-in",
        text: "I love you. How was your heart today? I'm here to listen.",
    },
];

export function Reminders() {
    const handleAction = (text: string) => {
        const notifications = JSON.parse(localStorage.getItem("bloom_notifications") || "[]");
        notifications.push({
            text,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        });
        localStorage.setItem("bloom_notifications", JSON.stringify(notifications));
        // Simple visual feedback
        alert("Encouragement sent to her dashboard! 🌸");
    };

    return (
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <Bell className="h-5 w-5 text-primary" />
                Proactive Reminders
            </h2>
            <div className="space-y-4">
                {reminderData.map((reminder, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-2xl bg-muted/20 p-4 transition-all hover:bg-muted/30">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                                {reminder.icon}
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{reminder.time}</span>
                                <p className="text-sm font-medium">{reminder.label}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleAction(reminder.text)}
                            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                            {reminder.action}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/20 p-4 text-xs text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                Awareness reduces isolation.
            </div>
        </div>
    );
}
