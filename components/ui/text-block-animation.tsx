"use client"

import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useRef } from "react"
import { cn } from "@/lib/utils";

// Ensure plugins are registered
if (typeof window !== "undefined") {
    gsap.registerPlugin(SplitText, ScrollTrigger);
}

export default function TextBlockAnimation({
    children,
    animateOnScroll = true,
    delay = 0,
    blockColor = "#000",
    stagger = 0.1, // Reduced for smoother flow
    duration = 0.6 // Slightly faster for snappiness
}: {
    children: React.ReactNode,
    animateOnScroll?: boolean,
    delay?: number,
    blockColor?: string,
    stagger?: number,
    duration?: number
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // 1. Setup SplitText
        let split: SplitText | null = null;
        try {
            split = new SplitText(containerRef.current, {
                type: "lines",
                linesClass: "block-line-parent", // Generic class for styling if needed
            });
        } catch (e) {
            console.error("GSAP SplitText failed (possibly missing premium plugin):", e);
            // Fallback: Just make text visible if blocking fails
            gsap.set(containerRef.current, { opacity: 1 });
            return;
        }

        // 2. Wrap lines and inject the block revealer manually
        const lines = split.lines;
        const blocks: HTMLDivElement[] = [];

        if (lines && lines.length > 0) {
            lines.forEach((line: HTMLElement) => {
                // Create the wrapper
                const wrapper = document.createElement("div");
                wrapper.style.position = "relative";
                wrapper.style.display = "block";
                wrapper.style.overflow = "hidden";

                // Create the Revealer Block
                const block = document.createElement("div");
                block.style.position = "absolute";
                block.style.top = "0";
                block.style.left = "0";
                block.style.width = "100%";
                block.style.height = "100%";
                block.style.backgroundColor = blockColor;
                block.style.zIndex = "2";
                block.style.transform = "scaleX(0)";
                block.style.transformOrigin = "left center";

                // Insert wrapper and move line inside
                if (line.parentNode) {
                    line.parentNode.insertBefore(wrapper, line);
                }
                wrapper.appendChild(line);
                wrapper.appendChild(block);

                // Set initial state of line to invisible
                gsap.set(line, { opacity: 0 });

                blocks.push(block);
            });
        }

        // 3. Create the Master Timeline
        const tl = gsap.timeline({
            defaults: { ease: "expo.inOut" },
            onStart: () => {
                if (containerRef.current) gsap.set(containerRef.current, { visibility: "visible" });
            },
            scrollTrigger: animateOnScroll ? {
                trigger: containerRef.current,
                start: "top 85%",
                toggleActions: "play none none reverse",
            } : null,
            delay: delay
        });

        // Ensure visible if no scroll trigger immediately
        if (!animateOnScroll && containerRef.current) {
            gsap.set(containerRef.current, { visibility: "visible" });
        }

        // 4. Build the Animation Sequence
        if (blocks.length > 0 && lines.length > 0) {
            // Un-hide container immediately before animation starts
            gsap.set(containerRef.current, { visibility: "visible" });

            tl.to(blocks, {
                scaleX: 1,
                duration: duration,
                stagger: stagger,
                transformOrigin: "left center",
            })
                // Step B: Reveal Text (Instant)
                .set(lines, {
                    opacity: 1,
                    stagger: stagger
                }, `<${duration / 2}`)
                // Step C: Scale Block 1 -> 0 (Left to Right)
                .to(blocks, {
                    scaleX: 0,
                    duration: duration,
                    stagger: stagger,
                    transformOrigin: "right center"
                }, `<${duration * 0.4}`);
        }

        return () => {
            if (split) split.revert();
        }

    }, {
        scope: containerRef,
        dependencies: [animateOnScroll, delay, blockColor, stagger, duration]
    });

    return (
        <div ref={containerRef} style={{ position: "relative", visibility: "hidden" }}>
            {children}
        </div>
    );
}
