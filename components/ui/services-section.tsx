"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Code, Layout, Smartphone, Globe, Database, Server } from 'lucide-react';
import TextBlockAnimation from './text-block-animation';

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

const services = [
    {
        title: "Web Development",
        description: "Custom websites built with modern frameworks like Next.js and React for potential scalability.",
        icon: <Code className="w-8 h-8 text-purple-400" />
    },
    {
        title: "Web Apps",
        description: "Complex, high-performance web applications tailored to streamline your business operations.",
        icon: <Server className="w-8 h-8 text-pink-400" />
    },
    {
        title: "E-commerce",
        description: "Scalable online stores with secure payment integration and intuitive product management.",
        icon: <Database className="w-8 h-8 text-blue-400" />
    },
    {
        title: "Portfolios",
        description: "Stunning creative showcases designed to highlight your work and attract high-value clients.",
        icon: <Layout className="w-8 h-8 text-green-400" />
    }
];

interface ServicesSectionProps {
    targetColors?: string[];
}

export default function ServicesSection({ targetColors }: ServicesSectionProps) {
    // State to hold the current visible colors for the gradient
    // Default to a nice purple/pink if no props yet
    const [currentGradientColors, setCurrentGradientColors] = useState<[string, string]>(["#c084fc", "#db2777"]); // purple-400 to pink-600

    // Refs for animation
    const animRef = useRef<number | null>(null);
    const startColorsRef = useRef<[string, string]>(["#c084fc", "#db2777"]);
    const targetColorsRef = useRef<[string, string]>(["#c084fc", "#db2777"]);

    // Calculate the CSS gradient string based on current state
    const accentGradient = `linear-gradient(135deg, ${currentGradientColors[0]} 0%, ${currentGradientColors[1]} 100%)`;

    const handleColorChange = (colors: string[]) => {
        if (!colors || colors.length === 0) return;

        // No inversion needed here as we are on black background
        // Use the first color, and maybe mix it with the second 
        const primary = colors[0];
        const secondary = colors[1] || colors[0];

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

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    return (
        <section id="services" className="relative w-full min-h-screen py-24 px-6 z-10 bg-transparent text-white mix-blend-normal pointer-events-none">
            <div className="max-w-7xl mx-auto pointer-events-auto">
                {/* Section Header */}
                <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <TextBlockAnimation blockColor="#ffffff" delay={0.2}>
                            <h2 className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: currentGradientColors[0], transition: 'color 1s' }}>
                                What We Offer
                            </h2>
                        </TextBlockAnimation>

                        <div className="overflow-hidden">
                            <h3 className="text-4xl md:text-6xl font-display font-bold leading-none mb-6">
                                Full-Spectrum <br />
                                <span
                                    className="text-transparent bg-clip-text transition-all duration-1000"
                                    style={{ backgroundImage: accentGradient }}
                                >
                                    Digital Solutions.
                                </span>
                            </h3>
                        </div>
                        <p className="text-xl text-white/60 max-w-xl">
                            We are a web development company committed to transforming your ideas into powerful digital products.
                        </p>
                    </div>

                    <a href="#contact" className="hidden md:flex items-center gap-2 pb-2 border-b border-white/20 hover:border-white transition-colors group">
                        <span>View All Services</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
                                {service.icon}
                            </div>
                            <h4 className="text-2xl font-bold mb-3">{service.title}</h4>
                            <p className="text-white/50 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
