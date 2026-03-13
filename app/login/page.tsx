"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TubesBackground } from "@/components/ui/neon-flow";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/orders";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push(next);
        router.refresh();
    };

    return (
        <form onSubmit={handleLogin} className="space-y-5">
            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase text-white/50">
                    Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase text-white/50">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all text-sm"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
                    boxShadow: "0 0 32px rgba(124,58,237,0.4)",
                }}
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                ) : (
                    <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                )}
            </button>

            <p className="text-center text-sm text-white/40">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Create one
                </Link>
            </p>
        </form>
    );
}

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">

            {/* Neon flow — full opacity, no dimming, just like home */}
            <div className="fixed inset-0 z-0">
                <TubesBackground className="w-full h-full bg-black" opacity={1} enableClickInteraction={false} />
            </div>

            {/* White dot grid — same as homepage */}
            <div className="fixed inset-0 z-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* DDF Logo — identical construction to navbar */}
                <div className="flex flex-col items-center mb-10">
                    <Link href="/" className="flex items-center group relative">
                        <div className="relative inline-block">
                            {/* Splash SVG */}
                            <div
                                className="absolute pointer-events-none"
                                style={{ left: "-35px", top: "50%", transform: "translateY(-50%)", width: "110px", height: "110px", zIndex: 0, opacity: 0.8 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1499.999933" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="splashLoginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.9" />
                                            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.85" />
                                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.7" />
                                        </linearGradient>
                                        <clipPath id="splashLoginClip">
                                            <path d="M 225 196.050781 L 1175 196.050781 L 1175 1218 L 225 1218 Z" clipRule="nonzero" />
                                        </clipPath>
                                    </defs>
                                    <g clipPath="url(#splashLoginClip)">
                                        <path fill="url(#splashLoginGrad)" fillOpacity="1" fillRule="nonzero" d="M 812.78125 290.222656 C 812.15625 291.476562 812.15625 292.726562 812.78125 293.980469 C 810.902344 297.945312 809.023438 301.703125 807.144531 305.671875 C 805.890625 305.671875 804.847656 305.671875 803.59375 305.671875 C 802.96875 301.914062 801.921875 298.15625 801.921875 294.398438 C 802.132812 287.089844 803.175781 286.671875 812.78125 290.222656 Z M 1173.636719 738.21875 C 1171.546875 747.402344 1169.25 755.960938 1173.425781 765.148438 C 1174.261719 766.816406 1171.339844 769.949219 1170.085938 772.453125 C 1170.921875 779.550781 1171.964844 786.441406 1172.800781 793.328125 C 1169.25 795.417969 1165.699219 797.503906 1161.941406 799.800781 C 1161.105469 801.46875 1161.105469 802.933594 1161.523438 804.601562 C 1152.128906 824.433594 1142.519531 844.265625 1133.125 863.890625 C 1133.125 871.820312 1133.125 879.546875 1133.332031 887.480469 C 1132.078125 888.730469 1130.199219 889.984375 1129.574219 891.445312 C 1126.648438 899.167969 1126.230469 909.398438 1120.804688 914.410156 C 1115.375 919.417969 1105.140625 920.046875 1096.996094 921.714844 C 1086.347656 923.800781 1081.753906 927.976562 1088.644531 938.414062 C 1082.378906 945.511719 1086.136719 951.359375 1089.480469 958.664062 C 1093.445312 967.222656 1086.136719 974.53125 1081.753906 981.628906 C 1081.753906 983.089844 1081.542969 984.550781 1080.917969 986.011719 C 1076.949219 989.351562 1072.144531 990.605469 1067.132812 990.605469 C 1059.824219 989.351562 1053.769531 992.066406 1049.175781 997.703125 C 1046.460938 999.789062 1042.910156 1001.042969 1040.613281 1003.757812 L 1041.03125 1003.964844 C 1032.46875 1014.613281 1024.535156 1011.480469 1016.808594 1003.128906 C 1016.808594 1004.800781 1016.808594 1006.261719 1016.808594 1007.933594 C 1017.851562 1008.351562 1018.894531 1008.976562 1019.9375 1009.8125 C 1024.324219 1015.65625 1027.875 1021.710938 1030.589844 1026.511719 C 1034.140625 1032.355469 1039.570312 1043.003906 1041.449219 1053.234375 C 1043.535156 1054.066406 1046.667969 1055.527344 1048.132812 1057.824219 C 1051.679688 1062.210938 1051.679688 1073.273438 1049.175781 1078.285156 C 1041.867188 1073.691406 1033.09375 1062.625 1028.710938 1061.792969 C 1023.488281 1062.835938 1021.609375 1064.089844 1017.851562 1066.800781 C 1011.378906 1055.738281 998.429688 1033.609375 980.886719 1027.972656 C 967.730469 1037.992188 947.265625 1061.792969 946.640625 1076.195312 C 952.277344 1091.644531 975.457031 1109.804688 977.964844 1123.167969 C 976.921875 1137.988281 953.53125 1137.363281 946.222656 1114.605469 C 945.804688 1094.984375 924.503906 1092.269531 919.492188 1102.5 C 913.644531 1109.804688 898.191406 1096.445312 865.199219 1097.488281 C 843.480469 1115.234375 843.480469 1151.347656 848.28125 1160.953125 C 842.851562 1177.859375 825.9375 1172.015625 824.476562 1148.84375 C 824.894531 1130.890625 802.132812 1108.554688 764.960938 1118.78125 C 749.089844 1137.363281 731.128906 1135.066406 713.171875 1154.269531 C 703.566406 1161.371094 691.871094 1160.953125 669.734375 1142.789062 C 639.875 1132.5625 613.769531 1108.136719 609.800781 1086.214844 C 559.058594 1059.496094 529.820312 1063.042969 506.433594 1062.625 C 499.125 1111.683594 489.101562 1085.382812 505.386719 1053.859375 C 488.890625 1015.65625 465.921875 1000 439.191406 1008.351562 C 436.683594 984.34375 421.441406 960.542969 430 957.414062 C 447.335938 950.734375 446.5 912.320312 400.347656 899.378906 C 371.320312 892.28125 352.734375 853.867188 332.0625 863.679688 C 314.101562 859.921875 332.269531 848.023438 380.09375 829.234375 C 390.949219 811.910156 404.734375 799.175781 395.753906 769.53125 C 389.070312 766.398438 379.046875 749.699219 379.464844 744.480469 C 395.964844 743.644531 400.765625 740.929688 406.195312 732.371094 C 402.019531 718.800781 390.535156 712.957031 369.441406 715.671875 C 348.140625 722.144531 338.535156 713.582031 346.472656 691.871094 C 371.949219 688.53125 400.558594 683.105469 419.558594 671.625 C 422.273438 654.714844 418.308594 620.058594 446.5 601.273438 C 448.796875 582.273438 435.429688 562.652344 418.308594 550.335938 C 413.085938 544.070312 415.59375 526.328125 424.15625 521.316406 C 446.917969 539.0625 465.085938 549.289062 509.566406 536.558594 C 499.75 521.527344 476.570312 492.300781 503.71875 493.136719 C 522.929688 516.097656 550.496094 514.636719 551.332031 504.824219 C 539.84375 484.992188 549.449219 468.5 564.070312 468.917969 C 596.4375 469.753906 603.746094 456.601562 605.207031 439.484375 C 598.527344 411.71875 610.636719 388.339844 651.148438 428.421875 C 668.691406 425.078125 688.320312 443.449219 726.953125 422.574219 C 733.011719 411.300781 755.980469 432.59375 756.398438 436.144531 C 772.480469 416.519531 795.449219 403.785156 797.746094 388.757812 C 804.21875 341.578125 803.800781 305.878906 807.351562 305.878906 C 808.605469 364.332031 810.277344 368.714844 808.605469 402.953125 C 810.066406 433.011719 820.925781 445.121094 877.519531 439.484375 C 913.019531 457.019531 926.175781 467.667969 970.863281 515.261719 C 1028.917969 525.492188 1040.613281 532.589844 1028.5 565.992188 C 1057.945312 608.371094 1109.945312 608.578125 1134.375 675.589844 C 1162.566406 701.265625 1174.472656 718.386719 1173.636719 738.21875 Z" />
                                    </g>
                                </svg>
                            </div>
                            {/* Logo image */}
                            <div className="relative z-10">
                                <Image src="/images/logo.png" alt="Dynamic Design Factory" width={110} height={32} priority
                                    className="transition-opacity duration-300 group-hover:opacity-90" />
                            </div>
                        </div>
                    </Link>

                    <h1 className="text-3xl font-bold text-white mt-8 mb-1">Welcome back</h1>
                    <p className="text-white/40 text-sm">Sign in to view your orders</p>
                </div>

                {/* Glass card — same aesthetic as ContactModal / OrderModal */}
                <div
                    className="bg-black/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl"
                    style={{ boxShadow: "0 0 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)" }}
                >
                    {/* Gradient top bar */}
                    <div className="h-px w-full rounded-full mb-8"
                        style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)" }} />
                    <Suspense>
                        <LoginForm />
                    </Suspense>
                </div>

                <p className="text-center text-xs text-white/20 mt-8">
                    <Link href="/" className="hover:text-white/40 transition-colors">← Back to home</Link>
                </p>
            </div>
        </main>
    );
}
