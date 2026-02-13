"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

function LoginContent() {
    const searchParams = useSearchParams();
    const initialMode = searchParams.get("mode") === "FAMILY" ? "FAMILY" : "MOTHER";

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [selectedMode, setSelectedMode] = useState<"MOTHER" | "FAMILY">(initialMode);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("registered")) {
            setSuccess("Account created successfully! Please log in.");
        }
        if (searchParams.get("error") === "unauthorized") {
            setError("You don't have permission to access that section. Please log in with the correct account.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const loginData = {
                ...formData,
                username: formData.username.toLowerCase()
            };

            const response = await fetch("http://localhost:8000/api/users/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const data = await response.json();

                // Decode JWT to get role
                const base64Url = data.access.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                const actualRole = decoded.role;

                if (actualRole !== selectedMode) {
                    setError(`This account is for ${actualRole === "MOTHER" ? "Bloom Mode" : "Bloom Circle"}. Please select the correct mode.`);
                    setIsLoading(false);
                    return;
                }

                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);
                localStorage.setItem("user_role", actualRole);

                if (actualRole === "MOTHER") {
                    router.push("/mother");
                } else {
                    router.push("/family");
                }
            } else {
                setError("Invalid username or password.");
            }
        } catch (err) {
            setError("Something went wrong. Is the backend running?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
            <div className="w-full max-w-md space-y-8 rounded-3xl border bg-card p-10 shadow-2xl">
                <div className="text-center">
                    <div className={cn(
                        "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl",
                        selectedMode === "MOTHER" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    )}>
                        <LogIn className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        {selectedMode === "MOTHER" ? "Bloom Mode Login" : "Bloom Circle Login"}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground italic">
                        {selectedMode === "MOTHER" ? "Welcome back, Mother." : "Welcome back to the Circle."}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-500 border border-red-100 italic">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-600 border border-green-100 italic text-center">
                            {success}
                        </div>
                    )}
                    <div className="space-y-4">
                        <input
                            type="text"
                            required
                            placeholder="Username"
                            className="block w-full rounded-2xl border-none bg-muted/50 px-4 py-4 focus:ring-2 focus:ring-primary/20"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            className="block w-full rounded-2xl border-none bg-muted/50 px-4 py-4 focus:ring-2 focus:ring-primary/20"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                            "group relative flex w-full justify-center rounded-2xl py-4 text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50",
                            selectedMode === "MOTHER" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        )}
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    New to Bloom?{" "}
                    <Link href={`/register?mode=${selectedMode}`} className="font-bold text-primary hover:underline transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
