"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.button
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full p-1 transition-colors ${isDark ? "bg-zinc-800" : "bg-blue-100"
                } ${className}`}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${isDark ? "bg-zinc-700" : "bg-white"
                    }`}
                animate={{
                    left: isDark ? "4px" : "calc(100% - 28px)"
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
                {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-blue-300" />
                ) : (
                    <Sun className="w-3.5 h-3.5 text-yellow-500" />
                )}
            </motion.div>

            <span className="sr-only">Toggle theme</span>
        </motion.button>
    );
}

export function ThemeToggleButton({ className }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-colors ${isDark
                    ? "bg-white/5 hover:bg-white/10 text-white"
                    : "bg-black/5 hover:bg-black/10 text-black"
                } ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.3 }}
            >
                {isDark ? (
                    <Moon className="w-5 h-5" />
                ) : (
                    <Sun className="w-5 h-5" />
                )}
            </motion.div>
        </motion.button>
    );
}
