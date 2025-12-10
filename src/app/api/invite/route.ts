import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendInvitationEmail } from "@/lib/zeptomail";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { name, email } = await req.json();

        if (!name || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }

        // Check if invite exists
        const existingInvite = await prisma.invitation.findUnique({
            where: { email },
        });

        if (existingInvite) {
            return NextResponse.json({ error: "Invitation already exists for this email" }, { status: 409 });
        }

        // Generate Request 
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        // Create Invitation in DB
        const invitation = await prisma.invitation.create({
            data: {
                name,
                email,
                token,
                expiresAt,
                status: "PENDING",
            },
        });

        // Send Email
        // Construct Invite Link (Using origin from request headers or default localhost)
        const origin = req.headers.get("origin") || "http://localhost:3000";
        const inviteLink = `${origin}/accept-invite?token=${token}`;

        const emailResult = await sendInvitationEmail(email, name, inviteLink);

        if (!emailResult.success) {
            // Rollback invitation if email fails (optional, but good practice)
            await prisma.invitation.delete({ where: { id: invitation.id } });
            return NextResponse.json({ error: "Failed to send email", details: emailResult.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, invitation });

    } catch (error) {
        console.error("Invite API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
