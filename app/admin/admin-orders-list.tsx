"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Package, ChevronRight, CheckCircle, AlertCircle, User, Mail, Search,
} from "lucide-react";

interface AdminOrder {
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
}

const STATUS_CONFIG = {
    paid: { label: "Paid", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    refunded: { label: "Refunded", icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    disputed: { label: "Disputed", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

export default function AdminOrdersList({ orders }: { orders: AdminOrder[] }) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search.trim()) return orders;
        const q = search.toLowerCase().trim();
        return orders.filter(
            (o) =>
                o.plan_name.toLowerCase().includes(q) ||
                (o.customer_name ?? "").toLowerCase().includes(q) ||
                (o.customer_email ?? "").toLowerCase().includes(q) ||
                o.id.toLowerCase().includes(q) ||
                o.stripe_session_id.toLowerCase().includes(q)
        );
    }, [orders, search]);

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    placeholder="Search orders by customer, plan, or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all"
                />
            </div>

            {/* Order cards */}
            <div className="space-y-3">
                {filtered.map((order) => {
                    const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.paid;
                    const StatusIcon = statusCfg.icon;
                    const deliveryDays = order.delivery_days ?? 0;
                    const deadline = deliveryDays > 0 ? addDays(new Date(order.created_at), deliveryDays) : null;
                    return (
                        <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`}
                            className="group block rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-white/[0.02]"
                            style={{ background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                        >
                            <div className="p-5 flex items-center justify-between gap-4">
                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/5">
                                        <Package className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-white text-sm sm:text-base group-hover:text-purple-300 transition-colors">
                                            {order.plan_name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-white/70">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {order.customer_name ?? "—"}
                                            </span>
                                            <span className="flex items-center gap-1 truncate max-w-[180px]">
                                                <Mail className="w-3 h-3 flex-shrink-0" />
                                                {order.customer_email ?? "—"}
                                            </span>
                                            {deliveryDays > 0 && (
                                                <span>
                                                    {deliveryDays}d · {deadline ? formatDate(deadline.toISOString()).split(",")[0] : "—"}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white/60 text-xs mt-1">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">${Number(order.amount_usd).toFixed(2)}</p>
                                        <p className="text-white/60 text-xs">USD</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusCfg.label}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {filtered.length === 0 && search && (
                <div className="rounded-2xl border border-white/10 p-8 text-center">
                    <p className="text-white/60 text-sm">No orders match &quot;{search}&quot;</p>
                </div>
            )}
        </div>
    );
}
