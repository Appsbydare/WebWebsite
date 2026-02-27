"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import TextBlockAnimation from "./text-block-animation"

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

const testimonials = [
    {
        quote: "Transformed our entire creative process overnight.",
        author: "Michael Thompson",
        project: "E-Commerce Site",
    },
    {
        quote: "The most elegant solution we've ever implemented.",
        author: "Emily Rodriguez",
        project: "Full Stack App",
    },
    {
        quote: "Pure craftsmanship in every single detail.",
        author: "David Williams",
        project: "Modern Landing Page",
    },
]

interface TestimonialProps {
    targetColors?: string[];
}

export function Testimonial({ targetColors }: TestimonialProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // Gradient State
    const [currentGradientColors, setCurrentGradientColors] = useState<[string, string]>(["#000000", "#000000"]);
    const animRef = useRef<number | null>(null);
    const startColorsRef = useRef<[string, string]>(["#000000", "#000000"]);
    const targetColorsRef = useRef<[string, string]>(["#000000", "#000000"]);

    // Animate colors when targetColors prop changes
    // INVERT the incoming colors so they match the visual state of the inverted canvas
    useEffect(() => {
        if (targetColors && targetColors.length > 0) {
            // INVERT the incoming colors so they match the visual state of the inverted canvas
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

    const accentGradient = `linear-gradient(135deg, ${currentGradientColors[0]} 0%, ${currentGradientColors[1]} 100%)`;
    // Low opacity gradient for the background numbers
    const lowOpacityGradient = `linear-gradient(135deg, ${hexToRgba(currentGradientColors[0], 0.04)} 0%, ${hexToRgba(currentGradientColors[1], 0.20)} 100%)`;
    // Helper for single color usage
    const primaryColor = currentGradientColors[0];


    // Mouse position for magnetic effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 200 }
    const x = useSpring(mouseX, springConfig)
    const y = useSpring(mouseY, springConfig)

    // Transform for parallax on the large number
    const numberX = useTransform(x, [-200, 200], [-20, 20])
    const numberY = useTransform(y, [-200, 200], [-10, 10])

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            mouseX.set(e.clientX - centerX)
            mouseY.set(e.clientY - centerY)
        }
    }

    const goNext = () => setActiveIndex((prev) => (prev + 1) % testimonials.length)
    const goPrev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

    useEffect(() => {
        const timer = setInterval(goNext, 6000)
        return () => clearInterval(timer)
    }, [])

    const current = testimonials[activeIndex]

    return (
        <div
            id="testimonial-section"
            className="relative w-full min-h-screen overflow-hidden"
            onClick={() => window.dispatchEvent(new Event("neon-trail-click"))}
        >
            {/* Inversion Layer: 
            This layer flips the underlying black background to white, 
            and the neon tubes (if visible behind) to their inverted colors.
            We use 'mix-blend-difference' with a white background on top of the black base.
        */}
            <div className="absolute inset-0 z-0 bg-white mix-blend-difference pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-black pointer-events-none">
                {/* Section Header - matches Services Section alignment */}
                <div className="absolute top-32 left-0 w-full px-6 pointer-events-none">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-2xl">
                            <TextBlockAnimation blockColor="#000000" delay={0.2}>
                                <h2 className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: currentGradientColors[0], transition: 'color 1s' }}>
                                    What Clients Say
                                </h2>
                            </TextBlockAnimation>

                            <div className="overflow-hidden">
                                <h3 className="text-4xl md:text-6xl font-display font-bold leading-none mb-6">
                                    Trusted by <br />
                                    <span
                                        className="text-transparent bg-clip-text transition-all duration-1000"
                                        style={{ backgroundImage: accentGradient }}
                                    >
                                        Industry Leaders.
                                    </span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content layer set to click-through so neon trail clicks work behind this section */}
                <div ref={containerRef} className="relative w-full max-w-5xl px-6 mt-48 pointer-events-none">

                    {/* Oversized index number */}
                    <motion.div
                        className="absolute -left-8 top-1/2 -translate-y-1/2 text-[28rem] font-bold select-none pointer-events-none leading-none tracking-tighter"
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

                    {/* Main content - asymmetric layout */}
                    <div className="relative flex">
                        {/* Left column - vertical text */}
                        <div className="flex flex-col items-center justify-center pr-16 border-r border-black/10">
                            <motion.span
                                className="text-xs font-mono text-black/50 tracking-widest uppercase"
                                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Testimonials
                            </motion.span>

                            {/* Vertical progress line */}
                            <div className="relative h-32 w-px bg-black/10 mt-8">
                                <motion.div
                                    className="absolute top-0 left-0 w-full origin-top"
                                    style={{ background: accentGradient }}
                                    animate={{
                                        height: `${((activeIndex + 1) / testimonials.length) * 100}%`,
                                    }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                        </div>

                        {/* Center - main content */}
                        <div className="flex-1 pl-16 py-12">
                            {/* Company badge */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.4 }}
                                    className="mb-8"
                                >
                                    <span className="inline-flex items-center gap-2 text-xs font-mono text-black/50 border border-black/10 rounded-full px-3 py-1">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accentGradient }} />
                                        {current.project}
                                    </span>
                                </motion.div>
                            </AnimatePresence>

                            {/* Quote with character reveal */}
                            <div className="relative mb-12 min-h-[140px]">
                                <AnimatePresence mode="wait">
                                    <motion.blockquote
                                        key={activeIndex}
                                        className="text-4xl md:text-5xl font-light text-black leading-[1.15] tracking-tight"
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        {current.quote.split(" ").map((word, i) => (
                                            <motion.span
                                                key={i}
                                                className="inline-block mr-[0.3em]"
                                                variants={{
                                                    hidden: { opacity: 0, y: 20, rotateX: 90 },
                                                    visible: {
                                                        opacity: 1,
                                                        y: 0,
                                                        rotateX: 0,
                                                        transition: {
                                                            duration: 0.5,
                                                            delay: i * 0.05,
                                                            ease: [0.22, 1, 0.36, 1],
                                                        },
                                                    },
                                                    exit: {
                                                        opacity: 0,
                                                        y: -10,
                                                        transition: { duration: 0.2, delay: i * 0.02 },
                                                    },
                                                }}
                                            >
                                                {word}
                                            </motion.span>
                                        ))}
                                    </motion.blockquote>
                                </AnimatePresence>
                            </div>

                            {/* Author row */}
                            <div className="flex items-end justify-between">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4, delay: 0.2 }}
                                        className="flex items-center gap-4"
                                    >
                                        {/* Animated line before name */}
                                        <motion.div
                                            className="w-8 h-px"
                                            style={{ background: accentGradient }}
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.6, delay: 0.3 }}
                                        // style={{ originX: 0 }} // Moved to main style block if needed, but framer motion handles origin prop usually
                                        // Framer motion style prop conflict?
                                        />
                                        <div>
                                            <p className="text-base font-medium text-black">{current.author}</p>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Bottom ticker - subtle repeating company names */}
                    <div className="absolute -bottom-20 left-0 right-0 overflow-hidden opacity-[0.08] pointer-events-none text-black">
                        <motion.div
                            className="flex whitespace-nowrap text-6xl font-bold tracking-tight"
                            animate={{ x: [0, -1000] }}
                            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                            {[...Array(10)].map((_, i) => (
                                <span key={i} className="mx-8">
                                    {testimonials.map((t) => t.project).join(" • ")} •
                                </span>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Navigation overlay (kept clickable while allowing background clicks to hit the neon canvas) */}
                <div className="pointer-events-auto absolute bottom-12 right-10 flex items-center gap-4">
                    <motion.button
                        onClick={goPrev}
                        className="group relative w-12 h-12 rounded-full border border-black/10 flex items-center justify-center overflow-hidden hover:border-transparent transition-colors bg-white/30 backdrop-blur-sm"
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
                            width="18"
                            height="18"
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

                    <motion.button
                        onClick={goNext}
                        className="group relative w-12 h-12 rounded-full border border-black/10 flex items-center justify-center overflow-hidden hover:border-transparent transition-colors bg-white/30 backdrop-blur-sm"
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
                            width="18"
                            height="18"
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
    )
}
