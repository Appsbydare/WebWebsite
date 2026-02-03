"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Command, Aperture, Globe, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Background Particles Component (Simplified & Stable) ---
const ParticleField = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
        const count = 60; // Minimal elegant count

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.1,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);
        animate();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

// --- Glass Card Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-white/10 group",
        className
    )}>
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none" />
        <div className="relative z-20">{children}</div>
    </div>
);

// --- Main Hero Component ---
export default function GlassHero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <section className="relative w-full min-h-[110vh] bg-[#020202] text-white overflow-hidden font-sans selection:bg-indigo-500/30">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(60,60,80,0.2),rgba(0,0,0,0)_70%)]" />
            <ParticleField />

            {/* Hero Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col md:flex-row items-center md:items-start gap-12 lg:gap-20">

                {/* Left: Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex-1 space-y-8 text-center md:text-left pt-10"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-medium tracking-wide text-indigo-200">BETA 2.0 AVAILABLE</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                            Shape the
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x bg-[length:200%_auto]">
                            Impossible
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto md:mx-0 leading-relaxed">
                        The next generation of digital interface design.
                        Blurring the line between functional UI and cinematic experience.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                        <button className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold hover:scale-105 transition-all duration-300 overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Start Building <ArrowRight size={18} />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                        </button>

                        <button className="px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                            <Play size={18} className="fill-white" /> Watch Reel
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="pt-8 flex items-center justify-center md:justify-start gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="h-8 w-24 bg-white/20 rounded animate-pulse" />
                        <div className="h-8 w-24 bg-white/20 rounded animate-pulse delay-100" />
                        <div className="h-8 w-24 bg-white/20 rounded animate-pulse delay-200" />
                    </div>
                </motion.div>

                {/* Right: Glass Interface Mockup (The "Glass GUI") */}
                <motion.div
                    style={{ y: y2 }}
                    initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="flex-1 w-full max-w-lg relative perspective-1000"
                >
                    {/* Abstract Glow behind */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

                    {/* Main Glass Card container */}
                    <GlassCard className="aspect-[4/3] p-1 flex flex-col gap-2">
                        {/* Header */}
                        <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between bg-white/5">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="h-1.5 w-20 bg-white/10 rounded-full" />
                        </div>

                        {/* Body */}
                        <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                            {/* Widget 1 */}
                            <div className="col-span-2 h-32 rounded-lg bg-black/40 border border-white/5 p-4 flex items-center justify-between group/widget">
                                <div>
                                    <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Revenue</div>
                                    <div className="text-3xl font-mono">$12,405.00</div>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover/widget:bg-white/10 transition-colors">
                                    <Aperture className="text-indigo-400" />
                                </div>
                            </div>

                            {/* Widget 2 */}
                            <div className="h-40 rounded-lg bg-gradient-to-br from-indigo-900/40 to-black border border-white/5 p-4 relative overflow-hidden">
                                <div className="text-xs text-white/40 mb-2">Network</div>
                                <Globe className="text-white/20 absolute -bottom-4 -right-4 w-24 h-24" />
                                <div className="relative z-10 text-xl font-bold mt-8">Global<br />Active</div>
                            </div>

                            {/* Widget 3 */}
                            <div className="h-40 rounded-lg bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <Cpu className="w-5 h-5 text-purple-400" />
                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">98%</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-[70%] bg-purple-500" />
                                    </div>
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-[45%] bg-indigo-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Floating Floating Element */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-8 -bottom-10 w-48"
                    >
                        <GlassCard className="p-4 backdrop-blur-3xl bg-black/60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center font-bold text-sm">
                                    AI
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Auto-Optimized</div>
                                    <div className="text-xs text-white/50">Just now</div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
}
