import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientId(req: NextRequest): string {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        ?? req.headers.get("x-real-ip")
        ?? "unknown";
}

export async function GET(req: NextRequest) {
    const clientId = getClientId(req);
    const { ok } = checkRateLimit(clientId, "admin_check");
    if (!ok) {
        return NextResponse.json({ isAdmin: false }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ isAdmin: false });
    }

    const serviceClient = createServiceClient();
    const { data } = await serviceClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    return NextResponse.json({ isAdmin: !!data });
}
