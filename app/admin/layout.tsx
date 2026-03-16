import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import AdminSidebar from "./admin-sidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <AdminSidebar userEmail={user.email ?? ""}>
                <div className="relative">
                    {/* Background effects */}
                    <div className="fixed inset-0 z-0 opacity-[0.12] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[180px]"
                            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
                        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[140px]"
                            style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }} />
                    </div>
                    <div className="relative z-10 pt-8 pb-8 px-4 sm:pt-10 sm:px-6 lg:pt-12 lg:px-8">
                        {children}
                    </div>
                </div>
            </AdminSidebar>
        </div>
    );
}
