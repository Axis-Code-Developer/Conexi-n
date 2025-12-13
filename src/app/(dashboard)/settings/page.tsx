import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/domain/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    // Fetch fresh user data directly from database
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            supervisorName: true,
        }
    });

    if (!user) {
        redirect("/login");
    }

    return <SettingsForm user={user} />;
}
