import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
    ShoppingBag, ArrowRight, Clock, CheckCircle,
    AlertCircle, Home, Package, DollarSign, Calendar,
    ChevronRight, Sparkles,
} from "lucide-react";
import { SignOutButton } from "./sign-out-button";

interface Order {
    id: string;
    plan_name: string;
    amount_usd: number;
    status: "paid" | "refunded" | "disputed";
    created_at: string;
    stripe_session_id: string;
}

const STATUS_CONFIG = {
    paid: {
        label: "Paid",
        icon: CheckCircle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
        dot: "bg-emerald-400",
    },
    refunded: {
        label: "Refunded",
        icon: AlertCircle,
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        dot: "bg-amber-400",
    },
    disputed: {
        label: "Disputed",
        icon: AlertCircle,
        color: "text-red-400",
        bg: "bg-red-500/10 border-red-500/20",
        dot: "bg-red-400",
    },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    });
}

function formatDateShort(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric",
    });
}

export default async function OrdersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: orders, error } = await supabase
        .from("orders")
        .select("id, plan_name, amount_usd, status, created_at, stripe_session_id")
        .order("created_at", { ascending: false });

    const displayName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";
    const initials = displayName.slice(0, 2).toUpperCase();
    const totalSpent = (orders as Order[] | null)?.reduce((s, o) => s + (o.status === "paid" ? o.amount_usd : 0), 0) ?? 0;
    const orderCount = orders?.length ?? 0;
    const latestOrder = orders?.[0] as Order | undefined;

    return (
        <main className="min-h-screen bg-black px-4 py-10 sm:py-16 relative overflow-hidden">

            {/* Dot grid */}
            <div className="fixed inset-0 z-0 opacity-[0.15] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Neon ambient blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute -top-32 left-1/3 w-[700px] h-[700px] rounded-full opacity-20 blur-[180px]"
                    style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-12 blur-[160px]"
                    style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }} />
                <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full opacity-8 blur-[140px]"
                    style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }} />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">

                {/* ── Top nav breadcrumb ── */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-xs font-medium transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        <span>Home</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-white/50">Portal</span>
                    </Link>
                    <SignOutButton />
                </div>

                {/* ── Profile / Hero card ── */}
                <div
                    className="relative rounded-3xl border border-white/10 p-6 sm:p-8 overflow-hidden backdrop-blur-2xl"
                    style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,0,0,0.6) 60%, rgba(236,72,153,0.08) 100%)",
                        boxShadow: "0 0 80px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                >
                    {/* Gradient top bar */}
                    <div className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, #7c3aed, #a855f7, #ec4899, transparent)" }} />

                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-xl select-none"
                            style={{
                                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                                boxShadow: "0 0 24px rgba(124,58,237,0.5)",
                            }}
                        >
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold tracking-widest uppercase text-white/30 mb-0.5">Customer Portal</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-white truncate">
                                Hey, {displayName} 👋
                            </h1>
                            <p className="text-white/40 text-sm mt-0.5 truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {[
                            {
                                icon: Package,
                                label: "Total Orders",
                                value: orderCount.toString(),
                            },
                            {
                                icon: DollarSign,
                                label: "Total Spent",
                                value: `$${totalSpent.toFixed(0)}`,
                            },
                            {
                                icon: Calendar,
                                label: "Last Order",
                                value: latestOrder ? formatDateShort(latestOrder.created_at) : "—",
                            },
                        ].map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-white/8 p-3 sm:p-4 backdrop-blur-sm"
                                style={{ background: "rgba(255,255,255,0.03)" }}
                            >
                                <Icon className="w-4 h-4 text-white/30 mb-2" />
                                <p className="text-lg sm:text-xl font-black text-white leading-none">{value}</p>
                                <p className="text-white/30 text-xs mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Orders section header ── */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <h2 className="text-base font-bold text-white">Order History</h2>
                        <p className="text-white/30 text-xs mt-0.5">
                            {orderCount === 0 ? "No orders yet" : `${orderCount} order${orderCount > 1 ? "s" : ""}`}
                        </p>
                    </div>
                    <Link
                        href="/#pricing"
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all"
                    >
                        <Sparkles className="w-3 h-3" />
                        New order
                    </Link>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        Could not load orders. Please refresh.
                    </div>
                )}

                {/* ── Empty state ── */}
                {!error && orderCount === 0 && (
                    <div
                        className="rounded-3xl border border-white/10 backdrop-blur-2xl text-center py-16 px-8"
                        style={{
                            background: "rgba(0,0,0,0.5)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            <ShoppingBag className="w-7 h-7 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
                        <p className="text-white/40 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                            Once you purchase a package, your orders will appear here.
                        </p>
                        <Link
                            href="/#pricing"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                            style={{
                                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                                boxShadow: "0 0 24px rgba(124,58,237,0.4)",
                            }}
                        >
                            Browse Packages <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {/* ── Orders list ── */}
                {orders && orderCount > 0 && (
                    <div className="space-y-3">
                        {(orders as Order[]).map((order, i) => {
                            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.paid;
                            const StatusIcon = statusCfg.icon;
                            return (
                                <div
                                    key={order.id}
                                    className="group relative rounded-2xl border border-white/10 backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:border-white/20"
                                    style={{
                                        background: "rgba(0,0,0,0.5)",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                                        animationDelay: `${i * 60}ms`,
                                    }}
                                >
                                    {/* Left accent bar */}
                                    <div
                                        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full opacity-60"
                                        style={{ background: "linear-gradient(180deg, #7c3aed, #ec4899)" }}
                                    />

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 pl-6">
                                        {/* Left: icon + info */}
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))",
                                                    border: "1px solid rgba(255,255,255,0.08)",
                                                }}
                                            >
                                                <ShoppingBag className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm sm:text-base leading-tight">{order.plan_name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="w-3 h-3 text-white/25" />
                                                    <span className="text-white/35 text-xs">{formatDate(order.created_at)}</span>
                                                    <span className="text-white/15 text-xs">·</span>
                                                    <span className="text-white/20 text-xs font-mono">{order.stripe_session_id.slice(-8)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: price + status */}
                                        <div className="flex items-center gap-3 sm:flex-shrink-0 pl-[60px] sm:pl-0">
                                            <div className="text-right">
                                                <p className="text-xl font-black text-white leading-none">
                                                    ${order.amount_usd.toFixed(2)}
                                                </p>
                                                <p className="text-white/25 text-xs mt-0.5">USD</p>
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                                <StatusIcon className="w-3 h-3" />
                                                {statusCfg.label}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Footer ── */}
                <div
                    className="rounded-2xl border border-white/8 p-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-4"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                >
                    <p className="text-white/30 text-xs text-center sm:text-left">
                        Need help with an order?
                    </p>
                    <a
                        href="mailto:darshana@thedbot.com"
                        className="text-xs font-bold px-4 py-2 rounded-xl border border-white/10 text-purple-400 hover:text-purple-300 hover:border-purple-400/30 transition-all"
                    >
                        Contact Support →
                    </a>
                </div>

            </div>
        </main>
    );
}
