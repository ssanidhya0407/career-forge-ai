"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ChevronRight, Briefcase, GraduationCap, Code, ArrowLeft, BrainCircuit } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default function SetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        role: "Software Engineer",
        experience_level: "Junior",
        topic: "General"
    });

    const handleStart = async () => {
        setLoading(true);
        try {
            const data = await api.post("/api/interview/start", { config });
            router.push(`/interview?session_id=${data.data.session_id}`);
        } catch (error) {
            console.error("Failed to start", error);
            alert("Failed to start interview. Please check backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-foreground relative">

            {/* Navbar - Sticky Glass (Consistent with Landing) */}
            <nav className="fixed top-0 inset-x-0 z-50 px-6 py-4">
                <div className="max-w-5xl mx-auto glass rounded-full px-6 py-3 flex justify-between items-center shadow-lg shadow-black/5">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Logo className="w-8 h-8 text-primary" />
                        <span className="font-semibold text-lg tracking-tight">CareerForge.ai</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full text-xs">
                            <BrainCircuit className="w-3 h-3 text-primary" /> Setup Mode
                        </span>
                    </div>
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </nav>

            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative pt-32 pb-20 px-6 flex flex-col items-center justify-center min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-lg z-10"
                >
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="bg-gradient-to-br from-primary/20 to-blue-500/20 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-primary/10 border border-white/10 backdrop-blur-md"
                        >
                            <Briefcase className="w-10 h-10 text-primary" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gradient">Configure Session</h1>
                        <p className="text-muted-foreground text-lg max-w-sm mx-auto">Customize your AI interviewer persona to match your target role.</p>
                    </div>

                    {/* iOS Grouped Form Style - Enhanced */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="glass-card overflow-hidden shadow-2xl mb-8 ring-1 ring-white/10"
                    >
                        <div className="divide-y divide-border/40">
                            {/* Field 1 */}
                            <div className="h-20 px-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 ring-1 ring-blue-500/20">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-foreground text-base">Target Role</span>
                                </div>
                                <div className="h-full flex items-center">
                                    <select
                                        className="bg-transparent text-right outline-none text-muted-foreground font-medium cursor-pointer group-hover:text-primary transition-colors appearance-none pl-4 pr-0 py-2 text-base"
                                        value={config.role}
                                        onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                    >
                                        <option>Software Engineer</option>
                                        <option>Product Manager</option>
                                        <option>Data Scientist</option>
                                        <option>Designer</option>
                                    </select>
                                </div>
                            </div>

                            {/* Field 2 */}
                            <div className="h-20 px-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 ring-1 ring-green-500/20">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-foreground text-base">Experience</span>
                                </div>
                                <div className="h-full flex items-center">
                                    <select
                                        className="bg-transparent text-right outline-none text-muted-foreground font-medium cursor-pointer group-hover:text-primary transition-colors appearance-none pl-4 pr-0 py-2 text-base"
                                        value={config.experience_level}
                                        onChange={(e) => setConfig({ ...config, experience_level: e.target.value })}
                                    >
                                        <option>Intern</option>
                                        <option>Junior</option>
                                        <option>Mid-Level</option>
                                        <option>Senior</option>
                                    </select>
                                </div>
                            </div>

                            {/* Field 3 */}
                            <div className="h-20 px-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 ring-1 ring-orange-500/20">
                                        <Code className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-foreground text-base">Focus Topic</span>
                                </div>
                                <div className="h-full flex items-center">
                                    <input
                                        className="bg-transparent text-right outline-none text-muted-foreground font-medium placeholder:text-muted-foreground/50 w-48 focus:text-primary transition-colors mobile-input-reset text-base"
                                        value={config.topic}
                                        onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                                        placeholder="General"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.02, textShadow: "0 0 8px rgba(255,255,255,0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-5 rounded-[24px] font-bold text-xl shadow-[0_0_40px_-10px_var(--color-primary)] hover:shadow-[0_0_60px_-10px_var(--color-primary)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                Initializing Session...
                            </span>
                        ) : (
                            <>Start Interview Session <ChevronRight className="w-6 h-6" /></>
                        )}
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}
