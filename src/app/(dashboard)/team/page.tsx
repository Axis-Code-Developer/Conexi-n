
import { prisma } from "@/lib/prisma";
import { TeamList } from "@/components/domain/TeamList";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
    let members: any[] = [];
    try {
        members = await prisma.user.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (e) {
        console.warn("Could not fetch members during render (likely build time or DB unreachable):", e);
        // Default to empty array to allow build to pass
        members = [];
    }

    return <TeamList members={members} />;
}
