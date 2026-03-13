"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/40 hover:text-white/80 border border-white/10 hover:border-white/20 hover:bg-white/5 backdrop-blur-sm transition-all text-xs font-semibold"
        >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
        </button>
    );
}
