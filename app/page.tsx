"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Users, LogIn, UserPlus, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [step, setStep] = useState<"CHOICE" | "AUTH">("CHOICE");
  const [selectedMode, setSelectedMode] = useState<"MOTHER" | "FAMILY" | null>(null);

  const handleSelect = (mode: "MOTHER" | "FAMILY") => {
    setSelectedMode(mode);
    setStep("AUTH");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-5xl text-center z-10">
        {step === "CHOICE" ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="mb-16 space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-xl text-primary border border-primary/10">
                <Sparkles className="h-10 w-10" />
              </div>
              <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
                Bloom <span className="text-primary italic">Portal</span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed">
                Welcome to your postpartum support ecosystem. <br />
                <span className="font-semibold text-foreground">Who are you entering as today?</span>
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 max-w-4xl mx-auto">
              {/* Bloom Mode Card */}
              <div
                onClick={() => handleSelect("MOTHER")}
                className="group relative cursor-pointer overflow-hidden rounded-[3rem] border-2 border-transparent bg-white p-12 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 active:scale-[0.98]"
              >
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:rotate-12">
                  <Heart className="h-12 w-12" />
                </div>
                <h2 className="text-4xl font-bold mb-4">Bloom Mode</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  For mothers focusing on recovery, health, and 24/7 AI support.
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Select <span className="text-2xl">→</span>
                </div>
              </div>

              {/* Bloom Circle Card */}
              <div
                onClick={() => handleSelect("FAMILY")}
                className="group relative cursor-pointer overflow-hidden rounded-[3rem] border-2 border-transparent bg-white p-12 transition-all duration-300 hover:border-secondary/30 hover:shadow-2xl hover:shadow-secondary/10 active:scale-[0.98]"
              >
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-secondary/10 text-secondary transition-transform group-hover:scale-110 group-hover:rotate-12">
                  <Users className="h-12 w-12" />
                </div>
                <h2 className="text-4xl font-bold mb-4">Bloom Circle</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  For partners and family dedicated to her journey and care items.
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 font-bold text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                  Select <span className="text-2xl">→</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-md mx-auto">
            <button
              onClick={() => setStep("CHOICE")}
              className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Choice
            </button>

            <div className={cn(
              "rounded-[3rem] border bg-white p-12 shadow-2xl transition-all",
              selectedMode === "MOTHER" ? "border-primary/20 shadow-primary/5" : "border-secondary/20 shadow-secondary/5"
            )}>
              <div className={cn(
                "mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem]",
                selectedMode === "MOTHER" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
              )}>
                {selectedMode === "MOTHER" ? <Heart className="h-10 w-10" /> : <Users className="h-10 w-10" />}
              </div>

              <h2 className="text-3xl font-bold mb-2">
                {selectedMode === "MOTHER" ? "Bloom Mode" : "Bloom Circle"}
              </h2>
              <p className="text-muted-foreground mb-10 italic">
                {selectedMode === "MOTHER" ? "Recovery starts here." : "Support starts here."}
              </p>

              <div className="space-y-4">
                <Link
                  href={`/login?mode=${selectedMode}`}
                  className={cn(
                    "flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold transition-all shadow-lg active:scale-95",
                    selectedMode === "MOTHER"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-secondary/20"
                  )}
                >
                  <LogIn className="h-5 w-5" /> Log In
                </Link>
                <Link
                  href={`/register?mode=${selectedMode}`}
                  className={cn(
                    "flex w-full items-center justify-center gap-3 rounded-2xl border-2 py-4 text-lg font-bold transition-all hover:bg-muted/30 active:scale-95",
                    selectedMode === "MOTHER" ? "border-primary text-primary hover:border-primary/50" : "border-secondary text-secondary hover:border-secondary/50"
                  )}
                >
                  <UserPlus className="h-5 w-5" /> Create Account
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 text-muted-foreground text-sm font-medium opacity-50">
          ✨ Postpartum care redefined.
        </div>
      </div>
    </div>
  );
}
