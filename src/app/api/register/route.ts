import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        const invite = await prisma.invitation.findUnique({ where: { token } });

        if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
            return NextResponse.json({ error: "Invitación inválida" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction: Create User & Update Invite
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name: invite.name,
                    email: invite.email,
                    password: hashedPassword,
                    role: "MEMBER" // Default role
                }
            });

            await tx.invitation.update({
                where: { id: invite.id },
                data: { status: "ACCEPTED" }
            });

            return newUser;
        });

        return NextResponse.json({ success: true, user: { id: user.id } });

    } catch (error) {
        console.error("Registration Error", error);
        return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 });
    }
}
