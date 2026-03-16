"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, Home, Menu, X, Package } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

export default function CustomerPortalSidebar({
    children,
    userEmail,
    userName,
}: {
    children: React.ReactNode;
    userEmail: string;
    userName: string;
}) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/5">
                <Link href="/orders" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white/5">
                        <Image src="/images/logo.png" alt="DDF" width={80} height={24} className="object-contain w-8 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">My Portal</p>
                        <p className="text-white/60 text-xs">Dynamic Design Factory</p>
                    </div>
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                <Link
                    href="/orders"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        pathname === "/orders" || pathname === "/orders/"
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                >
                    <Package className="w-4 h-4" />
                    My Orders
                </Link>
            </nav>
            <div className="p-4 border-t border-white/5 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Home className="w-4 h-4" />
                    Back to Site
                </Link>
                <div className="px-4 py-2">
                    <p className="text-white/90 text-xs font-medium truncate">{userName}</p>
                    <p className="text-white/50 text-xs truncate">{userEmail}</p>
                </div>
                <div className="px-2">
                    <SignOutButton variant="sidebar" />
                </div>
            </div>
        </div>
    );

    return (
        <>
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <Link href="/orders" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white/5">
                        <Image src="/images/logo.png" alt="DDF" width={64} height={20} className="object-contain w-6 h-4" />
                    </div>
                    <span className="font-bold text-white">My Portal</span>
                </Link>
                <div className="w-9" />
            </header>

            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col transition-transform duration-300 ease-out ${
                    mobileOpen ? "fixed inset-y-0 left-0 z-[70] translate-x-0" : "fixed -translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="lg:hidden absolute top-4 right-4">
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <SidebarContent />
            </aside>

            <div className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
                {children}
            </div>
        </>
    );
}
