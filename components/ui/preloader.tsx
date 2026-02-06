"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Lock body scroll
        document.body.style.overflow = "hidden";

        // Unlock scroll after animation - Run at least twice (approx 5s)
        const timer = setTimeout(() => {
            setIsLoading(false);
            document.body.style.overflow = "unset";
        }, 3500); // 2 full loops of 2.5s

        return () => {
            document.body.style.overflow = "unset";
            clearTimeout(timer);
        };
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-white flex items-center justify-center cursor-none"
                    initial={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                >
                    <motion.div
                        className="w-[120px] md:w-[160px]"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg
                            viewBox="0 0 320 100" // Increased viewbox slightly to fit wider letters
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-black w-full"
                        >
                            {/* D - Wider */}
                            <path
                                d="M20 10 V90 Q85 90 85 50 Q85 10 20 10 Z"
                                className="loader-path"
                                strokeWidth="24"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M20 10 V90 Q85 90 85 50 Q85 10 20 10 Z"
                                className="loader-path"
                                stroke="white"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* D - Wider */}
                            <path
                                d="M115 10 V90 Q180 90 180 50 Q180 10 115 10 Z"
                                className="loader-path delay-1"
                                strokeWidth="24"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M115 10 V90 Q180 90 180 50 Q180 10 115 10 Z"
                                className="loader-path delay-1"
                                stroke="white"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* F - Adjusted */}
                            <path
                                d="M210 10 V90 M210 10 H280 M210 50 H260"
                                className="loader-path delay-2"
                                strokeWidth="24"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M210 10 V90 M210 10 H280 M210 50 H260"
                                className="loader-path delay-2"
                                stroke="white"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <style jsx>{`
                            .loader-path {
                                stroke-dasharray: 400;
                                stroke-dashoffset: 400;
                                animation: draw 2.5s cubic-bezier(0.87, 0, 0.13, 1) infinite;
                            }

                            .delay-1 {
                                animation-delay: 0.2s;
                            }

                            .delay-2 {
                                animation-delay: 0.4s;
                            }

                            @keyframes draw {
                                0% {
                                    stroke-dashoffset: 400;
                                }
                                50% {
                                    stroke-dashoffset: 0;
                                }
                                100% {
                                    stroke-dashoffset: -400;
                                }
                            }
                        `}</style>
                    </motion.div>

                    {/* Minimalistic Progress Bar */}
                    <div className="absolute top-1/2 mt-16 md:mt-24 left-1/2 -translate-x-1/2 w-32 md:w-48 h-[2px] bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-black w-1/3"
                            initial={{ x: "-100%" }}
                            animate={{ x: "400%" }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
