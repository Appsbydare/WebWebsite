"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Menu, X, ArrowRight, Play, Sparkles } from 'lucide-react';
import { TubesBackground } from "./neon-flow";
import TextBlockAnimation from "./text-block-animation";

// Helper used for color interpolation (same as in neon-flow)
const lerpColor = (start: string, end: string, t: number) => {
    const s = parseInt(start.slice(1), 16);
    const e = parseInt(end.slice(1), 16);

    // Split channels
    const sr = (s >> 16) & 255;
    const sg = (s >> 8) & 255;
    const sb = s & 255;

    const er = (e >> 16) & 255;
    const eg = (e >> 8) & 255;
    const eb = e & 255;

    // Interpolate
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

interface NavLink {
    label: string;
    href: string;
    isActive?: boolean;
}

interface Partner {
    name: string;
    logo?: React.ReactNode;
    href: string;
}

interface ResponsiveHeroBannerProps {
    backgroundImageUrl?: string;
    navLinks?: NavLink[];
    ctaButtonText?: string;
    ctaButtonHref?: string;
    badgeLabel?: string;
    badgeText?: string;
    title?: string;
    titleLine2?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonHref?: string;
    secondaryButtonText?: string;
    secondaryButtonHref?: string;
    partnersTitle?: string;
    showPartners?: boolean;
    neonOpacity?: number; // 0-1, controls neon background visibility
    overlayOpacity?: number; // 0-1, controls gradient overlay intensity
}

const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
    // Defaulting to DDF Branding
    backgroundImageUrl,
    navLinks = [
        { label: "Work", href: "#work" },
        { label: "Services", href: "#services" },
        { label: "About", href: "#about" },
        { label: "Process", href: "#process" }
    ],
    ctaButtonText = "Contact Us",
    ctaButtonHref = "#contact",
    badgeLabel = "New",
    badgeText = "Accepting New Clients for 2026",
    title = "Dynamic",
    titleLine2 = "Design Factory",
    description = "We build scalable, high-performance software solutions tailored to your business needs. Turning complex challenges into elegant technological realities.",
    primaryButtonText = "Explore",
    primaryButtonHref = "#work",
    secondaryButtonText = "Contact Us",
    secondaryButtonHref = "#contact",
    partnersTitle = "Trusted by industry leaders",
    showPartners = false,
    neonOpacity = 0.6, // Slightly reduced for grid visibility
    overlayOpacity = 0.5 // Stronger white fade to blend grid
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // State to hold the current visible colors for the gradient
    const [currentGradientColors, setCurrentGradientColors] = useState<[string, string]>(["#3b82f6", "#8b5cf6"]);
    const [accentColor, setAccentColor] = useState<string>("#3b82f6");

    // Refs for animation
    const animRef = useRef<number | null>(null);
    const startColorsRef = useRef<[string, string]>(["#3b82f6", "#8b5cf6"]);
    const targetColorsRef = useRef<[string, string]>(["#3b82f6", "#8b5cf6"]);

    // Calculate the CSS gradient string based on current state
    const accentGradient = `linear-gradient(135deg, ${currentGradientColors[0]} 0%, ${currentGradientColors[1]} 100%)`;

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    const handleColorChange = (colors: string[]) => {
        if (!colors || colors.length === 0) return;

        // INVERT the incoming colors so they match the visual state of the inverted canvas
        const invertedColors = colors.map(invertColor);

        // Determine new target colors
        // Use the first color, and maybe mix it with the second or white for the gradient
        const primary = invertedColors[0];
        const secondary = invertedColors[1] || invertedColors[0];

        // Start from WHEREVER we currently are to avoid jumps
        startColorsRef.current = [...currentGradientColors];
        targetColorsRef.current = [primary, secondary];

        const startTime = performance.now();
        const duration = 1000; // Match the 1000ms in neon-flow

        if (animRef.current) cancelAnimationFrame(animRef.current);

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            const c1 = lerpColor(startColorsRef.current[0], targetColorsRef.current[0], ease);
            const c2 = lerpColor(startColorsRef.current[1], targetColorsRef.current[1], ease);

            setCurrentGradientColors([c1, c2]);
            setAccentColor(c1); // Also update solid accent color smoothly

            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        };

        animRef.current = requestAnimationFrame(animate);
    };

    const [scrolledPastHero, setScrolledPastHero] = useState(false);

    // Scroll listener for adaptive nav
    useEffect(() => {
        const handleScroll = () => {
            const threshold = window.innerHeight - 100;
            if (window.scrollY > threshold) {
                setScrolledPastHero(true);
            } else {
                setScrolledPastHero(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ... (keep handleColorChange logic here or just reference it if outside scope)

    return (
        <section className="relative w-full min-h-screen overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0">
                {/* Neon Flow Background - Fixed to viewport */}
                <div className="fixed inset-0 z-0">
                    <TubesBackground
                        className="w-full h-full bg-black"
                        opacity={1}
                        enableClickInteraction={true}
                        onColorChange={handleColorChange}
                    />
                </div>

                {/* Dot Grid Background - Fixed and White (Inverts to Black in Hero) */}
                <div className="fixed inset-0 z-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                {/* Hero Inversion Layer - Creates the White/Ink look ONLY for this section */}
                <div className="absolute inset-0 z-0 bg-white mix-blend-difference pointer-events-none"></div>

                {/* Gradient Overlay Removed to remove the fade */}
            </div>

            {/* Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-slide-down" style={{ animationDuration: '0.8s' }}>
                <div className="max-w-5xl mx-auto px-6 mt-6">
                    <div className={cn(
                        "relative flex items-center justify-between p-2 rounded-full border backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-500",
                        scrolledPastHero
                            ? "bg-black/50 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                            : "bg-white/50 border-black/5"
                    )}>

                        {/* Logo */}
                        <a href="/" className="flex items-center gap-2 px-4 group">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-all duration-500"
                                style={{ background: accentGradient, boxShadow: `0 0 10px ${accentColor}40` }}
                            >
                                D
                            </div>
                            <span className={cn(
                                "text-lg font-bold tracking-tight hidden sm:block transition-colors duration-500",
                                scrolledPastHero ? "text-white" : "text-black"
                            )}>
                                DDF
                            </span>
                        </a>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                        link.isActive
                                            ? (scrolledPastHero ? "bg-white/10 text-white font-semibold" : "bg-black/5 text-black font-semibold")
                                            : (scrolledPastHero ? "text-neutral-400 hover:text-white hover:bg-white/10" : "text-neutral-500 hover:text-black hover:bg-black/5")
                                    )}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        {/* CTA & Mobile Toggle */}
                        <div className="flex items-center gap-3 pr-2">
                            <a
                                href={ctaButtonHref}
                                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                                style={{ background: accentGradient }}
                            >
                                {ctaButtonText}
                                <ArrowRight className="w-4 h-4" />
                            </a>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={cn(
                                    "md:hidden p-2 rounded-full transition-colors",
                                    scrolledPastHero ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-black hover:bg-black/10"
                                )}
                            >
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 p-6 md:hidden animate-in slide-in-from-top-4 fade-in duration-200">
                        <div className={cn(
                            "backdrop-blur-xl border rounded-3xl p-4 flex flex-col gap-2 shadow-xl transition-all duration-500",
                            scrolledPastHero
                                ? "bg-black/90 border-white/10"
                                : "bg-white/90 border-black/5"
                        )}>
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className={cn(
                                        "px-4 py-3 text-lg font-medium rounded-xl transition-colors",
                                        scrolledPastHero
                                            ? "text-white/90 hover:bg-white/10"
                                            : "text-black/90 hover:bg-black/5"
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <a
                                href={ctaButtonHref}
                                className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-bold"
                                style={{ background: accentGradient }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {ctaButtonText}
                            </a>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Hero Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-32 pb-20 text-center pointer-events-none">

                {/* Badge */}
                <div className="group mb-8 inline-flex items-center gap-3 rounded-full border border-black/5 bg-white/60 px-2 py-2 pr-4 backdrop-blur-sm transition-all hover:bg-white/80 hover:scale-105 hover:shadow-sm animate-fade-in-up pointer-events-auto cursor-default shadow-sm">
                    <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm transition-colors duration-500"
                        style={{ background: accentGradient }}
                    >
                        {badgeLabel}
                    </span>
                    <span className="text-sm font-medium text-black/70 group-hover:text-black transition-colors">
                        {badgeText}
                    </span>
                </div>

                {/* Heading */}
                <div className="mb-8 w-full max-w-5xl flex flex-col items-center">
                    {/* Line 1: Glass Effect Outline */}
                    <TextBlockAnimation blockColor="#000000" delay={0.1}>
                        <h1
                            className="text-5xl sm:text-7xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none text-black drop-shadow-sm"
                        >
                            {title}
                        </h1>
                    </TextBlockAnimation>

                    {/* Line 2: Gradient Filled Text */}
                    <div className="mt-2 text-center">
                        <TextBlockAnimation blockColor="#363636ff" delay={0.3}>
                            <h1
                                className="text-5xl sm:text-7xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none text-transparent transition-all duration-1000"
                                style={{
                                    backgroundImage: accentGradient,
                                    WebkitBackgroundClip: "text",
                                    backgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    // Keep drop shadow for contrast against white
                                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.1))"
                                }}
                            >
                                {titleLine2}
                            </h1>
                        </TextBlockAnimation>
                    </div>
                </div>

                {/* Description */}
                <p className="max-w-2xl text-lg sm:text-xl text-black/60 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                    {description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in-up pointer-events-auto" style={{ animationDelay: '1.4s', animationFillMode: 'both' }}>
                    <a
                        href={primaryButtonHref}
                        className="group flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] duration-500"
                        style={{ background: accentGradient }}
                    >
                        {primaryButtonText}
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </a>

                    <a
                        href={secondaryButtonHref}
                        className="group flex items-center gap-2 px-8 py-4 rounded-full border border-black/10 bg-black/5 backdrop-blur-md text-black font-medium hover:bg-black/10 transition-all"
                    >
                        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {/* Changed icon to represent 'Contact' better, or keep Play if it's still showreel but named Contact */}
                            <Play className="w-4 h-4 fill-black" />
                        </div>
                        {secondaryButtonText}
                    </a>
                </div>

                {/* Partners Section REMOVED as requested */}
            </div>
        </section>
    );
};

export default ResponsiveHeroBanner;
