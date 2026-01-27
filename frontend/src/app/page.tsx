"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, ChevronRight, FileText, TrendingUp, Users, Mic, BrainCircuit,
  Home as HomeIcon, Settings, User, Briefcase, Award, Zap, ArrowUpRight, CheckCircle2
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/components/AuthProvider";

import clsx from "clsx";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // No auto-redirect - users can view landing page even when logged in

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300">

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(circle,rgba(0,112,243,0.15)_0%,rgba(0,0,0,0)_70%)] blur-[60px]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(circle,rgba(0,112,243,0.1)_0%,rgba(0,0,0,0)_70%)] blur-[80px]" />
      </div>



      {/* Smart Navbar - Collapses to active pill on scroll */}
      <motion.nav
        className="fixed top-8 inset-x-0 z-50 flex justify-center pointer-events-none"
      >
        <motion.div
          className="pointer-events-auto bg-background/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border dark:border-white/10 rounded-full shadow-2xl flex items-center overflow-hidden"
          animate={{
            paddingLeft: hidden ? 12 : 8,
            paddingRight: hidden ? 12 : 8,
            paddingTop: hidden ? 8 : 6,
            paddingBottom: hidden ? 8 : 6,
            gap: hidden ? 0 : 4
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div animate={{ width: hidden ? 0 : "auto", opacity: hidden ? 0 : 1 }} className="overflow-hidden flex items-center gap-1">
            <Link href="/" className="px-4 py-2 rounded-full text-sm font-medium text-foreground bg-secondary/50 dark:bg-white/10 whitespace-nowrap block">
              Home
            </Link>
          </motion.div>

          <motion.div animate={{ width: hidden ? 0 : "auto", opacity: hidden ? 0 : 1 }} className="overflow-hidden">
            <Link href="/setup" className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 dark:hover:bg-white/5 transition-colors whitespace-nowrap block">
              Set your Interview
            </Link>
          </motion.div>


          {/* This pill stays visible when collapsed */}
          <motion.div
            animate={{
              backgroundColor: hidden ? "var(--secondary)" : "transparent",
              paddingLeft: hidden ? 16 : 16,
              paddingRight: hidden ? 16 : 16
            }}
            className="rounded-full flex items-center"
          >
            {isLoggedIn ? (
              <Link href="/dashboard" className="py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap block">
                {hidden ? "Home" : "Profile"}
              </Link>
            ) : (
              <Link href="/auth/register" className="py-2 px-3 rounded-full text-sm font-medium text-foreground bg-secondary/50 dark:bg-white/10 hover:bg-secondary/80 transition-colors whitespace-nowrap block">
                {hidden ? "Home" : "Sign Up"}
              </Link>
            )}
          </motion.div>


        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tight mb-6 leading-[1.05] text-foreground">
            Interview. <br />
            <span className="text-muted-foreground">Redefined.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl font-medium text-muted-foreground mb-12 max-w-xl leading-relaxed"
        >
          Pro-level AI coaching tailored to your story.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-5"
        >
          <Link href="/setup">
            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_30px_-5px_var(--primary)] opacity-90">
              Start Practice
            </button>
          </Link>
          <Link href="#features">
            <button className="px-8 py-4 bg-secondary dark:bg-[#111] text-blue-500 rounded-full font-semibold text-lg hover:bg-secondary/80 dark:hover:bg-[#1a1a1a] transition-colors border border-border dark:border-white/5">
              Learn more
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Bento Grid Features - Exact Match to Images */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            {/* Large Card (Left) - Mimics User Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-3 bg-card dark:bg-[#0C0C0C] rounded-[40px] p-10 flex flex-col justify-between min-h-[500px] border border-border dark:border-white/5 relative group overflow-hidden shadow-sm dark:shadow-none"
            >
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-secondary dark:bg-[#111] mb-8 border border-border dark:border-white/10 overflow-hidden flex items-center justify-center">
                  <Logo className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-4xl font-bold mb-6 leading-tight text-card-foreground">
                  Bridging Resume & <br /> Job Description
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  Unlike generic tools, we build a knowledge graph of your experience and map it directly to the target role's requirements.
                </p>
              </div>

              {/* Bottom Stats */}
              <div className="relative z-10 grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-border dark:border-white/5">
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">5+</div>
                  <div className="text-xs font-bold text-muted-foreground tracking-wider">FORMATS</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-500 mb-1">25+</div>
                  <div className="text-xs font-bold text-muted-foreground tracking-wider">METRICS</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500 mb-1">98%</div>
                  <div className="text-xs font-bold text-muted-foreground tracking-wider">MATCH</div>
                </div>
              </div>

              {/* Background Effect */}
              <div className="absolute right-0 bottom-0 w-full h-full bg-gradient-to-t from-primary/5 to-transparent opacity-50 pointer-events-none" />
            </motion.div>

            {/* List Card (Right) - Mimics Selected Work */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-card dark:bg-[#0C0C0C] rounded-[40px] p-10 flex flex-col border border-border dark:border-white/5 relative shadow-sm dark:shadow-none"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-12 h-12 rounded-full bg-secondary dark:bg-[#151515] flex items-center justify-center text-green-500">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-2">Capabilities</span>
              </div>

              <h3 className="text-2xl font-bold mb-2">Core Features</h3>
              <p className="text-muted-foreground text-sm mb-8">Top tools for your success.</p>

              <div className="flex-1 space-y-4">
                {[
                  { title: "Resume Parsing", subtitle: "Automated Extraction" },
                  { title: "Speech Analysis", subtitle: "Pace & Filler Detection" },
                  { title: "Panel Simulation", subtitle: "HR, Tech & Product Personas" },
                  { title: "Detailed Reports", subtitle: "PDF Export" }
                ].map((item, i) => (
                  <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-secondary dark:bg-[#111] border border-border dark:border-white/5 hover:bg-secondary/80 dark:hover:bg-[#1a1a1a] transition-colors cursor-default">
                    <div>
                      <div className="font-semibold text-sm text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Row - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card dark:bg-[#0C0C0C] rounded-[40px] p-8 border border-border dark:border-white/5 hover:bg-secondary/50 dark:hover:bg-[#111] transition-colors group shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 rounded-full bg-secondary dark:bg-[#151515] flex items-center justify-center mb-6">
                <Briefcase className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real Experience</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Simulate interviews from top tech firms including Google, Amazon, and Microsoft.
              </p>
              <div className="flex gap-4 items-center mt-auto">
                <div className="relative w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center overflow-hidden border border-border">
                  <img src="/logos/google.png" alt="Google" className="object-contain w-full h-full" />
                </div>
                <div className="relative w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center overflow-hidden border border-border">
                  <img src="/logos/microsoft.png" alt="Microsoft" className="object-contain w-full h-full" />
                </div>
                <div className="relative w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center overflow-hidden border border-border">
                  <img src="/logos/amazon.png" alt="Amazon" className="object-contain w-full h-full" />
                </div>
                <div className="relative w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center overflow-hidden border border-border">
                  <img src="/logos/uber.png" alt="Uber" className="object-contain w-full h-full" />
                </div>
              </div>
            </motion.div>

            {/* Card 2: Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-card dark:bg-[#0C0C0C] rounded-[40px] p-8 border border-border dark:border-white/5 hover:bg-secondary/50 dark:hover:bg-[#111] transition-colors shadow-sm dark:shadow-none"
            >
              <div className="w-12 h-12 rounded-full bg-secondary dark:bg-[#151515] flex items-center justify-center mb-6">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Earn Badges</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Showcase your mastery in Communication, Tech, and Leadership.
              </p>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary dark:bg-[#111] p-1">
                  <img src="/badges/communication.png" alt="Communication" className="w-full h-full object-cover" />
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary dark:bg-[#111] p-1">
                  <img src="/badges/technical.png" alt="Technical" className="w-full h-full object-cover" />
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary dark:bg-[#111] p-1">
                  <img src="/badges/leadership.png" alt="Leadership" className="w-full h-full object-cover" />
                </div>
              </div>
            </motion.div>

            {/* Card 3: Connect/Start */}
            <Link href="/setup">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-card dark:bg-[#0C0C0C] rounded-[40px] p-8 border border-border dark:border-white/5 hover:bg-secondary/50 dark:hover:bg-[#111] transition-colors h-full flex flex-col justify-between group shadow-sm dark:shadow-none"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-secondary dark:bg-[#151515] flex items-center justify-center mb-6">
                    <Zap className="w-5 h-5 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Start Now</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Why wait? Launch your first session in seconds.
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                    <ArrowRight className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border mt-auto text-center relative z-10">
        <p className="text-muted-foreground text-sm">© 2026 CareerForge.ai</p>
      </footer>
    </div>
  );
}
