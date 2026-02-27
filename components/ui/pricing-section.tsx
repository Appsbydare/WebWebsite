"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Check, ArrowRight, Zap, Clock, MessageCircle, Lock } from 'lucide-react';
import TextBlockAnimation from './text-block-animation';
import ContactModal from './contact-modal';

// Helper used for color interpolation
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

const plans = [
    {
        name: "$110 USD",
        subtitle: "1 Day Package",
        description: "1 Day / 24 Hours. Perfect for rapid landing pages or specific feature implementation.",
        features: [
            "2 High-Quality Pages",
            "Responsive Design",
            "Speed Optimization",
            "Smooth Animations"
        ],
        icon: <Zap className="w-6 h-6" />,
        color: "from-yellow-400 to-orange-500" // Gold/Orange
    },
    {
        name: "$240 USD",
        subtitle: "3 Day Package",
        description: "Comprehensive solution for standard websites and lightweight apps.",
        features: [
            "5-7 Custom Pages",
            "Design System Setup",
            "Advanced Animations",
            "Content Integration",
            "Analytics Setup"
        ],
        icon: <Clock className="w-6 h-6" />,
        color: "from-cyan-400 to-blue-500" // Cyan/Blue
    },
    {
        name: "Custom",
        subtitle: "Inquiries",
        description: "Tailored enterprise solutions for complex requirements.",
        features: [
            "Full-Scale Applications",
            "E-commerce Systems",
            "Custom Backend Logic",
            "Third-party Integrations",
            "Priority Support"
        ],
        icon: <MessageCircle className="w-6 h-6" />,
        color: "from-emerald-400 to-green-500" // Emerald/Green
    }
];

interface PricingSectionProps {
    targetColors?: string[];
}

export default function PricingSection({ targetColors }: PricingSectionProps) {
    // State for gradient colors
    // State for gradient colors
    const [currentGradientColors, setCurrentGradientColors] = useState<[string, string]>(["#fbbf24", "#22d3ee"]);
    const [contactConfig, setContactConfig] = useState<{ isOpen: boolean; need?: string; package?: string }>({ isOpen: false });

    // Refs for animation
    const animRef = useRef<number | null>(null);
    const startColorsRef = useRef<[string, string]>(["#fbbf24", "#22d3ee"]);
    const targetColorsRef = useRef<[string, string]>(["#fbbf24", "#22d3ee"]);

    const accentGradient = `linear-gradient(135deg, ${currentGradientColors[0]} 0%, ${currentGradientColors[1]} 100%)`;

    const handleColorChange = (colors: string[]) => {
        if (!colors || colors.length === 0) return;

        // Invert colors for white section (same as hero)
        const invertColor = (hex: string) => {
            const n = parseInt(hex.slice(1), 16);
            const r = 255 - ((n >> 16) & 255);
            const g = 255 - ((n >> 8) & 255);
            const b = 255 - (n & 255);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        };

        const invertedColors = colors.map(invertColor);
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
    };

    // React to prop changes
    useEffect(() => {
        if (targetColors && targetColors.length > 0) {
            handleColorChange(targetColors);
        }
    }, [targetColors]);

    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    // Handle click to change colors
    const handleSectionClick = (e: React.MouseEvent<HTMLElement>) => {
        // Trigger the neon trail color change
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('neon-trail-click'));
        }
    };

    return (
        <section
            id="pricing"
            className="relative w-full min-h-screen py-32 px-6 text-black mix-blend-normal overflow-hidden cursor-pointer"
            onClick={handleSectionClick}
        >
            {/* Inversion Layer - Creates the White/Ink look like hero section */}
            <div className="absolute inset-0 bg-white mix-blend-difference pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-24 flex flex-col items-center text-center">
                    <TextBlockAnimation blockColor="#000000" delay={0.2}>
                        <h2 className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: currentGradientColors[0], transition: 'color 1s' }}>
                            Flexible Pricing
                        </h2>
                    </TextBlockAnimation>

                    <h3 className="text-4xl md:text-6xl font-display font-bold leading-none mb-6">
                        Build functionality <br />
                        <span
                            className="text-transparent bg-clip-text transition-all duration-1000"
                            style={{ backgroundImage: accentGradient }}
                        >
                            Without the bloat.
                        </span>
                    </h3>
                    <p className="text-xl text-black/60 max-w-2xl mt-4">
                        Choose the perfect timeline for your project. From rapid prototypes to full-scale enterprise solutions.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-[2.5rem] bg-black/5 border border-black/10 backdrop-blur-md overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:bg-black/10 hover:border-black/20 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col"
                        >
                            {/* Gradient Glow Effect on Hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle at 50% 0%, ${currentGradientColors[0]}, transparent 70%)`
                                }}
                            />

                            {/* Plan Header */}
                            <div className="relative z-10 mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-2xl bg-black/5 border border-black/10">
                                        <div
                                            className="text-transparent bg-clip-text"
                                            style={{
                                                backgroundImage: accentGradient,
                                                WebkitBackgroundClip: "text",
                                                backgroundClip: "text",
                                                color: 'transparent' // Fallback
                                            }}
                                        >
                                            <svg width="0" height="0" className="absolute">
                                                <linearGradient id={`pricingIconGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor={currentGradientColors[0]} />
                                                    <stop offset="100%" stopColor={currentGradientColors[1]} />
                                                </linearGradient>
                                            </svg>
                                            {React.cloneElement(plan.icon as React.ReactElement<{ className?: string, stroke?: string }>, {
                                                className: "w-6 h-6",
                                                stroke: `url(#pricingIconGradient-${index})`
                                            })}
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-medium text-black/80">{plan.subtitle}</h4>
                                </div>
                                <h3 className="text-4xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-black/50 text-sm leading-relaxed min-h-[40px]">
                                    {plan.description}
                                </p>
                            </div>

                            {/* Features List */}
                            <ul className="relative z-10 space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-black/70 text-sm">
                                        <Check className="w-5 h-5 text-black/40 shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <button
                                onClick={() => setContactConfig({
                                    isOpen: true,
                                    need: "Information about a Package",
                                    package: index === 2 ? "Custom / Enterprise" : `${plan.subtitle} (${plan.name})`
                                })}
                                className="relative z-10 w-full py-4 rounded-xl font-bold text-center transition-all duration-300 group-hover:scale-[1.02]"
                                style={{
                                    background: index === 1 ? accentGradient : 'rgba(0,0,0,0.05)',
                                    color: index === 1 ? 'white' : 'black'
                                }}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Contact Us
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Trust / Payment Badges */}
                <div className="w-full max-w-4xl mx-auto mt-16 mb-4">
                    <div className="flex flex-col items-center justify-center opacity-50 transition-opacity duration-300 hover:opacity-100 pointer-events-none">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-8 text-black/80">
                            <Lock className="w-4 h-4" />
                            Secure Payments
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 grayscale">
                            {/* Stripe */}
                            <div className="flex items-center">
                                <span className="text-3xl font-bold tracking-tighter normal-case">stripe</span>
                            </div>

                            {/* Mastercard */}
                            <div className="flex items-center">
                                <div className="flex">
                                    <div className="w-6 h-6 rounded-full bg-black"></div>
                                    <div className="w-6 h-6 rounded-full bg-black -ml-3 mix-blend-multiply opacity-80"></div>
                                </div>
                                <span className="ml-3 font-semibold tracking-tight text-xl lowercase">mastercard</span>
                            </div>

                            {/* Visa */}
                            <div className="flex items-center">
                                <span className="text-3xl font-extrabold tracking-widest italic uppercase">visa</span>
                            </div>

                            {/* Apple Pay */}
                            <div className="flex items-center gap-1.5 opacity-90">
                                <svg className="w-6 h-6" viewBox="0 0 384 512" fill="currentColor">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                </svg>
                                <span className="text-2xl font-semibold tracking-tight">Pay</span>
                            </div>
                        </div>

                        {/* Horizontal Divider */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-black/50 to-transparent mt-12 mb-8"></div>
                    </div>
                </div>
            </div>
            <ContactModal
                isOpen={contactConfig.isOpen}
                onClose={() => setContactConfig({ ...contactConfig, isOpen: false })}
                initialNeed={contactConfig.need}
                initialPackage={contactConfig.package}
            />
        </section >
    );
}
