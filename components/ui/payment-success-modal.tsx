"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle, XCircle, X, ArrowRight,
    LogIn, UserPlus, LayoutDashboard, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function PaymentSuccessModal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"success" | "cancelled">("success");
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setAuthLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const payment = searchParams.get("payment");
        if (payment === "success" || payment === "cancelled") {
            setMode(payment as "success" | "cancelled");
            // Wait for preloader to finish: 3500ms run + 800ms exit animation
            const t = setTimeout(() => setOpen(true), 4400);
            return () => clearTimeout(t);
        }
    }, [searchParams]);

    const handleClose = () => {
        setOpen(false);
        router.replace("/", { scroll: false });
    };

    if (!mounted) return null;

    const isSuccess = mode === "success";

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: 999999 }}>

                    {/* Backdrop — same as order-modal */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <div className="flex min-h-[100dvh] items-center justify-center p-4 py-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 28, stiffness: 350 }}
                            className="relative w-full max-w-lg bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden"
                        >
                            {/* Close */}
                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>

                            {isSuccess ? (
                                /* ════════════════════════════════
                                   SUCCESS
                                ════════════════════════════════ */
                                <>
                                    {/* Icon */}
                                    <div className="flex justify-center mb-6">
                                        <div className="relative">
                                            <div
                                                className="absolute inset-0 rounded-full blur-2xl opacity-70"
                                                style={{ background: "radial-gradient(circle, #7c3aed 0%, #ec4899 100%)", transform: "scale(1.6)" }}
                                            />
                                            <div
                                                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                                                style={{
                                                    background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
                                                    boxShadow: "0 0 48px rgba(124,58,237,0.7), 0 0 16px rgba(236,72,153,0.4)",
                                                }}
                                            >
                                                <CheckCircle className="w-10 h-10 text-white" strokeWidth={2} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Heading */}
                                    <div className="text-center mb-8">
                                        <p className="text-xs font-bold tracking-widest uppercase text-purple-400 mb-2">
                                            Payment Confirmed
                                        </p>
                                        <h2 className="text-3xl font-black text-white mb-3 leading-tight">
                                            You&apos;re all set! 🎉
                                        </h2>
                                        <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                                            Your payment was successful. We&apos;ll be in touch shortly to kick off your project.
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px w-full bg-white/8 mb-6" />

                                    {!authLoading && (
                                        user ? (
                                            /* Logged in */
                                            <div className="space-y-3">
                                                {/* User row */}
                                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                                    <div
                                                        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
                                                        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                                                    >
                                                        {(user.user_metadata?.full_name ?? user.email ?? "U").slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-white text-sm font-semibold leading-none truncate">
                                                            {user.user_metadata?.full_name ?? "Account"}
                                                        </p>
                                                        <p className="text-white/35 text-xs mt-0.5 truncate">{user.email}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                        <span className="text-emerald-400 text-xs font-bold">Signed in</span>
                                                    </div>
                                                </div>

                                                <Link
                                                    href="/orders"
                                                    onClick={handleClose}
                                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-black transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] bg-white"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    View Customer Portal
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>

                                                <button
                                                    onClick={handleClose}
                                                    className="w-full py-3 text-sm text-white/30 hover:text-white/50 transition-colors"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        ) : (
                                            /* Guest */
                                            <div className="space-y-3">
                                                {/* Tip */}
                                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                                    <p className="text-white/60 text-xs leading-relaxed">
                                                        <span className="text-white font-semibold">Track your order</span> — create an account or sign in with the same email used at checkout.
                                                    </p>
                                                </div>

                                                <Link
                                                    href="/register"
                                                    onClick={handleClose}
                                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-black bg-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    Create Account
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>

                                                <Link
                                                    href="/login"
                                                    onClick={handleClose}
                                                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white/70 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                    Sign In to Existing Account
                                                </Link>

                                                <button
                                                    onClick={handleClose}
                                                    className="w-full py-3 text-sm text-white/30 hover:text-white/50 transition-colors"
                                                >
                                                    Maybe later
                                                </button>
                                            </div>
                                        )
                                    )}
                                </>
                            ) : (
                                /* ════════════════════════════════
                                   CANCELLED
                                ════════════════════════════════ */
                                <>
                                    {/* Icon */}
                                    <div className="flex justify-center mb-5">
                                        <div className="relative">
                                            <div
                                                className="absolute inset-0 rounded-full blur-xl opacity-50"
                                                style={{ background: "radial-gradient(circle, #ef4444 0%, #f97316 100%)", transform: "scale(1.5)" }}
                                            />
                                            <div
                                                className="relative w-14 h-14 rounded-full flex items-center justify-center"
                                                style={{
                                                    background: "linear-gradient(135deg, #dc2626, #ef4444, #f97316)",
                                                    boxShadow: "0 0 32px rgba(239,68,68,0.55)",
                                                }}
                                            >
                                                <XCircle className="w-7 h-7 text-white" strokeWidth={2} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Heading */}
                                    <div className="text-center mb-6">
                                        <p className="text-xs font-bold tracking-widest uppercase text-red-400 mb-1.5">
                                            Payment Cancelled
                                        </p>
                                        <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                                            No charge made
                                        </h2>
                                        <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                                            Nothing was charged. Reach out if you need help.
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px w-full bg-white/8 mb-5" />

                                    <div className="space-y-3">
                                        <a
                                            href="mailto:darshana@thedbot.com"
                                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-black bg-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] text-sm"
                                        >
                                            Contact Support
                                        </a>

                                        <button
                                            onClick={handleClose}
                                            className="w-full py-3 text-sm text-white/30 hover:text-white/50 transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
