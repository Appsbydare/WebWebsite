"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import TextBlockAnimation from './text-block-animation';
import { ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';

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

// Helper to convert hex to rgba with opacity
const hexToRgba = (hex: string, opacity: number) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const projects = [
    {
        name: "J & O Furniture",
        stack: "React, Vite",
        url: "https://jofurniture.vercel.app/",
        image: "/images/projects/project1.png",
        description: "A modern furniture e-commerce platform offering a seamless shopping experience with real-time inventory and 3D product previews."
    },
    {
        name: "SignalTradingBots",
        stack: "Next.js, GSAP, Framer Motion, Tailwind",
        url: "https://www.signaltradingbots.com/",
        image: "/images/projects/project2.png",
        description: "High-performance trading automation interface featuring real-time data visualization and complex algorithmic controls."
    },
    {
        name: "TheDBot",
        stack: "Next.js, Tailwind",
        url: "https://thedbot.com/",
        image: "/images/projects/project3.png",

        description: "Advanced automation software linking APIs, webhooks, and workflows to streamline business operations."
    }
];

interface WorkSectionProps {
    targetColors?: string[];
}

export default function WorkSection({ targetColors }: WorkSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    useEffect(() => {
        const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1500);
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

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

    // Auto-cycle projects every 8 seconds (slower for better reading)
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % projects.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const accentGradient = `linear-gradient(135deg, ${currentGradientColors[0]} 0%, ${currentGradientColors[1]} 100%)`;

    // Low opacity gradient for the background numbers - Replicating Testimonial section style
    const lowOpacityGradient = `linear-gradient(135deg, ${hexToRgba(currentGradientColors[0], 0.04)} 0%, ${hexToRgba(currentGradientColors[1], 0.50)} 100%)`;

    const current = projects[activeIndex];

    const goNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveIndex((prev) => (prev + 1) % projects.length);
    };
    const goPrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
    };

    return (
        <section
            id="work"
            className="relative w-full min-h-screen flex items-center overflow-hidden py-12 md:py-16"
            onClick={() => window.dispatchEvent(new Event("neon-trail-click"))}
        >
            {/* Inversion Layer - Makes background white and inverts neon trail */}
            <div className="absolute inset-0 z-0 bg-white mix-blend-difference pointer-events-none"></div>



            <div className="max-w-7xl mx-auto px-6 relative z-10 pointer-events-none h-full flex flex-col justify-center">
                {/* Header - now integrated into the layout flow better */}
                <div className="mb-0 pointer-events-auto">
                    <div className="max-w-7xl">
                        <TextBlockAnimation blockColor="#000000" delay={0.2}>
                            <h2
                                className="text-sm font-bold tracking-widest uppercase mb-2"
                                style={{ color: currentGradientColors[0], transition: 'color 1s' }}
                            >
                                Our Work
                            </h2>
                        </TextBlockAnimation>

                        <div className="overflow-hidden">
                            <h3 className="text-4xl md:text-6xl font-display font-bold leading-none">
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

                {/* Main Split Layout - with vertical label + progress line (01/02/03 style like testimonials) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center -mt-2">
                    {/* Left Column: vertical label + gradient line (01/02/03 style), then text & info */}
                    <div className="lg:col-span-5 xl:col-span-4 order-2 lg:order-1 flex flex-row gap-0 justify-center pointer-events-auto">
                        {/* Vertical "Our Work" + gradient progress line (like testimonials) */}
                        <div className="hidden lg:flex flex-col items-center justify-center pr-6 border-r border-black/10 self-stretch">
                            <motion.span
                                className="text-xs font-mono text-black/80 tracking-widest uppercase"
                                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Our Work
                            </motion.span>
                            <div className="relative h-32 w-px bg-black/10 mt-8 flex-1 min-h-[60px]">
                                <motion.div
                                    className="absolute top-0 left-0 w-full origin-top"
                                    style={{ background: accentGradient }}
                                    animate={{
                                        height: `${((activeIndex + 1) / projects.length) * 100}%`,
                                    }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 relative">
                            {/* Background Number - positioned behind text */}
                            <div className="absolute left-0 -bottom-10 w-full h-full pointer-events-none select-none z-0 overflow-visible">
                                <motion.div
                                    className="text-[15rem] md:text-[20rem] xl:text-[16rem] font-bold leading-none tracking-tighter"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={activeIndex}
                                            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                            className="block"
                                            style={{
                                                backgroundImage: lowOpacityGradient,
                                                WebkitBackgroundClip: "text",
                                                backgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                            }}
                                        >
                                            {String(activeIndex + 1).padStart(2, "0")}
                                        </motion.span>
                                    </AnimatePresence>
                                </motion.div>
                            </div>

                            <div className="min-h-[240px] md:min-h-[300px] flex flex-col justify-center relative z-10">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        className="space-y-8"
                                    >
                                        {/* Title with Link */}
                                        <div>
                                            <h4
                                                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-2 tracking-tight transition-all duration-300 hover:opacity-80 text-black"
                                            >
                                                <a href={current.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                                                    {current.name}
                                                    <ExternalLink className="w-6 h-6 md:w-8 md:h-8 opacity-50 md:opacity-40 -translate-y-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-black" />
                                                </a>
                                            </h4>
                                            <p className="text-lg text-neutral-600 leading-relaxed font-medium mt-6">
                                                {current.description}
                                            </p>
                                        </div>

                                        {/* Tech Stack Pills */}
                                        <div className="flex flex-wrap gap-2">
                                            {current.stack.split(/[+,]+/).map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-black/10 text-black/70 bg-black/5"
                                                >
                                                    {tech.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-6 mt-12">
                                <button
                                    onClick={goPrev}
                                    className="group relative w-14 h-14 rounded-full border border-black/10 flex items-center justify-center overflow-hidden hover:border-black/30 transition-colors bg-white/50 backdrop-blur-sm"
                                >
                                    <ArrowLeft className="relative z-10 w-5 h-5 text-black transition-colors" />
                                </button>
                                <button
                                    onClick={goNext}
                                    className="group relative w-14 h-14 rounded-full border border-black/10 flex items-center justify-center overflow-hidden hover:border-black/30 transition-colors bg-white/50 backdrop-blur-sm"
                                >
                                    <ArrowRight className="relative z-10 w-5 h-5 text-black transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2 pointer-events-auto flex items-stretch">
                        <div className="relative w-full h-[65vh] min-h-[450px] sm:h-[70vh] md:h-[80vh] max-h-[1000px] overflow-hidden rounded-3xl">
                            <AnimatePresence>
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, scale: isLargeScreen ? 1.5 : 1.05, x: isLargeScreen ? 100 : 30, y: -70 }}
                                    animate={{ opacity: 1, scale: isLargeScreen ? 1.5 : 1.05, x: isLargeScreen ? 100 : 30, y: -70 }}
                                    exit={{ opacity: 0, scale: isLargeScreen ? 1.5 : 1.05, x: isLargeScreen ? 100 : 30, y: -70 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <a href={current.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-none md:cursor-pointer">
                                        <Image
                                            src={current.image}
                                            alt={current.name}
                                            fill
                                            className="object-contain" // Changed to object-contain to show full mockup without cropping
                                            sizes="(max-width: 768px) 100vw, 60vw"
                                            priority
                                            quality={95}
                                        />
                                    </a>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
