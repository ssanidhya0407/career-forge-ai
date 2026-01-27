"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import clsx from "clsx";

interface TimerProps {
    durationSeconds: number;
    isActive: boolean;
    onTimeout: () => void;
    onTick?: (remaining: number) => void;
}

export function Timer({ durationSeconds, isActive, onTimeout, onTick }: TimerProps) {
    const [remaining, setRemaining] = useState(durationSeconds);

    useEffect(() => {
        setRemaining(durationSeconds);
    }, [durationSeconds]);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeout();
                    return 0;
                }
                const newValue = prev - 1;
                onTick?.(newValue);
                return newValue;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onTimeout, onTick]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const progress = remaining / durationSeconds;

    const isUrgent = remaining <= 30;
    const isCritical = remaining <= 10;

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={clsx(
                "relative flex flex-col items-center justify-center",
                isCritical && "animate-pulse"
            )}
        >
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-white/10"
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={clsx(
                        "transition-colors duration-300",
                        isCritical ? "text-red-500" : isUrgent ? "text-orange-500" : "text-green-500"
                    )}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isCritical ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 mb-1" />
                ) : (
                    <Clock className="w-4 h-4 text-white/50 mb-1" />
                )}
                <span
                    className={clsx(
                        "text-xl font-bold tabular-nums tracking-tight",
                        isCritical ? "text-red-500" : isUrgent ? "text-orange-500" : "text-white"
                    )}
                >
                    {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
            </div>
        </motion.div>
    );
}

export function CompactTimer({ durationSeconds, isActive, onTimeout }: Omit<TimerProps, "onTick">) {
    const [remaining, setRemaining] = useState(durationSeconds);

    useEffect(() => {
        setRemaining(durationSeconds);
    }, [durationSeconds]);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onTimeout]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const isUrgent = remaining <= 30;
    const isCritical = remaining <= 10;

    return (
        <div
            className={clsx(
                "px-3 py-1.5 rounded-full text-sm font-medium tabular-nums flex items-center gap-1.5",
                isCritical
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : isUrgent
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-white/10 text-white/70"
            )}
        >
            <Clock className="w-3.5 h-3.5" />
            {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
    );
}
