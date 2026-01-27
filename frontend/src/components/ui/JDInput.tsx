"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Link2, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { parseJobDescription } from "@/lib/api";
import clsx from "clsx";

interface JDInputProps {
    onJDParsed: (context: string, parsed: any) => void;
    className?: string;
}

export function JDInput({ onJDParsed, className }: JDInputProps) {
    const [mode, setMode] = useState<"text" | "url">("text");
    const [value, setValue] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const [isParsed, setIsParsed] = useState(false);
    const [parsedData, setParsedData] = useState<any>(null);

    const handleParse = async () => {
        if (!value.trim()) return;

        setIsParsing(true);
        try {
            const result = await parseJobDescription(value);
            setParsedData(result.parsed);
            onJDParsed(result.context, result.parsed);
            setIsParsed(true);
        } catch (error) {
            console.error("JD parse error:", error);
        } finally {
            setIsParsing(false);
        }
    };

    const handleClear = () => {
        setValue("");
        setIsParsed(false);
        setParsedData(null);
        onJDParsed("", null);
    };

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setMode("text")}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                        mode === "text"
                            ? "bg-primary/20 text-primary"
                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                >
                    <FileText className="w-4 h-4" />
                    Paste Text
                </button>
                <button
                    onClick={() => setMode("url")}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                        mode === "url"
                            ? "bg-primary/20 text-primary"
                            : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                >
                    <Link2 className="w-4 h-4" />
                    From URL
                </button>
            </div>

            {isParsed && parsedData ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Job Description Analyzed</span>
                        </div>
                        <button
                            onClick={handleClear}
                            className="text-sm text-muted-foreground hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                    </div>

                    {parsedData.title && (
                        <p className="text-lg font-semibold mb-2">{parsedData.title}</p>
                    )}

                    {parsedData.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {parsedData.skills.slice(0, 8).map((skill: string, i: number) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}

                    {parsedData.experience_level && (
                        <p className="text-sm text-muted-foreground mt-3">
                            Level: {parsedData.experience_level}
                        </p>
                    )}
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {mode === "text" ? (
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Paste the full job description here..."
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-primary/50 placeholder:text-white/30"
                        />
                    ) : (
                        <input
                            type="url"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="https://linkedin.com/jobs/..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/30"
                        />
                    )}

                    <motion.button
                        onClick={handleParse}
                        disabled={!value.trim() || isParsing}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/20 text-primary font-medium hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        {isParsing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Analyze Job Description
                            </>
                        )}
                    </motion.button>
                </div>
            )}
        </div>
    );
}
