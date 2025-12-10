import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) return NextResponse.json({ error: "Token missing" }, { status: 400 });

    try {
        const invite = await prisma.invitation.findUnique({ where: { token } });

        if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
            return NextResponse.json({ error: "Invitación inválida o expirada" }, { status: 404 });
        }

        return NextResponse.json({ email: invite.email, name: invite.name });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
