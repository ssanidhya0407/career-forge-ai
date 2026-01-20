"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getFeedback } from "@/lib/api";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, ArrowRight, Award, Trophy, Info } from "lucide-react";
import Link from "next/link";

interface FeedbackData {
    score: number;
    strengths: string[];
    improvements: string[];
    summary: string;
}

function ReportContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [data, setData] = useState<FeedbackData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            getFeedback(sessionId)
                .then((res) => {
                    console.log("Feedback res:", res);
                    // Handle string response or structured
                    if (typeof res === 'string') {
                        // Basic parsing or assuming it's JSON text if not typed
                        // For now assuming existing structure logic or adjust if backend changed
                        setData(JSON.parse(res));
                    } else {
                        setData(res);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [sessionId]);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Generating comprehensive analysis...</p>
        </div>
    );

    if (!data) return <div className="min-h-screen bg-background flex items-center justify-center">Failed to load report.</div>;

    return (
        <div className="min-h-screen bg-secondary/30 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-4 rounded-full bg-yellow-500/10 mb-6"
                    >
                        <Trophy className="w-12 h-12 text-yellow-500" />
                    </motion.div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Interview Complete</h1>
                    <p className="text-muted-foreground text-lg">Here is your performance breakdown.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Score Card - Big */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="md:col-span-1 glass-card bg-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <span className="text-7xl font-bold tracking-tighter text-foreground">{data.score}</span>
                            <span className="text-xl text-muted-foreground font-medium">/100</span>
                            <p className="mt-4 font-semibold text-primary">Score</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    </motion.div>

                    {/* Summary Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 glass-card bg-card p-8 flex flex-col justify-center"
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-500" /> Executive Summary
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {data.summary}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Strengths */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card bg-card p-8"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-600">
                            <Award className="w-6 h-6" /> Key Strengths
                        </h3>
                        <ul className="space-y-4">
                            {data.strengths.map((str, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-foreground/90">{str}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Improvements */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card bg-card p-8"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-600">
                            <AlertCircle className="w-6 h-6" /> Areas to Improve
                        </h3>
                        <ul className="space-y-4">
                            {data.improvements.map((imp, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 shrink-0" />
                                    <span className="text-foreground/90">{imp}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                <div className="mt-16 text-center">
                    <Link href="/setup">
                        <button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-lg flex items-center gap-2 mx-auto">
                            Start New Session <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading Report...</div>}>
            <ReportContent />
        </Suspense>
    );
}
