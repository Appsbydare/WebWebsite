"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import NextImage from 'next/image';
import TextBlockAnimation from './text-block-animation';
import { ExternalLink } from 'lucide-react';

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
        description: "A modern furniture e-commerce platform offering a seamless shopping experience with real-time inventory and 3D product previews.",
        testimonial: {
            quote: "The attention to detail is unmatched. Every interaction feels intentional.",
            author: "Michael Thompson",
            project: "E-Commerce Site",
            avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/professional-woman-minimal-portrait-JIXD2g3xUKSkFHnS0FEQZV7XFVRh96.png",
        }
    },
    {
        name: "SignalTradingBots",
        stack: "Next.js, GSAP, Framer Motion, Tailwind",
        url: "https://www.signaltradingbots.com/",
        image: "/images/projects/project2.png",
        description: "High-performance trading automation interface featuring real-time data visualization and complex algorithmic controls.",
        testimonial: {
            quote: "Finally, someone who understands that simplicity is the ultimate sophistication.",
            author: "Emily Rodriguez",
            project: "Full Stack App",
            avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/professional-woman-asian-portrait-minimal-3JNilSFq6Lws8Gujkq8ZsV4v5owg2j.jpg",
        }
    },
    {
        name: "TheDBot",
        stack: "Next.js, Tailwind",
        url: "https://thedbot.com/",
        image: "/images/projects/project3.png",
        description: "Advanced automation software linking APIs, webhooks, and workflows to streamline business operations.",
        testimonial: {
            quote: "This work redefined our entire approach to digital experiences.",
            author: "David Williams",
            project: "Modern Landing Page",
            avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/professional-man-minimal-portrait-iJTSwKlJgwle9ZhX3NdX2gDFF6hamm.png",
        }
    }
];

const avatarImages = projects.map((p) => p.testimonial.avatar);

function usePreloadImages(images: string[]) {
    useEffect(() => {
        images.forEach((src) => {
            const img = new Image()
            img.src = src
        })
    }, [images])
}

function SplitText({ text }: { text: string }) {
    const words = text.split(" ")

    return (
        <span className="inline">
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    transition={{
                        duration: 0.4,
                        delay: i * 0.03,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </motion.span>
            ))}
        </span>
    )
}

interface WorkSectionProps {
    targetColors?: string[];
}

export default function WorkSection({ targetColors }: WorkSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    // Magnetic Cursor State
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [cursorText, setCursorText] = useState("Next");
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    usePreloadImages(avatarImages);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        },
        [mouseX, mouseY],
    );

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
        // e?.stopPropagation(); // Allow bubbling to canvas if needed, but here we want to cycle
        setActiveIndex((prev) => (prev + 1) % projects.length);
    };

    return (
        <section
            id="work"
            ref={containerRef}
            className="relative w-full min-h-screen flex items-center overflow-hidden py-12 md:py-16 cursor-none" // Added cursor-none
            onClick={(e) => {
                goNext(e);
                window.dispatchEvent(new Event("neon-trail-click"));
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Custom Magnetic Cursor */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-50 mix-blend-difference"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            >
                <motion.div
                    className="rounded-full bg-white flex items-center justify-center" // White cursor for mix-blend-difference on white background -> black logic
                    animate={{
                        width: isHovered ? 80 : 0,
                        height: isHovered ? 80 : 0,
                        opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                >
                    <motion.span
                        key={cursorText} // Add key to trigger re-animation on text change
                        className="text-black text-xs font-medium tracking-wider uppercase"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isHovered ? 1 : 0, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {cursorText}
                    </motion.span>
                </motion.div>
            </motion.div>

            {/* Inversion Layer - Makes background white and inverts neon trail */}
            <div className="absolute inset-0 z-0 bg-white mix-blend-difference pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 pointer-events-none h-full flex flex-col justify-center w-full">

                {/* Responsive Header: Flex Col on Mobile, Row on Desktop */}
                <div className="mb-8 pointer-events-auto flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8">
                    {/* Left: Section Title */}
                    <div className="max-w-2xl shrink-0">
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

                        {/* Mobile Testimonial (Visible only on small screens < lg) - Optional or keep just one instance 
                            For now, let's keep one instance and manage responsive layout via flex-col-reverse or similar if needed.
                            User requested "in front of the heading where the red box is", implying right side on desktop.
                        */}
                    </div>

                    {/* Right: Integrated Testimonial Component */}
                    <div className="w-full max-w-xl">
                        {/* Stacked Avatars */}
                        <div className="flex -space-x-2 mb-6">
                            {projects.map((p, i) => (
                                <motion.div
                                    key={i}
                                    className={`w-8 h-8 rounded-full border-2 border-white overflow-hidden transition-all duration-300 ${i === activeIndex ? "ring-2 ring-offset-2 ring-black/20 scale-110 z-10" : "grayscale opacity-50"
                                        }`}
                                    style={{ borderColor: i === activeIndex ? currentGradientColors[0] : 'white' }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p.testimonial.avatar} alt={p.testimonial.author} className="w-full h-full object-cover" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Quote */}
                        <div className="relative min-h-[80px] mb-6">
                            <AnimatePresence mode="wait">
                                <motion.blockquote
                                    key={activeIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                    className="text-xl md:text-2xl font-light leading-relaxed tracking-tight text-neutral-800"
                                >
                                    <SplitText text={current.testimonial.quote} />
                                </motion.blockquote>
                            </AnimatePresence>
                        </div>

                        {/* Author Info */}
                        <div className="flex items-center gap-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    className="relative pl-4"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className="absolute left-0 top-0 bottom-0 w-px"
                                        style={{ background: accentGradient }}
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    // style={{ originY: 0 }}
                                    />
                                    <span className="block text-sm font-medium text-black tracking-wide">
                                        {current.testimonial.author}
                                    </span>
                                    <span className="block text-xs text-neutral-500 mt-0.5 font-mono uppercase tracking-widest">
                                        {current.testimonial.project}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
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
                                                <a
                                                    href={current.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-start gap-4 group"
                                                    onMouseEnter={() => setCursorText("Visit")}
                                                    onMouseLeave={() => setCursorText("Next")}
                                                >
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

                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2 pointer-events-auto flex items-stretch">
                        <div className="relative w-full h-[65vh] min-h-[450px] sm:h-[70vh] md:h-[80vh] max-h-[1000px] overflow-hidden rounded-3xl">
                            <AnimatePresence>
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, scale: isLargeScreen ? 1.3 : 1.05, x: isLargeScreen ? 100 : 30, y: -70 }}
                                    animate={{ opacity: 1, scale: isLargeScreen ? 1.3 : 1.05, x: isLargeScreen ? 100 : 30, y: -70 }}
                                    exit={{ opacity: 0, scale: isLargeScreen ? 1.3 : 1.05, x: isLargeScreen ? 100 : 30, y: -70 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <div className="block w-full h-full pointer-events-none">
                                        <NextImage
                                            src={current.image}
                                            alt={current.name}
                                            fill
                                            className="object-contain" // Changed to object-contain to show full mockup without cropping
                                            sizes="(max-width: 768px) 100vw, 60vw"
                                            priority
                                            quality={95}
                                        />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                    </div>

                    {/* Bottom ticker - displaying project names */}
                    <div className="absolute -bottom-1 left-0 right-0 overflow-hidden opacity-[0.08] pointer-events-none text-black">
                        <motion.div
                            className="flex whitespace-nowrap text-6xl font-bold tracking-tight"
                            animate={{ x: [0, -1000] }}
                            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                            {[...Array(10)].map((_, i) => (
                                <span key={i} className="mx-8">
                                    {projects.map((p) => p.name).join(" • ")} •
                                </span>
                            ))}
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
