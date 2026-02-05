"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

// Helper used for color interpolation
const lerpColor = (start: string, end: string, t: number) => {
    const s = parseInt(start.slice(1), 16);
    const e = parseInt(end.slice(1), 16);

    const sr = (s >> 16) & 255;
    const sg = (s >> 8) & 255;
    const sb = s & 255;

    const er = (e >> 16) & 255;
    const eg = (e >> 8) & 255;
    const eb = e & 255;

    const r = Math.round(sr + (er - sr) * t);
    const g = Math.round(sg + (eg - sg) * t);
    const b = Math.round(sb + (eb - sb) * t);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

interface FooterProps {
    targetColors?: string[];
}

export default function Footer({ targetColors }: FooterProps) {
    const [currentGradientColors, setCurrentGradientColors] = useState<[string, string]>(["#ffffff", "#ffffff"]);
    const animRef = useRef<number | null>(null);
    const startColorsRef = useRef<[string, string]>(["#ffffff", "#ffffff"]);
    const targetColorsRef = useRef<[string, string]>(["#ffffff", "#ffffff"]);

    useEffect(() => {
        if (targetColors && targetColors.length > 0) {
            const primary = targetColors[0];
            const secondary = targetColors[1] || targetColors[0];

            startColorsRef.current = [...currentGradientColors];
            targetColorsRef.current = [primary, secondary];

            const startTime = performance.now();
            const duration = 1000;

            if (animRef.current) cancelAnimationFrame(animRef.current);

            const animate = (time: number) => {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);

                const c1 = lerpColor(startColorsRef.current[0], targetColorsRef.current[0], ease);
                const c2 = lerpColor(startColorsRef.current[1], targetColorsRef.current[1], ease);

                setCurrentGradientColors([c1, c2]);

                if (progress < 1) {
                    animRef.current = requestAnimationFrame(animate);
                }
            };
            animRef.current = requestAnimationFrame(animate);
        }
    }, [targetColors]);

    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    const accentGradient = `linear-gradient(135deg, ${currentGradientColors[0]} 0%, ${currentGradientColors[1]} 100%)`;

    return (
        <footer className="relative w-full py-24 px-6 border-t border-white/10 bg-transparent text-white overflow-hidden">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 backdrop-blur-xl"></div>

            {/* Background Glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 blur-[120px] pointer-events-none transition-colors duration-1000"
                style={{ background: accentGradient }}
            ></div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:gap-8">
                {/* Branding & Description */}
                <div className="flex flex-col gap-6 max-w-sm">
                    <a href="#" className="relative block transition-opacity hover:opacity-80">
                        <Image
                            src="/images/logo.png"
                            alt="Dynamic Design Factory"
                            width={140}
                            height={40}
                            className="w-auto h-12 object-contain"
                        />
                    </a>
                    <p className="text-white/50 text-lg leading-relaxed font-light">
                        Building digital experiences that matter. Turning complex challenges into elegant technological realities.
                    </p>
                    <div className="flex flex-col gap-1 text-white/40 text-sm font-light mt-2">
                        <p>1207 Delaware Ave #2685</p>
                        <p>Wilmington, DE 19806</p>
                    </div>
                    <div className="mt-2">
                        <p className="text-white/30 text-xs uppercase tracking-wider">Parent Company</p>
                        <a
                            href="https://thedbot.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-white transition-colors duration-300 font-medium"
                        >
                            TheDBot
                        </a>
                    </div>
                    <div className="mt-4">
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Contact</p>
                        <a
                            href="mailto:darshana@thedbot.com"
                            className="text-white/60 hover:text-white transition-colors duration-300 font-medium flex items-center gap-2 group"
                        >
                            darshana@thedbot.com
                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                        </a>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col sm:flex-row gap-16 md:gap-24">
                    <div>
                        <h4
                            className="text-sm font-bold tracking-widest uppercase mb-8 transition-colors duration-1000"
                            style={{
                                backgroundImage: accentGradient,
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            Company
                        </h4>
                        <ul className="space-y-4">
                            {['Services', 'Work', 'Pricing', 'About', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a
                                        href={`#${item.toLowerCase()}`}
                                        className="text-white/60 hover:text-white transition-all duration-300 flex items-center gap-2 group text-base"
                                    >
                                        <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 h-[1px] bg-white"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4
                            className="text-sm font-bold tracking-widest uppercase mb-8 transition-colors duration-1000"
                            style={{
                                backgroundImage: accentGradient,
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            Projects
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href="https://thedbot.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/60 hover:text-white transition-all duration-300 flex items-center gap-2 group text-base"
                                >
                                    TheDBot
                                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://jofurniture.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/60 hover:text-white transition-all duration-300 flex items-center gap-2 group text-base"
                                >
                                    J & O Furniture
                                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.signaltradingbots.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/60 hover:text-white transition-all duration-300 flex items-center gap-2 group text-base"
                                >
                                    SignalTradingBots
                                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-white/30 text-sm">
                <p>&copy; {new Date().getFullYear()} Dynamic Design Factory. All rights reserved.</p>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}
