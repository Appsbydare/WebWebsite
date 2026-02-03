"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Helper for random colors
const randomColors = (count: number) => {
    return new Array(count)
        .fill(0)
        .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

interface TubesBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    enableClickInteraction?: boolean;
    opacity?: number;
    onColorChange?: (colors: string[]) => void;
}

// Helper for color interpolation
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

export function TubesBackground({
    children,
    className,
    enableClickInteraction = true,
    opacity = 1,
    onColorChange
}: TubesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const tubesRef = useRef<any>(null);

    // Store current colors to interpolate from
    const currentColorsRef = useRef<string[]>(["#f967fb", "#53bc28", "#6958d5"]);
    const currentLightsRef = useRef<string[]>(["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]);

    // animation frame ref
    // animation frame ref
    const animRef = useRef<number | null>(null);

    useEffect(() => {
        let mounted = true;
        let cleanup: (() => void) | undefined;

        // Initialize with random colors
        currentColorsRef.current = randomColors(3);
        currentLightsRef.current = randomColors(4);

        const initTubes = async () => {
            if (!canvasRef.current) return;

            try {
                // Using dynamic import
                // @ts-ignore
                const { default: TubesCursor } = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');

                if (!mounted) return;

                const app = TubesCursor(canvasRef.current, {
                    tubes: {
                        colors: currentColorsRef.current,
                        lights: {
                            intensity: 100,
                            colors: currentLightsRef.current
                        }
                    }
                });

                tubesRef.current = app;
                setIsLoaded(true);

            } catch (error) {
                console.error("Failed to load TubesCursor:", error);
                // ... fallback logic
            }
        };

        initTubes();

        // Notify parent of initial colors
        if (onColorChange) {
            onColorChange(currentColorsRef.current);
        }

        return () => {
            mounted = false;
            cancelAnimationFrame(animRef.current!);
            if (cleanup) cleanup();
        };
    }, []);

    const handleClick = () => {
        if (!enableClickInteraction || !tubesRef.current) return;

        // Cancel any existing animation
        if (animRef.current) cancelAnimationFrame(animRef.current);

        const targetColors = randomColors(3);
        const targetLights = randomColors(4);

        const startColors = [...currentColorsRef.current];
        const startLights = [...currentLightsRef.current];

        const startTime = performance.now();
        const duration = 1000; // 1 second transition

        // Notify parent immediately of TARGET colors so UI can transition
        if (onColorChange && targetColors.length > 0) {
            onColorChange(targetColors);
        }

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            const nextColors = startColors.map((c, i) => lerpColor(c, targetColors[i] || c, ease));
            const nextLights = startLights.map((c, i) => lerpColor(c, targetLights[i] || c, ease));

            const app = tubesRef.current;
            if (app?.tubes?.setColors) app.tubes.setColors(nextColors);
            if (app?.tubes?.setLightsColors) app.tubes.setLightsColors(nextLights);

            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                // Update refs to final state
                currentColorsRef.current = targetColors;
                currentLightsRef.current = targetLights;
            }
        };

        animRef.current = requestAnimationFrame(animate);
    };

    return (
        <div
            className={cn("relative w-full h-full min-h-[400px] overflow-hidden bg-background", className)}
            style={{ opacity }}
            onClick={handleClick}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block"
                style={{ touchAction: 'none' }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full pointer-events-none">
                {children}
            </div>


        </div>
    );
}

// Default export
export default TubesBackground;
