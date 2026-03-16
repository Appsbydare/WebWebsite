import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
    ShoppingBag, ArrowRight, Clock, CheckCircle,
    AlertCircle, Package, ChevronRight, Sparkles,
} from "lucide-react";

interface Order {
    id: string;
    plan_name: string;
    amount_usd: number;
    status: "paid" | "refunded" | "disputed";
    created_at: string;
    stripe_session_id: string;
    delivery_days: number | null;
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
        .select("id, plan_name, amount_usd, status, created_at, stripe_session_id, delivery_days")
        .order("created_at", { ascending: false });

    const displayName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";
    const initials = displayName.slice(0, 2).toUpperCase();
    const totalSpent = (orders as Order[] | null)?.reduce((s, o) => s + (o.status === "paid" ? o.amount_usd : 0), 0) ?? 0;
    const orderCount = orders?.length ?? 0;
    const latestOrder = orders?.[0] as Order | undefined;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">My Orders</h1>
                <p className="text-white/80 text-sm mt-1">Track your orders and project status</p>
            </div>

            {/* Stats grid – gradient adapts to card position */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "ORDERS", value: orderCount.toString(), sub: "Total Orders", pos: 0 },
                    { label: "SPENT", value: `$${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: "USD", pos: 1 },
                    { label: "LATEST", value: latestOrder ? formatDateShort(latestOrder.created_at) : "—", sub: "Last Order", pos: 2 },
                ].map(({ label, value, sub, pos }) => {
                    const gradients = [
                        { bg: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(0,0,0,0.5) 50%, rgba(139,92,246,0.06) 100%)", bar: "linear-gradient(90deg, #7c3aed, #8b5cf6, transparent)", glow: "rgba(124,58,237,0.2)" },
                        { bg: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(0,0,0,0.55) 50%, rgba(236,72,153,0.1) 100%)", bar: "linear-gradient(90deg, transparent, #7c3aed, #ec4899, transparent)", glow: "rgba(168,85,247,0.18)" },
                        { bg: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(0,0,0,0.5) 50%, rgba(236,72,153,0.18) 100%)", bar: "linear-gradient(90deg, transparent, #a855f7, #ec4899)", glow: "rgba(236,72,153,0.2)" },
                    ];
                    const g = gradients[pos];
                    return (
                        <div
                            key={label}
                            className="relative rounded-3xl border border-white/10 p-5 sm:p-6 overflow-hidden backdrop-blur-2xl transition-all hover:border-white/15"
                            style={{
                                background: g.bg,
                                boxShadow: `0 0 80px ${g.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                            }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: g.bar }} />
                            <p className="text-xs font-bold tracking-widest uppercase text-purple-400 mb-1">{label}</p>
                            <p className={`font-black text-white leading-none ${label === "LATEST" ? "text-2xl" : "text-3xl"}`}>{value}</p>
                            <p className="text-white/70 text-sm mt-1">{sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Orders section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-white">Order History</h2>
                    <Link
                        href="/#addons"
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        New order
                    </Link>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        Could not load orders. Please refresh.
                    </div>
                )}

                {!error && orderCount === 0 && (
                    <div
                        className="rounded-2xl border border-white/10 p-12 text-center backdrop-blur-xl"
                        style={{ background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                    >
                        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-purple-500/15">
                            <ShoppingBag className="w-7 h-7 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No orders yet</h3>
                        <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
                            Once you purchase a package, your orders will appear here.
                        </p>
                        <Link
                            href="/#addons"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
                            style={{
                                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                                boxShadow: "0 0 24px rgba(124,58,237,0.4)",
                            }}
                        >
                            Browse Packages <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {orders && orderCount > 0 && (
                    <div className="space-y-3">
                        {(orders as Order[]).map((order) => {
                            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.paid;
                            const StatusIcon = statusCfg.icon;
                            const deliveryDays = order.delivery_days ?? 0;
                            return (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="group block rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-white/[0.02]"
                                    style={{ background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                                >
                                    <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full opacity-60"
                                        style={{ background: "linear-gradient(180deg, #7c3aed, #ec4899)" }} />
                                    <div className="p-5 pl-6 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/5">
                                                <Package className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-white text-sm sm:text-base group-hover:text-purple-300 transition-colors">
                                                    {order.plan_name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-white/80">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDate(order.created_at)}</span>
                                                    {deliveryDays > 0 && (
                                                        <span>· {deliveryDays} day{deliveryDays !== 1 ? "s" : ""} delivery</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-white">${order.amount_usd.toFixed(2)}</p>
                                                <p className="text-white/70 text-xs">USD</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                                {statusCfg.label}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div
                className="rounded-2xl border border-white/10 p-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{ background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
            >
                <p className="text-white/70 text-sm text-center sm:text-left">
                    Need help with an order?
                </p>
                <a
                    href="mailto:darshana@thedbot.com"
                    className="text-sm font-semibold px-4 py-2 rounded-xl border border-white/10 text-purple-400 hover:text-purple-300 hover:border-purple-400/30 transition-all"
                >
                    Contact Support →
                </a>
            </div>
        </div>
    );
}
