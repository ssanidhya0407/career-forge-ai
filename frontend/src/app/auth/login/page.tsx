"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { Mail, Lock, Loader2, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isNavExpanded, setIsNavExpanded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login(email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background Glows (Matching Landing Page) */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Expandable Navbar */}
            <motion.nav
                className="fixed top-8 inset-x-0 z-50 flex justify-center pointer-events-none"
            >
                <motion.div
                    layout
                    className="pointer-events-auto bg-background/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border dark:border-white/10 rounded-full shadow-2xl flex items-center p-2 gap-0 overflow-hidden"
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                >
                    <AnimatePresence mode="popLayout">
                        {isNavExpanded && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="overflow-hidden"
                            >
                                <Link href="/" className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 dark:hover:bg-white/5 transition-colors whitespace-nowrap block mr-2">
                                    Home
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setIsNavExpanded(!isNavExpanded)}
                        className="px-4 py-2 rounded-full text-sm font-medium text-foreground bg-secondary/50 dark:bg-white/10 whitespace-nowrap block hover:bg-secondary/80 transition-colors"
                    >
                        Sign In
                    </button>

                    <AnimatePresence mode="popLayout">
                        {isNavExpanded && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="overflow-hidden"
                            >
                                <Link href="/auth/register" className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 dark:hover:bg-white/5 transition-colors whitespace-nowrap block ml-2">
                                    Sign Up
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.nav>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10 bg-card dark:bg-zinc-900/50 backdrop-blur-md p-8 rounded-[32px] border border-border dark:border-white/10 shadow-xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary dark:bg-white/5 mb-4 border border-border dark:border-white/5">
                        <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to continue your practice</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-secondary/50 dark:bg-black/50 border border-border dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground text-foreground transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-secondary/50 dark:bg-black/50 border border-border dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground text-foreground transition-all"
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-destructive text-sm text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/25"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign In <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </motion.button>
                </form>

                <p className="text-center text-muted-foreground mt-6">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
