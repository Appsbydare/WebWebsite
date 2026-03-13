"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Check, ArrowRight, Zap, Clock, MessageCircle, Lock, ShoppingCart } from 'lucide-react';
import TextBlockAnimation from './text-block-animation';
import ContactModal from './contact-modal';
import OrderModal, { type OrderPlan } from './order-modal';

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
    const [orderPlan, setOrderPlan] = useState<OrderPlan | null>(null);

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

                            {/* CTA Button(s) */}
                            {index === 2 ? (
                                // Custom/Enterprise — inquiry only
                                <button
                                    onClick={() => setContactConfig({
                                        isOpen: true,
                                        need: "Information about a Package",
                                        package: "Custom / Enterprise"
                                    })}
                                    className="relative z-10 w-full py-4 rounded-xl font-bold text-center transition-all duration-300 group-hover:scale-[1.02]"
                                    style={{ background: 'rgba(0,0,0,0.05)', color: 'black' }}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Contact Us
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </button>
                            ) : (
                                // 1 Day / 3 Day — direct buy
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOrderPlan({
                                            name: plan.subtitle,
                                            price: index === 0 ? 110 : 240,
                                            features: plan.features,
                                            duration: index === 0 ? "24 Hours" : "3 Days",
                                            planId: index === 0 ? "1day" : "3day",
                                            description: plan.description,
                                        });
                                    }}
                                    className="relative z-10 w-full py-4 rounded-xl font-bold text-center transition-all duration-300 group-hover:scale-[1.02] text-white"
                                    style={{ background: accentGradient }}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        Book Now
                                    </span>
                                </button>
                            )}
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
                            {/* Stripe official wordmark */}
                            <div className="flex items-center h-10">
                                <svg viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto" aria-label="Stripe">
                                    <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a12.46 12.46 0 0 1-4.74.9c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.28-.08 1.68zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.07zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="currentColor"/>
                                </svg>
                            </div>

                            {/* Visa official wordmark */}
                            <div className="flex items-center h-10">
                                <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto" aria-label="Visa">
                                    <path d="M278.198 334.228l33.36-195.766h53.358l-33.384 195.766h-53.334zm246.556-191.114c-10.57-3.966-27.136-8.222-47.822-8.222-52.725 0-89.865 26.55-90.18 64.603-.299 28.13 26.514 43.822 46.752 53.186 20.75 9.584 27.738 15.716 27.637 24.278-.133 13.117-16.586 19.116-31.924 19.116-21.355 0-32.701-2.967-50.225-10.273l-6.878-3.111-7.487 43.822c12.463 5.467 35.508 10.199 59.438 10.445 56.09 0 92.503-26.248 92.916-66.884.2-22.269-13.986-39.2-44.687-53.188-18.61-9.055-29.998-15.089-29.878-24.275 0-8.137 9.658-16.839 30.534-16.839 17.44-.269 30.07 3.534 39.9 7.5l4.782 2.254 7.24-42.418zm137.372-4.663h-41.24c-12.77 0-22.315 3.486-27.94 16.234l-79.245 179.404h56.031s9.16-24.123 11.233-29.418c6.125 0 60.555.084 68.336.084 1.596 6.853 6.49 29.334 6.49 29.334h49.5l-43.165-195.638zm-65.417 126.407c4.415-11.279 21.26-54.723 21.26-54.723-.314.521 4.381-11.334 7.074-18.684l3.606 16.878s10.217 46.728 12.353 56.529h-44.293zm-363.3-126.407l-52.238 133.44-5.574-27.129c-9.726-31.274-40.025-65.157-73.898-82.12l47.767 171.204 56.455-.063 84.024-195.332h-56.536z" fill="currentColor"/>
                                    <path d="M146.92 138.462H61.731l-.682 4.073c66.249 16.015 110.104 54.692 128.348 101.19l-18.528-88.92c-3.2-12.29-12.498-15.95-23.949-16.343z" fill="currentColor"/>
                                </svg>
                            </div>

                            {/* Mastercard overlapping circles */}
                            <div className="flex items-center gap-2 h-10">
                                <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto" aria-label="Mastercard">
                                    <circle cx="15" cy="12" r="10" fill="currentColor" opacity="0.9"/>
                                    <circle cx="23" cy="12" r="10" fill="currentColor" opacity="0.6"/>
                                </svg>
                                <span className="text-sm font-semibold tracking-tight">Mastercard</span>
                            </div>

                            {/* Apple Pay */}
                            <div className="flex items-center gap-1.5 h-10">
                                <svg className="w-6 h-6" viewBox="0 0 384 512" fill="currentColor" aria-label="Apple Pay">
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
            <OrderModal
                isOpen={orderPlan !== null}
                onClose={() => setOrderPlan(null)}
                plan={orderPlan}
            />
        </section >
    );
}
