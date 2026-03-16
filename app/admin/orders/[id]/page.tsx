import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
    ChevronLeft, Package, User, Mail, CheckCircle, AlertCircle, ExternalLink,
    Calendar, CreditCard, ListChecks, Zap, Plus,
} from "lucide-react";

/** Known package features (from addons-section / pricing-section) */
const PACKAGE_FEATURES: Record<string, string[]> = {
    "1 Day Package": ["2 High-Quality Pages", "Responsive Design", "Speed Optimization", "Smooth Animations"],
    "3 Day Package": ["5-7 Custom Pages", "Design System Setup", "Advanced Animations", "Content Integration", "Analytics Setup"],
};

/** Known add-ons with details */
const ADDONS: Record<string, { price: number; days: number; note?: string }> = {
    "Payment Gateway": { price: 150, days: 1 },
    "AI Support Agent": { price: 300, days: 2, note: "without API charges" },
    "SEO & Performance": { price: 100, days: 2 },
};

/** Base package delivery days */
const PACKAGE_DAYS: Record<string, number> = {
    "1 Day Package": 1,
    "3 Day Package": 3,
};

/** Infer delivery days from plan name when not stored in DB */
function inferDeliveryDays(planName: string, storedDays: number | null): number {
    if (storedDays != null && storedDays > 0) return storedDays;
    const parts = planName.includes(" + ") ? planName.split(" + ").map((p) => p.trim()) : [planName];
    const base = parts[0] ?? "";
    let total = PACKAGE_DAYS[base] ?? 0;
    for (let i = 1; i < parts.length; i++) {
        const addon = ADDONS[parts[i]];
        if (addon) total += addon.days;
    }
    return total;
}

const STATUS_CONFIG = {
    paid: { label: "Paid", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    refunded: { label: "Refunded", icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    disputed: { label: "Disputed", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function parseFeatures(features: string | null): string[] {
    if (!features) return [];
    try {
        const parsed = JSON.parse(features);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return features.split(",").map((s) => s.trim()).filter(Boolean);
    }
}

export default async function AdminOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const serviceClient = createServiceClient();
    const { data: adminCheck } = await serviceClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
    if (!adminCheck) redirect("/");

    const { data: orders } = await serviceClient
        .from("admin_orders_view")
        .select("*")
        .eq("id", id)
        .limit(1);

    const order = orders?.[0] as {
        id: string;
        user_id: string | null;
        stripe_session_id: string;
        plan_name: string;
        amount_usd: number;
        status: "paid" | "refunded" | "disputed";
        created_at: string;
        delivery_days: number | null;
        features: string | null;
        customer_email: string | null;
        customer_name: string | null;
    } | undefined;

    if (!order) notFound();

    const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.paid;
    const StatusIcon = statusCfg.icon;
    const featuresList = parseFeatures(order.features);
    const deliveryDays = inferDeliveryDays(order.plan_name, order.delivery_days);
    const orderDate = new Date(order.created_at);
    const deadline = deliveryDays > 0 ? addDays(orderDate, deliveryDays) : null;
    const now = new Date();
    const daysRemaining = deadline && deadline > now ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isOverdue = deadline && deadline < now;

    const isCustomPackage = order.plan_name.includes(" + ");
    const planParts = isCustomPackage ? order.plan_name.split(" + ").map((p) => p.trim()) : [order.plan_name];
    const basePackageName = planParts[0] ?? order.plan_name;
    const addonNames = planParts.slice(1);
    const baseFeatures = PACKAGE_FEATURES[basePackageName] ?? [];
    const hasStoredFeatures = featuresList.length > 0;
    const displayFeatures = hasStoredFeatures ? featuresList : [...baseFeatures, ...addonNames];

    const cardStyle = "rounded-2xl border border-white/10 p-6 backdrop-blur-xl";
    const cardBg = { background: "rgba(255,255,255,0.03)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" } as const;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
            </Link>

            {/* Order header */}
            <div
                className={`relative ${cardStyle} overflow-hidden`}
                style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,0,0,0.6) 60%, rgba(236,72,153,0.08) 100%)",
                    boxShadow: "0 0 80px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
            >
                <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, #7c3aed, #a855f7, #ec4899, transparent)" }} />
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold tracking-widest uppercase text-purple-400">Order</p>
                            <span className="text-white/50 text-xs font-mono">#{order.id.slice(0, 8)}</span>
                        </div>
                        <h1 className="text-2xl font-black text-white">{order.plan_name}</h1>
                        <p className="text-white/90 text-sm mt-1">{formatDate(order.created_at)}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-6">
                    <div>
                        <p className="text-2xl font-black text-white">${Number(order.amount_usd).toFixed(2)}</p>
                        <p className="text-white/90 text-xs">USD</p>
                    </div>
                    {deliveryDays > 0 && (
                        <div>
                            <p className="text-white font-semibold">{deliveryDays} Day{deliveryDays !== 1 ? "s" : ""} Delivery</p>
                            <p className="text-white/90 text-xs">Timeline</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delivery Deadline – always show when we have timeline */}
            <div
                className={`${cardStyle}`}
                style={{
                    ...cardBg,
                    background: deadline ? (isOverdue ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)") : cardBg.background,
                    borderColor: deadline ? (isOverdue ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)") : "rgba(255,255,255,0.1)",
                }}
            >
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Delivery Deadline
                </h2>
                <div className="flex flex-wrap gap-6">
                    {deliveryDays > 0 && (
                        <div>
                            <p className="text-white/90 text-xs">Delivery timeline</p>
                            <p className="text-white font-bold text-lg">{deliveryDays} Day{deliveryDays !== 1 ? "s" : ""}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-white/90 text-xs">Ordered</p>
                        <p className="text-white font-semibold">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                        <p className="text-white/90 text-xs">Deliver by</p>
                        <p className="text-white font-bold text-lg">
                            {deadline ? formatDate(deadline.toISOString()) : "N/A"}
                        </p>
                    </div>
                    {daysRemaining !== null && daysRemaining >= 0 && (
                        <div>
                            <p className="text-white/90 text-xs">Days remaining</p>
                            <p className="text-amber-400 font-bold">{daysRemaining}</p>
                        </div>
                    )}
                    {isOverdue && (
                        <div>
                            <p className="text-red-400 font-semibold">Overdue</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Package Deliverables – full detail */}
            <div className={cardStyle} style={cardBg}>
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-purple-400" />
                    Package Deliverables
                </h2>
                <p className="text-white/90 text-xs mb-4">What the customer ordered — all features included in this package.</p>

                {displayFeatures.length > 0 ? (
                    <ul className="space-y-3">
                        {displayFeatures.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span className="text-white">{f}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-white/70">{order.plan_name}</p>
                )}

                {/* Custom package breakdown */}
                {isCustomPackage && addonNames.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-white/90 text-xs font-semibold mb-3">Custom package breakdown</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-400" />
                                <span className="text-white font-medium">Base: {basePackageName}</span>
                            </div>
                            {addonNames.map((addon) => {
                                const info = ADDONS[addon];
                                return (
                                    <div key={addon} className="flex items-center gap-2 pl-6">
                                        <Plus className="w-3 h-3 text-white/50" />
                                        <span className="text-white">{addon}</span>
                                        {info && (
                                            <span className="text-white/60 text-sm">
                                                (+${info.price}, +{info.days} day{info.days !== 1 ? "s" : ""})
                                                {info.note && ` · ${info.note}`}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Customer */}
            <div className={cardStyle} style={cardBg}>
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Customer
                </h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-white/90 text-sm w-20">Name</span>
                        <span className="text-white font-medium">{order.customer_name ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-white/90 text-sm w-20">Email</span>
                        <a href={`mailto:${order.customer_email ?? ""}`} className="text-white font-medium hover:text-purple-400 transition-colors truncate">
                            {order.customer_email ?? "—"}
                        </a>
                    </div>
                </div>
            </div>

            {/* Payment & Stripe */}
            <div className={cardStyle} style={cardBg}>
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    Payment & Reference
                </h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-white/90 text-xs">Amount paid</p>
                        <p className="text-white font-bold">${Number(order.amount_usd).toFixed(2)} USD</p>
                    </div>
                    <div>
                        <p className="text-white/90 text-xs mb-1">Stripe Session ID</p>
                        <p className="text-white font-mono text-xs break-all">{order.stripe_session_id}</p>
                        <a
                            href={order.stripe_session_id.startsWith("cs_test_")
                                ? `https://dashboard.stripe.com/test/checkout/sessions/${order.stripe_session_id}`
                                : `https://dashboard.stripe.com/checkout/sessions/${order.stripe_session_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs mt-2"
                        >
                            View in Stripe <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
