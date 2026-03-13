"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Clock, CreditCard, ShieldCheck, Loader2, User, Mail, ArrowRight, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface OrderPlan {
    name: string;
    price: number;
    features: string[];
    duration: string;
    planId?: string;
    description?: string;
}

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: OrderPlan | null;
}

export default function OrderModal({ isOpen, onClose, plan }: OrderModalProps) {
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<"details" | "summary">("details");

    // Customer details (Step 1)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // Auth state
    const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Payment state (Step 2)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    // Fetch auth state and pre-fill if logged in
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setAuthUser(user);
            if (user) {
                setEmail(user.email ?? "");
                setName(user.user_metadata?.full_name ?? "");
            }
            setAuthLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            const u = session?.user ?? null;
            setAuthUser(u);
            if (u) {
                setEmail(u.email ?? "");
                setName(u.user_metadata?.full_name ?? "");
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    // Reset state when modal closes/opens
    useEffect(() => {
        if (!isOpen) {
            setStep("details");
            setError(null);
            setLoading(false);
            if (!authUser) { setName(""); setEmail(""); }
        }
    }, [isOpen, authUser]);

    const handleConfirmAndPay = async () => {
        if (!plan) return;
        setLoading(true);
        setError(null);

        try {
            const body = plan.planId
                ? { planId: plan.planId, customerName: name, customerEmail: email }
                : { name: plan.name, amount: plan.price, description: plan.features.join(", "), customerName: name, customerEmail: email };

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok || !data.url) throw new Error(data.error || "Failed to start checkout");
            window.location.href = data.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    if (!mounted || !plan) return null;

    const isDetailsValid = name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isLoggedIn = !!authUser;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 overflow-y-auto pointer-events-auto" style={{ zIndex: 999999 }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
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
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>

                            {/* Step indicator */}
                            <div className="flex items-center gap-2 mb-6">
                                <StepDot active={step === "details"} done={step === "summary"} label="1" />
                                <div className="flex-1 h-px bg-white/10" />
                                <StepDot active={step === "summary"} done={false} label="2" />
                            </div>

                            <AnimatePresence mode="wait">
                                {step === "details" ? (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        {/* Header */}
                                        <h2 className="text-3xl font-bold text-white mb-1">Your Details</h2>
                                        <p className="text-white/50 mb-6 text-sm">
                                            Tell us who you are so we can reach you about your project.
                                        </p>

                                        {/* Account prompt for guests */}
                                        {!authLoading && !isLoggedIn && (
                                            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                                                <LogIn className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-white/80 text-sm font-semibold mb-0.5">Track your order</p>
                                                    <p className="text-white/40 text-xs leading-relaxed">
                                                        <Link href="/register" onClick={onClose} className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">Create an account</Link>
                                                        {" "}or{" "}
                                                        <Link href="/login" onClick={onClose} className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">sign in</Link>
                                                        {" "}to view orders in your portal after payment.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Logged-in badge */}
                                        {!authLoading && isLoggedIn && (
                                            <div className="mb-6 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit">
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-emerald-400 text-xs font-semibold">Signed in — order will be saved to your account</span>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {/* Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white/70">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="Jane Smith"
                                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white/70">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="you@example.com"
                                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                                                    />
                                                </div>
                                                <p className="text-white/30 text-xs">Stripe will send your receipt here.</p>
                                            </div>
                                        </div>

                                        {/* Next step */}
                                        <button
                                            onClick={() => setStep("summary")}
                                            disabled={!isDetailsValid}
                                            className="mt-6 w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] bg-white text-black"
                                        >
                                            <span className="text-black">Review Order</span>
                                            <ArrowRight className="w-4 h-4 text-black" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="summary"
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        {/* Header */}
                                        <div className="mb-6">
                                            <p className="text-xs font-bold tracking-widest uppercase text-purple-400 mb-1">Order Summary</p>
                                            <h2 className="text-3xl font-bold text-white leading-tight">{plan.name}</h2>
                                            {plan.description && <p className="text-white/50 text-sm mt-1">{plan.description}</p>}
                                        </div>

                                        {/* Customer */}
                                        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-white/50" />
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-semibold">{name}</p>
                                                <p className="text-white/40 text-xs">{email}</p>
                                            </div>
                                            <button
                                                onClick={() => setStep("details")}
                                                className="ml-auto text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                                            >
                                                Edit
                                            </button>
                                        </div>

                                        {/* Price + Duration */}
                                        <div className="flex items-center justify-between mb-5 p-4 rounded-2xl bg-white/5 border border-white/10">
                                            <div>
                                                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Total</p>
                                                <p className="text-4xl font-black text-white">
                                                    ${plan.price}
                                                    <span className="text-lg font-medium text-white/40 ml-1">USD</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Delivery</p>
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <Clock className="w-4 h-4 text-purple-400" />
                                                    <span className="text-white font-bold">{plan.duration}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deliverables */}
                                        <div className="mb-6">
                                            <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-3">What&apos;s Included</p>
                                            <ul className="space-y-2.5">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-white/70" />
                                                        </span>
                                                        <span className="text-white/70 text-sm">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Error */}
                                        {error && (
                                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                                {error}
                                            </div>
                                        )}

                                        {/* Pay button */}
                                        <div className="pt-4 grid grid-cols-1 gap-3">
                                            <button
                                                onClick={handleConfirmAndPay}
                                                disabled={loading}
                                                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-gray-100 text-black font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Redirecting…</span></>
                                                ) : (
                                                    <><CreditCard className="w-5 h-5" /><span>Pay ${plan.price} USD</span></>
                                                )}
                                            </button>
                                        </div>

                                        {/* Trust note */}
                                        <div className="mt-4 flex items-center justify-center gap-2 text-white/30 text-xs">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span>Secured by Stripe — your payment details are never stored</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
    return (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            done ? "bg-white text-black" :
            active ? "bg-white/20 border border-white/40 text-white" :
            "bg-white/5 border border-white/10 text-white/30"
        }`}>
            {done ? <Check className="w-3.5 h-3.5" /> : label}
        </div>
    );
}
