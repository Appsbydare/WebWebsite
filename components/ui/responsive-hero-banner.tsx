"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from "next/image";
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
    onColorsChange?: (colors: string[]) => void; // Callback to notify parent of color changes
    rawColors?: string[]; // Raw neon trail colors for nav bar when in dark section
}

const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
    // Defaulting to DDF Branding
    backgroundImageUrl,
    navLinks = [
        { label: "Services", href: "#services" },
        { label: "Work", href: "#work" },
        { label: "Pricing", href: "#pricing" },
        { label: "About", href: "#about" },
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
    overlayOpacity = 0.5, // Stronger white fade to blend grid
    onColorsChange, // Callback to notify parent of color changes
    rawColors = [] // Raw neon trail colors for nav bar when in dark section
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // State to hold the current visible colors for the gradient (inverted for hero section)
    const [currentGradientColors, setCurrentGradientColors] = useState<[string, string]>(["#3b82f6", "#8b5cf6"]);
    const [accentColor, setAccentColor] = useState<string>("#3b82f6");

    // State to hold raw colors for nav bar when in dark section
    const [rawGradientColors, setRawGradientColors] = useState<[string, string]>(["#3b82f6", "#8b5cf6"]);
    const rawAnimRef = useRef<number | null>(null);
    const rawStartColorsRef = useRef<[string, string]>(["#3b82f6", "#8b5cf6"]);
    const rawTargetColorsRef = useRef<[string, string]>(["#3b82f6", "#8b5cf6"]);

    // Refs for animation
    const animRef = useRef<number | null>(null);
    const startColorsRef = useRef<[string, string]>(["#3b82f6", "#8b5cf6"]);
    const targetColorsRef = useRef<[string, string]>(["#3b82f6", "#8b5cf6"]);

    // Calculate the CSS gradient string based on current state
    const accentGradient = `linear-gradient(135deg, ${currentGradientColors[0]} 0%, ${currentGradientColors[1]} 100%)`;

    // Update raw colors when prop changes (for nav bar in dark section)
    useEffect(() => {
        if (!rawColors || rawColors.length === 0) return;

        const primary = rawColors[0];
        const secondary = rawColors[1] || rawColors[0];

        rawStartColorsRef.current = [...rawGradientColors];
        rawTargetColorsRef.current = [primary, secondary];

        const startTime = performance.now();
        const duration = 1000; // Match the 1000ms in neon-flow

        if (rawAnimRef.current) cancelAnimationFrame(rawAnimRef.current);

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            const c1 = lerpColor(rawStartColorsRef.current[0], rawTargetColorsRef.current[0], ease);
            const c2 = lerpColor(rawStartColorsRef.current[1], rawTargetColorsRef.current[1], ease);

            setRawGradientColors([c1, c2]);

            if (progress < 1) {
                rawAnimRef.current = requestAnimationFrame(animate);
            }
        };

        rawAnimRef.current = requestAnimationFrame(animate);
    }, [rawColors]);

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            if (rawAnimRef.current) cancelAnimationFrame(rawAnimRef.current);
        };
    }, []);

    const handleColorChange = (colors: string[]) => {
        if (!colors || colors.length === 0) return;

        // Notify parent of raw color changes (before inversion)
        // Services section needs raw colors, hero section will invert them
        if (onColorsChange) {
            onColorsChange(colors);
        }

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

    // Custom Smooth Scroll Handler
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href) as HTMLElement;
            if (target) {
                // Access the global Lenis instance
                const lenis = (window as any).lenis;
                if (lenis) {
                    lenis.scrollTo(target, {
                        duration: 2.5, // Super smooth, slower scroll
                        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Same easing or custom
                    });
                } else {
                    // Fallback
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    const [scrolledPastHero, setScrolledPastHero] = useState(false);
    const [inTestimonialSection, setInTestimonialSection] = useState(false);
    const [activeSection, setActiveSection] = useState<'hero' | 'services' | 'pricing' | 'other'>('hero');

    // Section Colors
    const SECTION_COLORS = {
        hero: null, // Uses dynamic neon trail
        services: ['#c084fc', '#db2777'], // Purple/Pink
        pricing: ['#fbbf24', '#22d3ee'], // Gold/Cyan
    };

    // Scroll listener for adaptive nav
    useEffect(() => {
        const handleScroll = () => {
            const threshold = window.innerHeight - 100;
            const scrollY = window.scrollY;

            // Elements
            const testimonialSection = document.getElementById("testimonial-section");
            const servicesSection = document.getElementById("services");
            const pricingSection = document.getElementById("pricing");

            // Check Testimonial (White Background Logic)
            let isInTestimonial = false;
            if (testimonialSection) {
                const rect = testimonialSection.getBoundingClientRect();
                isInTestimonial = rect.top < 100 && rect.bottom > 0;
                setInTestimonialSection(isInTestimonial);
            }

            // Check Active Section for Color Theme
            let currentActive = 'hero';
            const navbarOffset = 100;

            if (pricingSection) {
                const rect = pricingSection.getBoundingClientRect();
                if (rect.top < navbarOffset && rect.bottom > navbarOffset) {
                    currentActive = 'pricing';
                }
            }

            if (currentActive === 'hero' && servicesSection) { // Only check if not already found deeper (Pricing is usually lower)
                // Note: Check overlap precedence. Pricing is below Services.
                // Actually, simpler logic: Check all, last one wins? 
                // Or simple check:
                const rect = servicesSection.getBoundingClientRect();
                if (rect.top < navbarOffset && rect.bottom > navbarOffset) {
                    currentActive = 'services';
                }
            }

            // Override active section if we are in Hero (top relative)
            if (scrollY < threshold) {
                currentActive = 'hero';
            }

            setActiveSection(currentActive as any);

            // Only set scrolledPastHero if we're past hero AND not in testimonial section
            if (window.scrollY > threshold && !isInTestimonial) {
                setScrolledPastHero(true);
            } else if (window.scrollY <= threshold || isInTestimonial) {
                setScrolledPastHero(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        // Check on mount
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Nav bar gradient: use inverted colors when in hero or testimonial section (both have white bg), raw colors when in dark section
    const navGradient = useMemo(() => {
        // If specific section active, usage logic can vary, 
        // But navGradient is primarily for the BACKGROUND of the button or special elements.

        if (inTestimonialSection) {
            return accentGradient;
        }
        return scrolledPastHero
            ? `linear-gradient(135deg, ${rawGradientColors[0]} 0%, ${rawGradientColors[1]} 100%)`
            : accentGradient;
    }, [scrolledPastHero, inTestimonialSection, rawGradientColors, accentGradient]);

    // Effective Accent Gradient for Shimmer
    const effectiveAccentGradient = useMemo(() => {
        if (activeSection === 'pricing') {
            return `linear-gradient(135deg, ${SECTION_COLORS.pricing[0]} 0%, ${SECTION_COLORS.pricing[1]} 100%)`;
        }
        if (activeSection === 'services') {
            return `linear-gradient(135deg, ${SECTION_COLORS.services[0]} 0%, ${SECTION_COLORS.services[1]} 100%)`;
        }
        return accentGradient; // Default dynamic trail
    }, [activeSection, accentGradient]);

    const navAccentColor = useMemo(() => {
        if (inTestimonialSection) {
            return accentColor;
        }
        return scrolledPastHero ? rawGradientColors[0] : accentColor;
    }, [scrolledPastHero, inTestimonialSection, rawGradientColors, accentColor]);

    // Scroll listener for adaptive nav
    useEffect(() => {
        const handleScroll = () => {
            const threshold = window.innerHeight - 100;
            const testimonialSection = document.getElementById("testimonial-section");

            let isInTestimonial = false;
            if (testimonialSection) {
                const rect = testimonialSection.getBoundingClientRect();
                // Check if we've scrolled into the testimonial section
                // The section is considered "active" when its top reaches the navbar area (approx 100px from top)
                // This ensures the navbar adapts only when it physically overlaps the white testimonial section
                isInTestimonial = rect.top < 100 && rect.bottom > 0;
                setInTestimonialSection(isInTestimonial);
            }

            // Only set scrolledPastHero if we're past hero AND not in testimonial section
            if (window.scrollY > threshold && !isInTestimonial) {
                setScrolledPastHero(true);
            } else if (window.scrollY <= threshold || isInTestimonial) {
                setScrolledPastHero(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        // Check on mount
        handleScroll();
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

                {/* Dot Grid Fixed - White dots (become black when inverted in hero, white in services) */}
                <div className="fixed inset-0 z-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                {/* Hero Inversion Layer - Creates the White/Ink look ONLY for this section */}
                <div className="absolute inset-0 z-0 bg-white mix-blend-difference pointer-events-none"></div>

                {/* Gradient Overlay Removed to remove the fade */}
            </div>

            {/* Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-slide-down" style={{ animationDuration: '0.8s' }}>
                <div className="max-w-5xl mx-auto px-6 mt-4">
                    <div className={cn(
                        "relative flex items-center justify-between py-3 px-4 rounded-full border backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-500",
                        (scrolledPastHero && !inTestimonialSection)
                            ? "bg-black/50 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                            : "bg-white/50 border-black/5"
                    )}>

                        {/* Logo */}
                        <a href="/" className="flex items-center px-3 group relative">
                            <div className="relative inline-block">
                                {/* Splash SVG near D letter with gradient */}
                                <div
                                    className="absolute pointer-events-none transition-all duration-1000"
                                    style={{
                                        left: '-35px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '110px',
                                        height: '110px',
                                        zIndex: 0,
                                        opacity: 0.8
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 1500 1499.999933"
                                        preserveAspectRatio="xMidYMid meet"
                                        className="w-full h-full"
                                    >
                                        <defs>
                                            <linearGradient id={`splashGradientNav-${navAccentColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor={inTestimonialSection ? currentGradientColors[0] : (scrolledPastHero ? rawGradientColors[0] : currentGradientColors[0])} stopOpacity="0.9" />
                                                <stop offset="50%" stopColor={inTestimonialSection ? currentGradientColors[1] : (scrolledPastHero ? rawGradientColors[1] : currentGradientColors[1])} stopOpacity="0.85" />
                                                <stop offset="100%" stopColor={inTestimonialSection ? currentGradientColors[0] : (scrolledPastHero ? rawGradientColors[0] : currentGradientColors[0])} stopOpacity="0.7" />
                                            </linearGradient>
                                        </defs>
                                        <g clipPath="url(#4292a66c9a)">
                                            <path
                                                fill={`url(#splashGradientNav-${navAccentColor})`}
                                                d="M 812.78125 290.222656 C 812.15625 291.476562 812.15625 292.726562 812.78125 293.980469 C 810.902344 297.945312 809.023438 301.703125 807.144531 305.671875 C 805.890625 305.671875 804.847656 305.671875 803.59375 305.671875 C 802.96875 301.914062 801.921875 298.15625 801.921875 294.398438 C 802.132812 287.089844 803.175781 286.671875 812.78125 290.222656 Z M 1173.636719 738.21875 C 1171.546875 747.402344 1169.25 755.960938 1173.425781 765.148438 C 1174.261719 766.816406 1171.339844 769.949219 1170.085938 772.453125 C 1170.921875 779.550781 1171.964844 786.441406 1172.800781 793.328125 C 1169.25 795.417969 1165.699219 797.503906 1161.941406 799.800781 C 1161.105469 801.46875 1161.105469 802.933594 1161.523438 804.601562 C 1152.128906 824.433594 1142.519531 844.265625 1133.125 863.890625 C 1133.125 871.820312 1133.125 879.546875 1133.332031 887.480469 C 1132.078125 888.730469 1130.199219 889.984375 1129.574219 891.445312 C 1126.648438 899.167969 1126.230469 909.398438 1120.804688 914.410156 C 1115.375 919.417969 1105.140625 920.046875 1096.996094 921.714844 C 1086.347656 923.800781 1081.753906 927.976562 1088.644531 938.414062 C 1082.378906 945.511719 1086.136719 951.359375 1089.480469 958.664062 C 1093.445312 967.222656 1086.136719 974.53125 1081.753906 981.628906 C 1081.753906 983.089844 1081.542969 984.550781 1080.917969 986.011719 C 1076.949219 989.351562 1072.144531 990.605469 1067.132812 990.605469 C 1059.824219 989.351562 1053.769531 992.066406 1049.175781 997.703125 C 1046.460938 999.789062 1042.910156 1001.042969 1040.613281 1003.757812 L 1041.03125 1003.964844 C 1032.46875 1014.613281 1024.535156 1011.480469 1016.808594 1003.128906 C 1016.808594 1004.800781 1016.808594 1006.261719 1016.808594 1007.933594 C 1017.851562 1008.351562 1018.894531 1008.976562 1019.9375 1009.8125 C 1021.609375 1011.691406 1023.070312 1013.570312 1024.324219 1015.65625 C 1025.578125 1017.535156 1026.832031 1019.621094 1027.875 1021.710938 C 1028.710938 1023.378906 1029.753906 1024.839844 1030.589844 1026.511719 C 1031.632812 1027.554688 1032.261719 1029.015625 1032.886719 1030.269531 C 1034.140625 1032.355469 1035.601562 1034.445312 1036.855469 1036.53125 C 1037.898438 1038.621094 1038.734375 1040.707031 1039.570312 1043.003906 C 1040.613281 1046.34375 1041.03125 1049.890625 1041.449219 1053.234375 C 1041.65625 1053.859375 1041.65625 1054.484375 1041.867188 1054.902344 C 1043.535156 1054.066406 1045 1053.859375 1046.667969 1055.320312 L 1046.667969 1055.527344 C 1048.132812 1057.824219 1050.21875 1059.914062 1051.679688 1062.210938 C 1051.679688 1067.84375 1051.679688 1073.273438 1051.472656 1078.910156 L 1049.175781 1078.285156 C 1049.175781 1078.285156 1046.878906 1078.492188 1046.878906 1078.492188 C 1041.867188 1073.691406 1035.601562 1069.722656 1033.09375 1062.625 C 1031.632812 1062.835938 1030.171875 1062.625 1028.710938 1061.792969 L 1026.203125 1063.042969 L 1023.488281 1062.835938 C 1021.609375 1064.089844 1019.730469 1065.339844 1017.851562 1066.800781 C 1011.378906 1055.738281 1004.902344 1044.671875 998.429688 1033.609375 C 980.886719 1027.972656 967.730469 1037.992188 954.367188 1046.761719 C 949.148438 1050.101562 948.9375 1056.363281 947.265625 1061.792969 C 947.058594 1066.59375 946.640625 1071.394531 946.640625 1076.195312 C 946.640625 1082.042969 946.433594 1087.886719 952.277344 1091.644531 C 952.277344 1091.644531 952.277344 1091.851562 952.277344 1091.851562 C 961.886719 1095.402344 969.820312 1101.246094 975.457031 1109.804688 C 976.292969 1114.191406 978.382812 1118.78125 977.964844 1123.167969 C 976.921875 1137.988281 971.28125 1141.121094 953.53125 1137.363281 C 948.730469 1130.472656 946.640625 1122.957031 946.222656 1114.605469 C 945.804688 1094.984375 944.761719 1093.941406 924.503906 1092.269531 C 922.835938 1095.609375 920.953125 1098.949219 919.492188 1102.5 C 917.195312 1107.71875 913.644531 1109.804688 908.632812 1106.046875 C 904.875 1103.125 901.953125 1099.367188 898.191406 1096.445312 C 887.125 1087.886719 874.59375 1087.261719 865.199219 1097.488281 C 858.515625 1104.585938 850.789062 1109.386719 843.480469 1115.234375 C 843.269531 1127.339844 840.554688 1139.449219 843.480469 1151.347656 C 844.316406 1154.6875 846.613281 1157.820312 848.28125 1160.953125 C 848.074219 1162.832031 848.074219 1164.917969 847.867188 1166.796875 C 842.851562 1177.859375 835.335938 1179.53125 825.9375 1172.015625 L 825.9375 1171.808594 C 825.519531 1164.082031 824.476562 1156.566406 824.476562 1148.84375 C 824.894531 1130.890625 817.792969 1117.320312 802.132812 1108.554688 C 789.8125 1111.894531 777.28125 1114.816406 764.960938 1118.78125 C 754.101562 1122.332031 764.753906 1126.714844 765.167969 1130.683594 C 759.324219 1131.933594 753.058594 1131.726562 749.089844 1137.363281 C 748.046875 1137.363281 747.210938 1137.570312 746.167969 1137.363281 C 731.128906 1135.066406 720.0625 1140.492188 713.171875 1154.269531 C 714.007812 1154.898438 714.84375 1155.316406 715.886719 1155.523438 C 712.546875 1159.074219 708.578125 1161.160156 703.566406 1161.371094 C 703.148438 1160.742188 702.730469 1160.324219 702.523438 1159.699219 C 702.523438 1159.90625 702.523438 1159.90625 702.523438 1160.117188 C 702.523438 1160.117188 703.773438 1161.371094 703.773438 1161.371094 C 701.894531 1163.457031 700.015625 1165.335938 698.136719 1167.421875 C 696.046875 1165.335938 693.960938 1163.25 691.871094 1160.953125 C 689.992188 1160.742188 688.320312 1160.535156 686.441406 1160.742188 C 680.804688 1154.6875 675.375 1148.84375 669.734375 1142.789062 C 662.636719 1139.242188 668.691406 1130.265625 662.636719 1126.296875 C 659.921875 1123.585938 656.160156 1122.539062 653.238281 1120.242188 C 652.613281 1119.617188 652.195312 1118.992188 651.777344 1118.363281 C 651.148438 1118.78125 650.523438 1119.410156 649.898438 1119.410156 C 646.554688 1123.792969 643.214844 1128.175781 639.875 1132.5625 C 637.160156 1132.144531 634.027344 1132.351562 631.730469 1131.097656 C 625.253906 1127.550781 632.148438 1120.035156 627.96875 1116.277344 C 624.003906 1112.730469 616.902344 1113.773438 613.769531 1108.136719 C 610.011719 1101.246094 609.800781 1093.730469 609.800781 1086.214844 C 592.886719 1077.238281 576.179688 1068.261719 559.058594 1059.496094 C 548.824219 1054.277344 538.59375 1053.648438 529.820312 1063.042969 C 527.523438 1076.40625 520.007812 1087.46875 512.488281 1098.324219 C 506.640625 1106.464844 499.125 1111.683594 488.265625 1109.179688 C 484.503906 1101.039062 482.207031 1093.3125 489.101562 1085.382812 C 495.15625 1078.074219 500.585938 1070.351562 506.433594 1062.625 C 505.386719 1053.859375 507.894531 1044.257812 498.914062 1037.367188 C 492.230469 1032.148438 497.453125 1020.667969 488.890625 1015.65625 C 482.417969 1008.765625 473.019531 1006.054688 465.921875 1000 C 465.292969 999.164062 464.875 998.121094 464.25 997.285156 C 463.414062 997.496094 462.371094 997.910156 461.535156 998.121094 C 439.191406 1008.351562 438.5625 1008.351562 436.683594 984.34375 C 436.058594 976.199219 431.046875 973.070312 426.035156 968.6875 C 420.1875 963.675781 421.441406 960.542969 430 957.414062 C 431.671875 956.785156 433.761719 956.996094 435.640625 956.996094 C 435.640625 956.996094 435.640625 956.996094 435.640625 957.203125 C 438.144531 952.402344 442.949219 951.777344 447.335938 950.734375 C 448.167969 937.789062 451.09375 925.054688 446.5 912.320312 C 431.882812 905.640625 418.308594 896.246094 400.347656 899.378906 C 395.128906 900.214844 389.28125 896.457031 383.640625 895.203125 C 371.320312 892.28125 364.011719 884.972656 359.625 872.867188 C 352.734375 853.867188 352.109375 854.078125 332.0625 863.679688 C 327.886719 865.769531 323.707031 868.0625 319.324219 870.152344 C 310.550781 866.601562 314.101562 859.921875 315.148438 853.867188 C 332.269531 848.023438 349.394531 842.179688 366.519531 836.332031 C 370.277344 832.367188 375.289062 831.324219 380.09375 829.234375 C 382.597656 828.398438 385.105469 827.773438 387.820312 827.566406 C 388.445312 827.566406 389.28125 827.566406 389.90625 827.566406 C 390.117188 822.347656 388.234375 816.5 390.949219 811.910156 C 391.160156 811.28125 391.160156 810.863281 391.367188 810.238281 C 404.734375 799.175781 404.105469 786.023438 396.171875 772.246094 C 395.964844 771.410156 395.964844 770.367188 395.753906 769.53125 C 392.414062 767.859375 389.070312 766.398438 385.9375 764.3125 C 380.71875 760.972656 378.210938 755.960938 379.046875 749.699219 C 378.628906 747.820312 378.839844 746.148438 379.464844 744.480469 C 384.894531 744.269531 390.324219 744.0625 395.964844 743.644531 C 397.007812 743.644531 398.050781 743.644531 399.09375 743.644531 C 399.722656 742.808594 399.929688 741.765625 400.765625 740.929688 C 401.601562 740.304688 402.4375 739.679688 403.273438 739.050781 C 406.195312 732.371094 405.988281 725.484375 402.019531 718.800781 C 398.675781 718.800781 396.589844 717.339844 395.335938 714.417969 C 393.875 713.582031 392.203125 713.164062 390.535156 712.957031 C 388.234375 712.957031 385.9375 713.164062 383.433594 713.164062 C 378.839844 714 374.035156 714.417969 369.441406 715.671875 C 364.847656 716.921875 360.671875 719.636719 356.078125 720.472656 C 348.140625 722.144531 341.25 719.011719 338.535156 713.582031 C 334.777344 705.652344 337.492188 697.300781 346.472656 691.871094 C 348.769531 690.410156 352.109375 690.410156 354.824219 689.785156 C 363.59375 684.773438 371.949219 688.53125 380.300781 690.828125 C 380.71875 691.039062 381.136719 691.039062 381.554688 691.246094 C 386.773438 686.652344 393.875 685.191406 400.558594 683.105469 C 408.492188 681.851562 412.878906 674.753906 419.558594 671.625 C 421.230469 671.414062 422.484375 671.625 423.738281 672.039062 C 422.273438 654.714844 405.359375 639.058594 418.308594 620.058594 C 426.660156 612.335938 437.3125 607.742188 446.5 601.273438 C 446.707031 599.808594 446.707031 598.558594 446.917969 597.304688 C 448.585938 589.789062 448.796875 582.273438 448.796875 574.550781 C 445.453125 574.132812 443.574219 571.210938 441.488281 568.078125 C 439.816406 565.992188 437.9375 563.902344 435.429688 562.652344 L 435.222656 562.441406 C 434.179688 559.730469 432.089844 558.058594 429.375 557.015625 C 425.617188 554.71875 422.066406 552.632812 418.308594 550.335938 C 416.21875 548.457031 414.339844 546.578125 413.085938 544.070312 C 413.085938 544.070312 413.296875 544.070312 413.296875 544.070312 C 420.605469 539.0625 422.691406 533.632812 415.59375 526.328125 C 413.503906 524.03125 416.429688 521.527344 418.933594 520.066406 C 420.605469 521.109375 422.273438 521.527344 424.15625 521.316406 C 431.671875 527.164062 439.398438 533.214844 446.917969 539.0625 C 449.003906 540.941406 451.09375 542.820312 452.972656 544.699219 C 456.3125 548.039062 461.324219 546.996094 465.085938 549.289062 C 466.753906 549.917969 468.636719 550.335938 470.515625 550.542969 C 472.394531 551.585938 473.019531 552.632812 472.601562 553.675781 C 484.296875 554.300781 495.78125 553.675781 505.386719 544.488281 C 507.894531 542.402344 508.730469 539.480469 509.566406 536.558594 C 506.015625 531.753906 504.136719 525.703125 499.75 521.527344 C 488.683594 514.429688 477.40625 507.539062 476.570312 492.300781 C 485.757812 484.785156 495.574219 482.488281 503.71875 493.136719 C 509.773438 501.066406 523.140625 502.945312 522.929688 516.097656 C 532.535156 521.734375 541.308594 513.59375 550.496094 514.636719 C 550.703125 511.296875 551.121094 508.164062 551.332031 504.824219 C 544.4375 500.023438 542.769531 492.089844 539.84375 484.992188 C 536.085938 476.015625 539.007812 471.007812 549.449219 468.5 C 551.75 467.875 554.671875 468.917969 557.175781 469.335938 C 557.175781 468.917969 557.175781 468.710938 557.175781 468.292969 C 559.683594 466.832031 561.980469 467.039062 564.070312 468.917969 C 571.796875 468.917969 579.523438 469.128906 587.25 469.128906 C 596.4375 469.753906 601.867188 465.160156 603.746094 456.601562 C 604.789062 450.964844 604.789062 445.121094 605.207031 439.484375 C 599.570312 425.289062 598.527344 411.71875 609.800781 398.984375 C 611.679688 396.898438 610.636719 391.886719 610.636719 388.339844 C 626.300781 397.105469 636.949219 411.929688 651.148438 422.574219 C 651.148438 424.453125 651.148438 426.542969 651.148438 428.421875 C 659.085938 429.671875 668.691406 425.078125 674.957031 433.847656 C 680.804688 434.890625 685.398438 438.023438 688.320312 443.449219 C 691.246094 449.503906 697.300781 449.921875 702.730469 451.175781 C 715.050781 445.121094 722.152344 434.890625 726.953125 422.574219 C 726.953125 417.773438 727.789062 413.390625 733.011719 411.300781 C 732.59375 409.421875 732.800781 407.542969 733.21875 405.664062 C 739.691406 404.414062 744.703125 407.960938 749.714844 411.300781 C 751.804688 418.398438 753.894531 425.496094 755.980469 432.59375 C 755.144531 433.429688 754.519531 434.472656 753.683594 435.308594 C 754.519531 435.519531 755.355469 435.933594 756.398438 436.144531 C 756.609375 434.890625 756.398438 433.640625 755.980469 432.59375 C 757.652344 433.011719 759.324219 433.222656 760.992188 433.640625 C 764.753906 428.003906 768.511719 422.367188 772.480469 416.519531 C 772.894531 414.640625 773.523438 412.761719 773.941406 410.882812 C 775.402344 408.796875 777.074219 407.125 779.160156 405.664062 C 781.039062 405.457031 782.921875 405.457031 784.800781 405.246094 C 786.679688 405.246094 788.765625 405.246094 790.648438 405.246094 C 792.109375 404.621094 793.777344 403.996094 795.449219 403.785156 C 796.285156 398.777344 796.910156 393.765625 797.746094 388.757812 C 796.910156 388.546875 796.074219 388.128906 795.242188 387.921875 C 798.789062 364.75 804.21875 341.578125 802.339844 317.777344 C 802.757812 313.8125 803.386719 309.84375 803.800781 305.878906 C 805.054688 305.878906 806.101562 305.878906 807.351562 305.878906 C 807.769531 325.292969 808.1875 344.917969 808.605469 364.332031 C 809.859375 365.792969 810.277344 367.253906 810.277344 368.714844 C 810.277344 370.386719 810.066406 371.21875 809.648438 371.21875 C 809.023438 373.308594 808.398438 375.394531 807.980469 377.484375 C 809.441406 385.832031 809.648438 394.394531 808.605469 402.953125 C 806.726562 419.027344 810.066406 433.011719 820.925781 445.121094 C 832.410156 447.625 843.898438 446.582031 854.964844 443.035156 C 862.484375 440.527344 869.792969 439.691406 877.519531 439.484375 C 881.277344 433.222656 887.960938 431.96875 894.015625 430.089844 C 902.160156 437.8125 913.4375 443.242188 913.019531 457.019531 C 917.40625 460.570312 922 463.910156 926.175781 467.667969 C 932.230469 473.304688 938.289062 473.71875 946.847656 471.84375 C 966.6875 467.667969 977.546875 479.773438 972.117188 498.980469 C 970.445312 504.617188 968.984375 509.628906 970.863281 515.261719 C 990.910156 514.21875 1010.125 519.230469 1028.917969 525.492188 C 1032.886719 523.824219 1036.855469 523.824219 1040.195312 527.371094 C 1040.195312 527.371094 1039.988281 527.371094 1039.988281 527.371094 C 1039.988281 529.042969 1040.195312 530.921875 1040.613281 532.589844 C 1043.328125 545.949219 1033.929688 555.34375 1028.5 565.992188 C 1058.15625 576.847656 1058.15625 576.847656 1057.945312 608.371094 C 1061.914062 608.160156 1066.089844 608.160156 1070.058594 607.953125 C 1071.9375 607.953125 1073.609375 607.953125 1075.488281 607.953125 C 1077.574219 610.039062 1079.453125 612.335938 1081.542969 614.421875 C 1081.75 614.421875 1081.960938 614.632812 1082.378906 614.632812 C 1081.75 612.960938 1081.335938 611.082031 1081.125 609.203125 C 1090.523438 599.808594 1100.128906 604.402344 1109.945312 608.578125 C 1109.945312 620.269531 1112.03125 631.332031 1118.085938 641.769531 C 1124.351562 652.625 1130.410156 663.898438 1134.375 675.589844 C 1139.179688 689.992188 1148.996094 697.300781 1162.566406 701.265625 C 1162.359375 707.945312 1165.910156 712.75 1170.503906 717.132812 C 1171.964844 717.339844 1173.21875 717.757812 1174.472656 718.386719 C 1174.261719 725.273438 1175.097656 731.953125 1173.636719 738.21875 Z M 459.238281 986.222656 C 459.238281 986.222656 459.445312 986.222656 459.445312 986.222656 C 459.445312 986.011719 459.238281 986.011719 459.238281 985.804688 C 459.238281 986.011719 459.238281 986.011719 459.238281 986.222656 C 458.820312 985.59375 458.402344 985.175781 457.984375 984.550781 C 458.402344 985.175781 458.609375 985.804688 458.820312 986.429688 C 459.027344 986.429688 459.027344 986.429688 459.238281 986.222656 Z M 900.28125 473.71875 C 900.074219 473.929688 900.074219 474.136719 899.863281 474.136719 C 900.074219 474.136719 900.28125 473.929688 900.488281 473.929688 C 900.28125 473.71875 900.28125 473.71875 900.28125 473.71875 Z M 790.648438 544.28125 C 790.648438 544.488281 790.648438 544.488281 790.648438 544.699219 C 790.855469 544.699219 791.066406 544.699219 791.273438 544.699219 C 790.855469 544.699219 790.855469 544.488281 790.648438 544.28125 Z M 866.242188 781.636719 C 866.242188 781.847656 866.449219 781.847656 866.449219 782.054688 C 866.449219 781.847656 866.449219 781.429688 866.242188 781.222656 C 866.242188 781.429688 866.242188 781.429688 866.242188 781.636719 Z M 913.019531 764.519531 C 913.019531 764.730469 913.019531 764.730469 913.019531 764.519531 C 913.019531 764.730469 913.019531 764.730469 913.019531 764.519531 C 913.019531 764.730469 913.019531 764.730469 913.019531 764.519531 Z M 929.097656 758.882812 C 928.472656 759.71875 928.265625 760.136719 928.265625 760.136719 C 927.847656 760.761719 928.472656 760.34375 929.726562 759.300781 C 929.515625 759.09375 929.308594 758.882812 929.097656 758.882812 Z M 587.039062 974.53125 C 587.039062 974.738281 587.039062 974.738281 587.039062 974.949219 C 587.25 974.738281 587.25 974.53125 587.457031 974.320312 C 587.457031 974.53125 587.25 974.53125 587.039062 974.53125 C 587.039062 974.320312 586.832031 974.113281 586.832031 973.90625 C 586.621094 974.113281 586.621094 974.320312 586.414062 974.53125 C 586.621094 974.53125 586.832031 974.53125 587.039062 974.53125 Z M 666.601562 1098.742188 C 666.601562 1098.742188 667.648438 1097.28125 667.648438 1097.28125 C 667.648438 1097.28125 667.648438 1097.070312 667.4375 1097.070312 C 667.230469 1097.699219 666.8125 1098.117188 666.601562 1098.742188 Z M 499.960938 584.988281 Z M 586.621094 1003.757812 C 586.621094 1003.757812 586.621094 1003.964844 586.621094 1003.964844 C 586.832031 1003.757812 587.039062 1003.757812 587.039062 1003.546875 C 587.039062 1003.339844 587.039062 1003.128906 587.039062 1002.921875 C 586.621094 1003.339844 586.203125 1003.546875 585.789062 1003.757812 C 586.203125 1003.757812 586.414062 1003.757812 586.621094 1003.757812 Z M 1016.597656 1002.921875 C 1016.597656 1002.921875 1016.597656 1003.128906 1016.597656 1002.921875 C 1016.597656 1003.128906 1016.597656 1003.128906 1016.597656 1002.921875 C 1016.597656 1003.128906 1016.597656 1003.128906 1016.597656 1002.921875 Z M 912.183594 457.4375 C 912.183594 457.4375 912.183594 457.644531 912.183594 457.644531 C 912.394531 457.226562 912.8125 457.019531 913.019531 456.601562 C 913.019531 456.8125 912.183594 457.4375 912.183594 457.4375 Z M 802.132812 247.84375 C 809.023438 248.46875 813.199219 245.546875 813.828125 238.660156 C 814.246094 233.859375 813.828125 229.265625 813.617188 224.464844 C 814.660156 223.003906 816.332031 221.539062 816.960938 219.871094 C 820.71875 210.058594 819.257812 201.292969 812.992188 196.90625 C 811.738281 196.070312 808.816406 196.070312 807.769531 196.90625 C 800.878906 202.753906 795.242188 209.433594 801.921875 219.035156 C 801.921875 228.429688 801.921875 238.242188 802.132812 247.84375 Z M 389.070312 1176.398438 C 379.675781 1176.398438 365.890625 1186.210938 362.757812 1195.605469 C 361.925781 1198.109375 361.714844 1201.449219 362.550781 1203.957031 C 367.355469 1217.941406 385.523438 1221.28125 395.128906 1210.425781 C 400.558594 1204.164062 402.4375 1197.066406 402.019531 1188.925781 C 401.808594 1181.828125 396.378906 1176.398438 389.070312 1176.398438 Z M 1083.632812 598.347656 C 1083.632812 598.140625 1082.378906 597.515625 1081.753906 597.304688 C 1082.585938 599.601562 1083.421875 600.019531 1083.632812 598.347656 Z M 1096.996094 1138.195312 C 1097.414062 1136.527344 1097.414062 1134.855469 1097.414062 1133.1875 C 1090.3125 1124.628906 1083.003906 1116.277344 1075.90625 1107.71875 C 1073.191406 1105.214844 1070.683594 1105.421875 1068.386719 1108.34375 C 1070.894531 1121.914062 1083.214844 1130.054688 1086.972656 1143 C 1088.433594 1143.417969 1090.105469 1143.832031 1091.566406 1144.25 C 1092.402344 1149.261719 1093.238281 1154.480469 1094.074219 1159.492188 C 1095.953125 1161.371094 1098.039062 1163.039062 1099.921875 1164.917969 C 1103.050781 1164.917969 1106.394531 1164.710938 1109.527344 1164.710938 C 1114.957031 1151.347656 1103.679688 1145.921875 1096.996094 1138.195312 Z M 687.070312 1175.355469 C 683.101562 1177.027344 682.265625 1180.992188 680.804688 1184.542969 C 679.96875 1195.398438 679.132812 1206.042969 681.429688 1216.898438 C 687.695312 1217.734375 692.707031 1215.855469 695.421875 1209.59375 C 699.808594 1199.363281 699.179688 1189.132812 696.675781 1178.695312 C 694.585938 1174.9375 691.035156 1174.519531 687.070312 1175.355469 Z M 529.195312 377.273438 C 540.890625 385.625 553 381.65625 559.890625 368.714844 C 567.410156 354.9375 561.980469 342.828125 557.179688 330.304688 C 532.328125 326.964844 531.074219 327.382812 521.886719 344.082031 C 515.621094 355.355469 518.753906 369.757812 529.195312 377.273438 Z M 556.96875 330.09375 C 557.179688 330.304688 557.179688 330.304688 557.179688 330.304688 C 557.179688 330.304688 556.96875 330.09375 556.96875 330.09375 Z M 610.21875 387.292969 C 610.21875 387.503906 610.21875 387.503906 610.21875 387.710938 C 610.429688 387.710938 610.429688 387.921875 610.636719 387.921875 C 610.636719 387.710938 610.636719 387.710938 610.636719 387.503906 C 610.429688 387.503906 610.21875 387.292969 610.21875 387.292969 Z M 606.460938 367.046875 C 605.417969 366 602.910156 365.792969 601.449219 366.210938 C 600.195312 366.835938 598.527344 368.714844 598.527344 370.175781 C 597.691406 378.945312 604.371094 382.910156 610.21875 387.292969 C 611.683594 379.988281 613.144531 372.679688 606.460938 367.046875 Z M 773.730469 410.675781 C 775.402344 409.003906 777.28125 407.125 778.953125 405.457031 C 775.402344 405.246094 773.730469 406.917969 773.730469 410.675781 Z M 401.183594 1003.546875 C 397.425781 1000.625 398.679688 995.199219 395.335938 992.066406 C 391.996094 988.726562 386.984375 989.5625 383.433594 986.640625 C 379.675781 982.671875 375.914062 982.882812 372.574219 987.265625 C 363.804688 994.570312 362.132812 1004.175781 363.386719 1015.03125 C 364.847656 1027.554688 371.320312 1032.984375 384.058594 1030.6875 C 387.609375 1030.058594 390.953125 1027.972656 394.5 1026.511719 C 399.304688 1024.214844 398.050781 1018.371094 400.765625 1015.03125 L 400.558594 1015.238281 C 404.734375 1011.480469 404.316406 1007.722656 401.183594 1003.546875 Z M 395.335938 992.066406 Z M 307.839844 463.28125 C 311.386719 462.238281 313.476562 459.941406 314.730469 456.601562 C 314.101562 455.140625 313.683594 453.679688 313.683594 452.21875 C 311.804688 449.296875 309.507812 447 305.957031 446.164062 C 305.957031 446.164062 303.660156 446.375 303.660156 446.375 C 297.8125 455.140625 297.8125 455.140625 307.839844 463.28125 Z M 376.75 400.238281 C 379.464844 397.523438 382.179688 394.808594 384.894531 392.097656 C 384.476562 391.261719 384.058594 390.425781 383.433594 389.589844 C 380.925781 386.667969 377.378906 383.746094 374.035156 385.832031 C 370.484375 387.921875 371.320312 392.511719 372.992188 396.0625 C 373.828125 397.734375 375.496094 398.777344 376.75 400.238281 Z M 257.09375 924.21875 C 250.828125 919.628906 242.265625 919.417969 235.792969 923.386719 C 228.484375 928.1875 224.097656 937.582031 225.976562 945.304688 C 227.230469 950.316406 230.570312 953.65625 234.957031 955.742188 C 245.398438 960.753906 263.148438 948.4375 262.941406 935.703125 C 263.148438 931.316406 261.269531 927.144531 257.09375 924.21875 Z M 323.5 689.992188 C 323.5 680.808594 319.113281 673.292969 313.058594 666.613281 C 303.453125 660.558594 294.054688 661.394531 284.867188 667.449219 C 283.40625 667.449219 281.941406 667.449219 280.480469 667.449219 C 280.480469 669.117188 280.273438 670.578125 280.273438 672.25 L 279.644531 672.875 C 278.183594 673.085938 276.515625 673.292969 275.050781 673.5 C 275.050781 673.5 274.425781 676.214844 274.425781 676.214844 C 276.097656 676.84375 277.558594 677.675781 279.019531 678.722656 C 279.019531 682.269531 279.230469 686.027344 279.230469 689.578125 C 278.601562 693.332031 280.691406 695.210938 283.824219 696.257812 C 284.242188 697.925781 284.65625 699.597656 285.074219 701.265625 C 286.121094 701.265625 287.164062 701.265625 288.207031 701.476562 C 288.835938 703.144531 289.253906 705.023438 290.085938 706.484375 C 306.375 712.121094 317.652344 706.695312 323.5 689.992188 Z M 323.5 689.992188 "
                                                fillOpacity="1"
                                                fillRule="nonzero"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="4292a66c9a">
                                                <path d="M 225 196.050781 L 1175 196.050781 L 1175 1218 L 225 1218 Z M 225 196.050781 " clipRule="nonzero" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>
                                {/* Logo Image */}
                                <div className="relative z-10">
                                    <Image
                                        src="/images/logo.png"
                                        alt="Dynamic Design Factory"
                                        width={80}
                                        height={24}
                                        className="transition-opacity duration-300 group-hover:opacity-90"
                                        priority
                                    />
                                </div>
                            </div>
                        </a>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    className={cn(
                                        "group relative px-3 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                        link.isActive
                                            ? ((scrolledPastHero && !inTestimonialSection) ? "bg-white/10" : "bg-black/5")
                                            : ((scrolledPastHero && !inTestimonialSection) ? "hover:bg-white/10" : "hover:bg-black/5")
                                    )}
                                >
                                    {/* Base Text */}
                                    <span className={cn(
                                        "relative z-10 transition-opacity duration-300 group-hover:opacity-0",
                                        link.isActive
                                            ? ((scrolledPastHero && !inTestimonialSection) ? "text-white font-semibold" : "text-black font-semibold")
                                            : ((scrolledPastHero && !inTestimonialSection) ? "text-neutral-400" : "text-neutral-500")
                                    )}>
                                        {link.label}
                                    </span>

                                    {/* Gradient Hover Text */}
                                    <span
                                        className="absolute inset-0 z-20 flex items-center justify-center font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{
                                            backgroundImage: effectiveAccentGradient,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        {link.label}
                                    </span>
                                </a>
                            ))}
                        </nav>

                        {/* CTA & Mobile Toggle */}
                        <div className="flex items-center gap-3 pr-2">
                            <a
                                href={ctaButtonHref}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                                style={{ background: navGradient }}
                            >
                                {ctaButtonText}
                                <ArrowRight className="w-4 h-4" />
                            </a>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={cn(
                                    "md:hidden p-2 rounded-full transition-colors",
                                    (scrolledPastHero && !inTestimonialSection) ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-black hover:bg-black/10"
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
                            (scrolledPastHero && !inTestimonialSection)
                                ? "bg-black/90 border-white/10"
                                : "bg-white/90 border-black/5"
                        )}>
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className={cn(
                                        "px-4 py-3 text-lg font-medium rounded-xl transition-colors",
                                        (scrolledPastHero && !inTestimonialSection)
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
                                style={{ background: navGradient }}
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
