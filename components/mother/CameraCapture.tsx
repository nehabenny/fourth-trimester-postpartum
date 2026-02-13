"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCcw, Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CameraCapture() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            });
            setStream(mediaStream);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please ensure permissions are granted.");
        }
    };

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL("image/jpeg");
            setPreviewImage(imageData);
            stopCamera();
        }
    };

    const analyzeImage = async () => {
        if (!previewImage) return;
        setIsAnalyzing(true);
        try {
            console.log("Nurse Vision: Sending analysis request...");
            const response = await fetch("/api/nurse-vision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: previewImage.split(",")[1] }), // Send base64 without prefix
            });
            const data = await response.json();
            console.log("Nurse Vision: Received data from API:", data);

            if (data.error) {
                alert("Nurse Vision Error: " + data.error);
                setAnalysis(null);
            } else {
                setAnalysis(data);
            }
        } catch (err) {
            console.error("Nurse Vision: Analysis error:", err);
            alert("Failed to reach the AI Nurse. Please check your connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Camera className="h-5 w-5 text-indigo-500" />
                Nurse AI Vision
            </h2>

            <p className="mb-6 text-sm text-muted-foreground">
                Snap a photo of your meal or yourself. Our AI nurse will check your nutrition or signs of fatigue.
            </p>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted/30 border-2 border-dashed border-muted">
                {stream ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                    />
                ) : previewImage ? (
                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4">
                        <Camera className="h-12 w-12 text-muted-foreground/50" />
                        <button
                            onClick={startCamera}
                            className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105"
                        >
                            Open Camera
                        </button>
                    </div>
                )}

                {stream && (
                    <button
                        onClick={capturePhoto}
                        className="absolute bottom-4 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border-4 border-white bg-red-500 shadow-xl transition-transform active:scale-95"
                    />
                )}

                {(stream || previewImage) && !isAnalyzing && (
                    <button
                        onClick={() => { setPreviewImage(null); stopCamera(); setAnalysis(null); }}
                        className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {previewImage && !analysis && !isAnalyzing && (
                <button
                    onClick={analyzeImage}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-4 font-bold text-secondary-foreground shadow-lg transition-all hover:opacity-90"
                >
                    <Sparkles className="h-5 w-5" />
                    Analyze as Nurse AI
                </button>
            )}

            {isAnalyzing && (
                <div className="mt-6 flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium animate-pulse">Nurse is reviewing your photo...</p>
                </div>
            )}

            {analysis && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-2xl border bg-primary/5 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                                AI Nurse Insight
                            </span>
                            {analysis.fatigue_index !== undefined && (
                                <span className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                    analysis.fatigue_index > 7 ? "bg-red-500 text-white" : "bg-green-500 text-white"
                                )}>
                                    Fatigue: {analysis.fatigue_index}/10
                                </span>
                            )}
                        </div>
                        <p className="text-sm italic leading-relaxed">"{analysis.ai_insight_text}"</p>
                    </div>
                    <button
                        onClick={() => { setPreviewImage(null); setAnalysis(null); }}
                        className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                    >
                        <RefreshCcw className="h-3 w-3" />
                        Take Another Photo
                    </button>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
