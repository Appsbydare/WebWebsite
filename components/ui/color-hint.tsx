"use client";

import { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorHintProps {
    colors?: string[];
}

// Helper to invert a hex color (to match the inverted hero canvas look)
const invertColor = (hex: string) => {
    if (!hex || !hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) return hex;

    const normalizeHex = (value: string) => {
        if (value.length === 4) {
            // #rgb -> #rrggbb
            const r = value[1];
            const g = value[2];
            const b = value[3];
            return `#${r}${r}${g}${g}${b}${b}`;
        }
        return value;
    };

    const normalized = normalizeHex(hex);
    const n = parseInt(normalized.slice(1), 16);
    const r = 255 - ((n >> 16) & 255);
    const g = 255 - ((n >> 8) & 255);
    const b = 255 - (n & 255);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export default function ColorHint({ colors }: ColorHintProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already seen this hint
        const hasSeenHint = localStorage.getItem('colorHintDismissed');
        if (hasSeenHint) {
            return;
        }

        // Show hint immediately when page loads
        setIsVisible(true);

        // Dismiss only when clicking on the canvas (neon background)
        const handleCanvasClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if the clicked element is a canvas
            if (target.tagName === 'CANVAS') {
                setIsVisible(false);
                localStorage.setItem('colorHintDismissed', 'true');
            }
        };

        document.addEventListener('click', handleCanvasClick);

        return () => {
            document.removeEventListener('click', handleCanvasClick);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className="fixed bottom-8 right-8 z-50 pointer-events-none"
                >
                    {/* Use page accent colors (inverted neon trail) for animated border + icon */}
                    {(() => {
                        const fallback = ["#3b82f6", "#8b5cf6", "#ec4899"];
                        const sourceColors = colors && colors.length > 0 ? colors : fallback;
                        const inverted = sourceColors.map(invertColor);
                        const [c1, c2, c3] = [
                            inverted[0] ?? fallback[0],
                            inverted[1] ?? inverted[0] ?? fallback[1],
                            inverted[2] ?? inverted[1] ?? fallback[2],
                        ];

                        const borderGradient = {
                            backgroundImage: `linear-gradient(120deg, ${c1}, ${c2}, ${c3})`,
                        };

                        const iconGradient = {
                            backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        };

                        return (
                            <div
                                className="relative inline-flex rounded-full p-[2px] shadow-lg animate-gradient-border"
                                style={borderGradient}
                            >
                                {/* Inner pill */}
                                <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2">
                                    <Palette
                                        className="w-3.5 h-3.5 animate-pulse-slow"
                                        style={iconGradient}
                                    />
                                    <span className="text-xs text-black font-medium whitespace-nowrap">
                                        Click to change colors
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
