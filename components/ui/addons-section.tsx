"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight, CreditCard, Bot, BarChart, Search, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TextBlockAnimation from './text-block-animation';
import ContactModal from './contact-modal';

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

const addons = [
    {
        id: 'payment',
        name: 'Payment Gateway',
        price: 150,
        time: 1,
        bgText: 'PAY',
        position: 'top-right',
        icon: CreditCard
    },
    {
        id: 'ai',
        name: 'AI Support Agent',
        price: 300,
        time: 2,
        bgText: 'AI',
        position: 'bottom-left',
        icon: Bot,
        note: 'without API charges'
    },
    {
        id: 'seo',
        name: 'SEO & Performance',
        price: 100,
        time: 2,
        bgText: 'SEO',
        position: 'bottom-right',
        icon: BarChart
    },
];

const PACKAGES = [
    {
        id: '1day',
        name: '1 Day Package',
        price: 110,
        time: 1,
        description: 'Rapid landing page',
        features: [
            "2 High-Quality Pages",
            "Responsive Design",
            "Speed Optimization",
            "Smooth Animations"
        ]
    },
    {
        id: '3day',
        name: '3 Day Package',
        price: 240,
        time: 3,
        description: 'Standard website',
        features: [
            "5-7 Custom Pages",
            "Design System Setup",
            "Advanced Animations",
            "Content Integration",
            "Analytics Setup"
        ]
    },
];

interface AddonsSectionProps {
    targetColors?: string[];
}

interface ContactConfig {
    isOpen: boolean;
    need?: string;
    package?: string;
    addons?: string[];
}

export default function AddonsSection({ targetColors }: AddonsSectionProps) {
    const [currentGradientColors, setCurrentGradientColors] = useState<[string, string]>(["#fbbf24", "#22d3ee"]);
    const [selectedPackage, setSelectedPackage] = useState<string>('1day');
    const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
    const [contactConfig, setContactConfig] = useState<ContactConfig>({ isOpen: false });

    const animRef = useRef<number | null>(null);
    const startColorsRef = useRef<[string, string]>(["#fbbf24", "#22d3ee"]);
    const targetColorsRef = useRef<[string, string]>(["#fbbf24", "#22d3ee"]);

    const accentGradient = `linear-gradient(135deg, ${currentGradientColors[0]} 0%, ${currentGradientColors[1]} 100%)`;

    const handleColorChange = (colors: string[]) => {
        if (!colors || colors.length === 0) return;

        const primary = colors[0];
        const secondary = colors[1] || colors[0];

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

    const toggleAddon = (id: string) => {
        const next = new Set(selectedAddons);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedAddons(next);
    };

    const currentPackage = PACKAGES.find(p => p.id === selectedPackage) || PACKAGES[0];

    const addonsTotal = Array.from(selectedAddons).reduce((sum, id) => {
        const addon = addons.find((a) => a.id === id);
        return sum + (addon ? addon.price : 0);
    }, 0);

    const addonsTime = Array.from(selectedAddons).reduce((sum, id) => {
        const addon = addons.find((a) => a.id === id);
        return sum + (addon ? addon.time : 0);
    }, 0);

    const totalPrice = currentPackage.price + addonsTotal;
    const totalTime = currentPackage.time + addonsTime;



    return (
        <section id="addons" className="relative w-full py-32 px-6 z-10 bg-transparent text-white mix-blend-normal pointer-events-none">
            <div className="max-w-7xl mx-auto relative z-10 pointer-events-auto">
                {/* Header */}
                <div className="mb-24 flex flex-col items-center text-center">
                    <TextBlockAnimation blockColor="#ffffff" delay={0.2}>
                        <h2 className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: currentGradientColors[0], transition: 'color 1s' }}>
                            Enhance Your Plan
                        </h2>
                    </TextBlockAnimation>

                    <h3 className="text-4xl md:text-5xl font-display font-bold leading-none mb-6">
                        Need something <br />
                        <span
                            className="text-transparent bg-clip-text transition-all duration-1000"
                            style={{ backgroundImage: accentGradient }}
                        >
                            Special?
                        </span>
                    </h3>
                </div>

                {/* Add-ons & Feature Visualization */}
                <div className="relative rounded-[3rem] bg-white/5 border border-white/10 p-12 overflow-hidden backdrop-blur-sm min-h-[600px] flex items-center">
                    {/* Background Text Visualization */}
                    <AnimatePresence>
                        {addons.map((addon) => (
                            selectedAddons.has(addon.id) && (
                                <motion.div
                                    key={addon.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0.4, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className={`absolute font-bold leading-none select-none pointer-events-none whitespace-nowrap
                                        ${addon.position === 'top-right' ? 'top-8 right-8' : ''}
                                        ${addon.position === 'bottom-left' ? 'bottom-8 left-8' : ''}
                                        ${addon.position === 'bottom-right' ? 'bottom-8 right-8' : ''}
                                    `}
                                    style={{
                                        color: currentGradientColors[1],
                                        fontSize: '12vw',
                                        zIndex: 0,
                                        opacity: 1,
                                        filter: 'url(#noise-filter)',
                                        WebkitFilter: 'url(#noise-filter)',
                                        mixBlendMode: 'overlay'
                                    }}
                                >
                                    {addon.bgText}
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>

                    {/* SVG Filter for Noise Texture */}
                    <svg className="absolute w-0 h-0">
                        <defs>
                            <filter id="noise-filter" x="0%" y="0%" width="100%" height="100%">
                                <feTurbulence
                                    type="fractalNoise"
                                    baseFrequency="0.65"
                                    numOctaves="2"
                                    seed="5"
                                    result="noise"
                                />
                                <feColorMatrix
                                    in="noise"
                                    type="saturate"
                                    values="0"
                                    result="desaturatedNoise"
                                />
                                <feComponentTransfer in="desaturatedNoise" result="limitedNoise">
                                    <feFuncA type="table" tableValues="0 0.2 0.4" />
                                </feComponentTransfer>
                                <feComposite
                                    operator="in"
                                    in="limitedNoise"
                                    in2="SourceGraphic"
                                    result="composite"
                                />
                                <feMerge>
                                    <feMergeNode in="SourceGraphic" />
                                    <feMergeNode in="composite" />
                                </feMerge>
                            </filter>
                        </defs>
                    </svg>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-4 space-y-12">

                            {/* Package Selection */}
                            <div>
                                <h3 className="text-3xl font-bold mb-6">Select Base Package</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {PACKAGES.map((pkg) => (
                                        <button
                                            key={pkg.id}
                                            onClick={() => setSelectedPackage(pkg.id)}
                                            className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${selectedPackage === pkg.id
                                                ? 'bg-white/10 border-white/40 shadow-lg'
                                                : 'bg-transparent border-white/10 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex flex-col h-full justify-between">
                                                <div>
                                                    <div className="text-lg font-bold mb-1">{pkg.name}</div>
                                                    <div className="text-sm opacity-60 mb-3">{pkg.description}</div>
                                                </div>
                                                <div className="flex items-baseline justify-between mt-2">
                                                    <span className="text-xl font-bold">${pkg.price}</span>
                                                    <span className="text-xs opacity-50 bg-white/10 px-2 py-1 rounded-full">{pkg.time} Day{pkg.time > 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            {selectedPackage === pkg.id && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Add-ons Selection */}
                            <div>
                                <h3 className="text-3xl font-bold mb-2">Customize Your Package</h3>
                                <p className="text-white/60 mb-6">Select additional services to tailor the project.</p>

                                <div className="space-y-4">
                                    {addons.map((addon) => (
                                        <label
                                            key={addon.id}
                                            className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 group ${selectedAddons.has(addon.id)
                                                ? 'bg-white/10 border-white/20 shadow-lg'
                                                : 'bg-transparent border-white/5 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${selectedAddons.has(addon.id)
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-white/5 text-white/40'
                                                    }`}>
                                                    <addon.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-lg">{addon.name}</span>
                                                    {addon.note && (
                                                        <span className="text-xs text-white/40 mt-0.5">{addon.note}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-lg opacity-80">+${addon.price}</span>
                                                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${selectedAddons.has(addon.id)
                                                        ? 'bg-white border-white'
                                                        : 'border-white/30'
                                                        }`}>
                                                        {selectedAddons.has(addon.id) && <Check className="w-4 h-4 text-black" />}
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={selectedAddons.has(addon.id)}
                                                            onChange={() => toggleAddon(addon.id)}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-white/50">+{addon.time} Day{addon.time > 1 ? 's' : ''}</span>
                                            </div>

                                            {/* Selection Glow Effect */}
                                            {selectedAddons.has(addon.id) && (
                                                <div className="absolute inset-0 rounded-xl bg-white/5 pointer-events-none animate-pulse opacity-20" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 p-10 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-sm sticky top-24">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Price & Action */}
                                <div className="flex flex-col h-full justify-between gap-8">
                                    <div>
                                        <h4 className="text-xl font-medium opacity-60 mb-6 text-left">Estimated Project Quote</h4>

                                        <div className="flex flex-col items-start gap-2 mb-6">
                                            <div className="text-7xl font-bold font-display tracking-tight">
                                                <span className="text-3xl align-top opacity-40 mr-1">$</span>
                                                {totalPrice}
                                            </div>
                                            <div className="text-lg text-white/40">Total Investment</div>
                                        </div>

                                        <div className="flex flex-col items-start gap-2 mb-8">
                                            <div className="text-4xl font-bold font-display text-white/90">
                                                {totalTime} <span className="text-xl opacity-50 font-normal">Days</span>
                                            </div>
                                            <div className="text-base text-white/40">Estimated Timeline</div>
                                        </div>

                                        <div className="w-full border border-white/10 rounded-2xl bg-white/5 p-5 mb-2 group cursor-pointer hover:bg-white/10 transition-colors">
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <div className="text-base font-bold text-white/90 mb-1">Custom Need?</div>
                                                    <div className="text-xs text-white/50 group-hover:text-white/70 transition-colors">Contact us for a tailored quote.</div>
                                                </div>
                                                <button
                                                    onClick={() => setContactConfig({ isOpen: true, need: "Custom Development" })}
                                                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-all w-full"
                                                >
                                                    Contact Us
                                                    <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const addonNames = Array.from(selectedAddons).map(id => addons.find(a => a.id === id)?.name).filter(Boolean) as string[];
                                            setContactConfig({
                                                isOpen: true,
                                                need: "Information about a Package",
                                                package: `${currentPackage.name} ($${currentPackage.price} USD)`,
                                                addons: addonNames
                                            });
                                        }}
                                        className="w-full py-4 rounded-xl text-lg font-bold bg-white text-black hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    >
                                        Book This Package
                                    </button>
                                </div>

                                {/* Right Column: Features */}
                                <div className="bg-white/5 rounded-2xl p-6 h-full">
                                    <h5 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-4">Package Includes</h5>
                                    <ul className="space-y-3">
                                        {currentPackage.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-white/80 text-sm">
                                                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check className="w-2.5 h-2.5 text-white" />
                                                </div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {Array.from(selectedAddons).map((addonId) => {
                                            const addon = addons.find(a => a.id === addonId);
                                            return addon ? (
                                                <li key={addon.id} className="flex items-start gap-3 text-white font-medium text-sm">
                                                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Check className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                    <span>{addon.name}</span>
                                                </li>
                                            ) : null;
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ContactModal
                isOpen={contactConfig.isOpen}
                onClose={() => setContactConfig({ ...contactConfig, isOpen: false })}
                initialNeed={contactConfig.need}
                initialPackage={contactConfig.package}
                initialAddons={contactConfig.addons}
            />
        </section>
    );
}
