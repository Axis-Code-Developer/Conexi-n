import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        console.log("🔵 [PROFILE UPDATE] Request received");

        const session = await auth();
        console.log("🔵 [PROFILE UPDATE] Session:", session?.user);

        if (!session || !session.user || !session.user.email) {
            console.log("🔴 [PROFILE UPDATE] Unauthorized - no session");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, image } = body;
        console.log("🔵 [PROFILE UPDATE] Data received:", { name, image });

        // basic validation
        if (!name && !image) {
            console.log("🔴 [PROFILE UPDATE] Missing fields");
            return NextResponse.json({ error: "Missing fields to update" }, { status: 400 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (image) updateData.image = image;

        console.log("🔵 [PROFILE UPDATE] Updating user:", session.user.email, "with data:", updateData);

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
        });

        console.log("✅ [PROFILE UPDATE] Success! Updated user:", updatedUser.id);

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error: any) {
        console.error("🔴 [PROFILE UPDATE] Error:", error);
        console.error("🔴 [PROFILE UPDATE] Error message:", error?.message);
        console.error("🔴 [PROFILE UPDATE] Error stack:", error?.stack);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error?.message
        }, { status: 500 });
    }
}
