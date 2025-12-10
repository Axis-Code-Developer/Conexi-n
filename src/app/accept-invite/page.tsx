import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

const prisma = new PrismaClient();

export default async function AcceptInvitePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }> // Next.js 15+ async searchParams
}) {
    const { token } = await searchParams; // Await searchParams in Next 15

    if (!token || typeof token !== 'string') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Token inválido</h1>
                <p>El enlace de invitación no es válido.</p>
            </div>
        );
    }

    const invitation = await prisma.invitation.findUnique({
        where: { token },
    });

    if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Invitación inválida o expirada</h1>
                <p>Esta invitación ya no está disponible.</p>
            </div>
        );
    }

    // In a real app, here you would show a form to set password
    // For now, we will just mark as ACCEPTED and creating a dummy user (or redirecting to register)

    // Simulation of acceptance:
    try {
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' }
        });
        // Optionally create User record here
    } catch (e) {
        console.error(e);
        return <div>Error processing</div>
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2 font-display">¡Bienvenido, {invitation.name}!</h1>
                <p className="text-gray-600 mb-6">Has aceptado la invitación al Ministerio Conexión exitosamente.</p>

                <Link href="/calendar" className="block w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Ir al Calendario
                </Link>
            </div>
        </div>
    );
}
