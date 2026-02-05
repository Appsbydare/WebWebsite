"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import TextBlockAnimation from './text-block-animation';

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

// Helper to invert a hex color (to match the inverted canvas)
const invertColor = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const r = 255 - ((n >> 16) & 255);
    const g = 255 - ((n >> 8) & 255);
    const b = 255 - (n & 255);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const projects = [
    {
        name: "J & O Furniture",
        stack: "React + Vite",
        url: "https://jofurniture.vercel.app/",
        image: "/images/projects/project1.png"
    },
    {
        name: "SignalTradingBots",
        stack: "Next.js, GSAP, Framer Motion, Tailwind",
        url: "https://www.signaltradingbots.com/",
        image: "/images/projects/project2.png"
    },
    {
        name: "TheDBot",
        stack: "Next.js, Tailwind",
        url: "https://thedbot.com/",
        image: "/images/projects/project3.png"
    }
];

interface WorkSectionProps {
    targetColors?: string[];
}

export default function WorkSection({ targetColors }: WorkSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Gradient State - inverted colors for white background
    const [currentGradientColors, setCurrentGradientColors] = useState<[string, string]>(["#000000", "#000000"]);
    const animRef = useRef<number | null>(null);
    const startColorsRef = useRef<[string, string]>(["#000000", "#000000"]);
    const targetColorsRef = useRef<[string, string]>(["#000000", "#000000"]);

    // Animate colors when targetColors prop changes
    useEffect(() => {
        if (targetColors && targetColors.length > 0) {
            // INVERT the incoming colors to match the visual state of the inverted canvas
            const invertedColors = targetColors.map(invertColor);

            const primary = invertedColors[0];
            const secondary = invertedColors[1] || invertedColors[0];

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

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    // Auto-cycle projects every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % projects.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const accentGradient = `linear-gradient(135deg, ${currentGradientColors[0]} 0%, ${currentGradientColors[1]} 100%)`;
    const current = projects[activeIndex];

    const goNext = () => setActiveIndex((prev) => (prev + 1) % projects.length);
    const goPrev = () => setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);

    return (
        <div
            id="work"
            className="relative w-full min-h-screen overflow-hidden"
            onClick={() => window.dispatchEvent(new Event("neon-trail-click"))}
        >
            {/* Inversion Layer - Makes background white and inverts neon trail */}
            <div className="absolute inset-0 z-0 bg-white mix-blend-difference pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-black py-32 px-6 pointer-events-none">
                {/* Section Header */}
                <div className="absolute top-32 left-0 w-full px-6 pointer-events-none">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-2xl">
                            <TextBlockAnimation blockColor="#000000" delay={0.2}>
                                <h2
                                    className="text-sm font-bold tracking-widest uppercase mb-4"
                                    style={{ color: currentGradientColors[0], transition: 'color 1s' }}
                                >
                                    Our Work
                                </h2>
                            </TextBlockAnimation>

                            <div className="overflow-hidden">
                                <h3 className="text-4xl md:text-6xl font-display font-bold leading-none mb-6">
                                    Projects We've <br />
                                    <span
                                        className="text-transparent bg-clip-text transition-all duration-1000"
                                        style={{ backgroundImage: accentGradient }}
                                    >
                                        Built with Pride.
                                    </span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Showcase - Clean Single Image */}
                <div className="relative w-full max-w-6xl mt-32 px-4 pointer-events-none">
                    <div className="flex flex-col items-center">
                        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl bg-black/5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`project-${activeIndex}`}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <Image
                                        src={current.image}
                                        alt={current.name}
                                        fill
                                        className="object-cover object-top"
                                        priority
                                        quality={95}
                                    />

                                    {/* Subtle overlay gradient at bottom to help text readability if moved there, 
                                        or just generic polish */}
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent opacity-50"></div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Project Info */}
                    <div className="text-center mt-12 pointer-events-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`info-${activeIndex}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <a
                                    href={current.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block group"
                                >
                                    <h4
                                        className="text-3xl md:text-5xl font-bold mb-4 transition-all duration-300"
                                        style={{
                                            backgroundImage: accentGradient,
                                            WebkitBackgroundClip: 'text',
                                            backgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {current.name}
                                    </h4>
                                </a>
                                <p className="text-black/60 text-xl font-medium">{current.stack}</p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-center gap-8 mt-16 pointer-events-auto">
                        <motion.button
                            onClick={goPrev}
                            className="group relative w-14 h-14 rounded-full border border-black/10 flex items-center justify-center overflow-hidden hover:border-transparent transition-colors bg-white/50 backdrop-blur-sm"
                            whileTap={{ scale: 0.95 }}
                            onClickCapture={(e) => e.stopPropagation()}
                        >
                            <motion.div
                                className="absolute inset-0"
                                style={{ background: accentGradient }}
                                initial={{ x: "-100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            />
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="relative z-10 text-black group-hover:text-white transition-colors"
                            >
                                <path
                                    d="M10 12L6 8L10 4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </motion.button>

                        {/* Dots */}
                        <div className="flex items-center gap-3">
                            {projects.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className="group relative h-3 transition-all duration-300"
                                >
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${index === activeIndex
                                            ? 'w-12'
                                            : 'w-2 bg-black/20 hover:bg-black/40'
                                            }`}
                                        style={{
                                            background: index === activeIndex ? accentGradient : undefined
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        <motion.button
                            onClick={goNext}
                            className="group relative w-14 h-14 rounded-full border border-black/10 flex items-center justify-center overflow-hidden hover:border-transparent transition-colors bg-white/50 backdrop-blur-sm"
                            whileTap={{ scale: 0.95 }}
                            onClickCapture={(e) => e.stopPropagation()}
                        >
                            <motion.div
                                className="absolute inset-0"
                                style={{ background: accentGradient }}
                                initial={{ x: "100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            />
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="relative z-10 text-black group-hover:text-white transition-colors"
                            >
                                <path
                                    d="M6 4L10 8L6 12"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
