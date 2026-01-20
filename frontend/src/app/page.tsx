"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageSquare, BarChart3, Clock, BrainCircuit, ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-foreground">

      {/* Navbar - Sticky Glass */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto glass rounded-full px-6 py-3 flex justify-between items-center shadow-lg shadow-black/5">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="font-semibold text-lg tracking-tight">CareerForge.ai</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
          </div>
          <Link href="/setup">
            <button className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
              Start Interview <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold mb-8 border border-border/50"
        >
          <BrainCircuit className="w-3 h-3 text-primary" />
          <span>Powered by Llama 3.3 70B</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
        >
          Master your interview. <br className="hidden md:block" />
          <span className="text-gradient">Land your dream job.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed"
        >
          An intelligent AI coach that simulates realistic technical interviews, provides instant feedback, and helps you refine your answers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link href="/setup">
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:brightness-110 transition-all shadow-[0_0_40px_-10px_var(--color-primary)] hover:shadow-[0_0_60px_-10px_var(--color-primary)] flex items-center justify-center gap-2">
              Start Free Practice <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-semibold text-lg hover:bg-secondary/80 transition-all">
            View Sample Report
          </button>
        </motion.div>
      </section>

      {/* Feature Grid (Bento Style) */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Real-time Chat - Large span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 glass-card p-10 flex flex-col justify-between h-[400px] relative overflow-hidden group"
          >
            <div className="z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Questions that matter</h3>
              <p className="text-muted-foreground max-w-md">Our AI adapts to your role and experience level, asking role-specific technical and behavioral questions just like a real hiring manager.</p>
            </div>
            {/* Visual Abstract */}
            <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          </motion.div>

          {/* Card 2: Instant Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-10 flex flex-col justify-between h-[400px] bg-secondary/30"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Analysis</h3>
              <p className="text-muted-foreground">Get detailed feedback on clarity, technical accuracy, and tone immediately after your session.</p>
            </div>
          </motion.div>

          {/* Card 3: Role Specific */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-10 flex flex-col justify-between h-[300px]"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tailored Roles</h3>
              <p className="text-muted-foreground text-sm">Frontend, Backend, PM, Design - we cover it all.</p>
            </div>
          </motion.div>

          {/* Card 4: Quick & Efficient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 glass-card p-10 flex items-center justify-between h-[300px]"
          >
            <div className="max-w-md">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Practice anytime, anywhere.</h3>
              <p className="text-muted-foreground">No scheduling required. Start a 15-minute mock interview whenever you have a break.</p>
            </div>
            <div className="hidden md:block w-32 h-32 bg-gradient-to-tr from-pink-500/20 to-red-500/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-muted-foreground border-t border-border/50">
        <p>© 2026 CareerForge.ai. Built for ambitious professionals.</p>
      </footer>
    </div>
  );
}
