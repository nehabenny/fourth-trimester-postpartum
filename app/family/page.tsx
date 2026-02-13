"use client";

import { Info, ShieldAlert, Heart, Users, BookOpen, CheckSquare, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CareChecklist } from "@/components/family/CareChecklist";
import { SmartAlerts } from "@/components/family/SmartAlerts";
import { Reminders } from "@/components/family/Reminders";

const awarenessCards = [
    {
        title: "What is PPD?",
        content: "Postpartum depression is more than just 'baby blues.' It's a serious but treatable medical condition involving feelings of extreme sadness, anxiety, and exhaustion.",
        icon: <Info className="h-4 w-4 text-blue-500" />,
    },
    {
        title: "Hormonal Shifts",
        content: "After birth, the rapid drop in estrogen and progesterone can trigger chemical changes in the brain that result in significant mood swings.",
        icon: <Heart className="h-4 w-4 text-pink-500" />,
    },
    {
        title: "Signs of Distress",
        content: "Watch for withdrawal from family, loss of appetite, inability to sleep even when the baby is sleeping, or intense irritability.",
        icon: <ShieldAlert className="h-4 w-4 text-orange-500" />,
    },
    {
        title: "How to Help",
        content: "Offer practical help (dishes, laundry), ensure she eats, encourage sleep, and listen without judgment. You are her primary support line.",
        icon: <Users className="h-4 w-4 text-green-500" />,
    },
];

export default function FamilyPage() {
    const [activeTab, setActiveTab] = useState<"alerts" | "checklist" | "learn" | "community">("alerts");
    const [isSOS, setIsSOS] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const role = localStorage.getItem("user_role");
        if (!token || role !== "FAMILY") {
            router.push("/login?error=unauthorized");
        }
    }, [router]);

    useEffect(() => {
        const checkSOS = () => {
            const physical = localStorage.getItem("physical_status");
            if (physical) {
                const data = JSON.parse(physical);
                setIsSOS(!!data.hasSilentSOS);
            }
        };
        checkSOS();
        // Listen for storage changes if they happen in another tab
        window.addEventListener('storage', checkSOS);
        return () => window.removeEventListener('storage', checkSOS);
    }, []);

    const tabs = [
        { id: "alerts", label: "Live Alerts", icon: <ShieldAlert className="h-4 w-4" /> },
        { id: "checklist", label: "Care Guide", icon: <CheckSquare className="h-4 w-4" /> },
        { id: "learn", label: "Awareness", icon: <BookOpen className="h-4 w-4" /> },
        { id: "community", label: "Community", icon: <Users className="h-4 w-4" /> },
    ];

    return (
        <div className={cn(
            "min-h-[calc(100vh-64px)] transition-all duration-1000",
            isSOS ? "bg-amber-500/20 animate-pulse" : "bg-muted/20"
        )}>
            <div className="container mx-auto flex flex-col md:flex-row gap-8 px-4 py-8">

                {/* Desktop Sidebar Navigation */}
                <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2">
                    <div className="mb-6 px-4">
                        <h1 className="font-serif text-2xl font-bold italic text-secondary-foreground">Bloom Circle</h1>
                        <p className="text-xs text-muted-foreground italic">Support for her, awareness for you.</p>
                    </div>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all",
                                activeTab === tab.id
                                    ? "bg-secondary text-secondary-foreground font-bold shadow-md shadow-secondary/20"
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

                {/* Mobile Tab Navigation */}
                <nav className="md:hidden sticky top-16 z-40 flex w-full border-b bg-background/80 px-2 py-2 backdrop-blur-md">
                    <div className="flex w-full justify-around">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all",
                                    activeTab === tab.id
                                        ? "bg-secondary/10 text-secondary-foreground font-bold"
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
                        <h1 className="font-serif text-3xl font-bold italic text-secondary-foreground">Bloom Circle</h1>
                        <p className="text-muted-foreground">Support for her, awareness for you.</p>
                    </div>

                    <div className="pb-20">
                        {activeTab === "alerts" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <SmartAlerts />
                                <Reminders />
                            </div>
                        )}

                        {activeTab === "checklist" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <CareChecklist />
                            </div>
                        )}

                        {activeTab === "learn" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-2xl font-bold px-2">Understanding Postpartum</h2>
                                <div className="grid gap-4">
                                    {awarenessCards.map((card, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-3xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                                        >
                                            <div className="mb-3 flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30">
                                                    {card.icon}
                                                </div>
                                                <h3 className="text-lg font-bold">{card.title}</h3>
                                            </div>
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                {card.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="rounded-3xl bg-secondary/10 p-8 text-center border-2 border-dashed border-secondary/20">
                                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-secondary/40" />
                                    <h3 className="mb-2 font-bold">More Resources Coming soon</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We're building a directory of local clinics and support groups.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "community" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="rounded-3xl bg-gradient-to-br from-secondary/20 to-secondary/5 p-8 text-center border-2 border-secondary/20 shadow-xl">
                                    <Users className="mx-auto mb-6 h-16 w-16 text-secondary animate-pulse" />
                                    <h2 className="text-2xl font-bold mb-4">Bloom Circle Community</h2>
                                    <p className="text-muted-foreground mb-8 leading-relaxed">
                                        Connect with other Bloom Circles, share experiences, and find local support groups in your neighborhood.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/50 p-4 rounded-2xl border border-secondary/10">
                                            <p className="text-lg font-bold text-secondary">12+</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Local Circles</p>
                                        </div>
                                        <div className="bg-white/50 p-4 rounded-2xl border border-secondary/10">
                                            <p className="text-lg font-bold text-secondary">Coming Soon</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Peer Chat</p>
                                        </div>
                                    </div>
                                    <button className="mt-8 w-full bg-secondary text-secondary-foreground py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all">
                                        Join Waiting List
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
