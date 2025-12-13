"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFollowUp(data: {
    evangelizer: string;
    date: Date;
    fullName: string;
    whatsapp: string;
    email?: string;
    acceptedJesus: string;
    reason: string;
    agreedToFollowUp: string;
    observations?: string;
}) {
    try {
        const followUp = await prisma.followUp.create({
            data: {
                evangelizer: data.evangelizer,
                date: data.date,
                fullName: data.fullName,
                whatsapp: data.whatsapp,
                email: data.email,
                acceptedJesus: data.acceptedJesus,
                reason: data.reason,
                agreedToFollowUp: data.agreedToFollowUp,
                observations: data.observations,
                status: "PENDING"
            }
        });

        revalidatePath("/follow-up");
        return { success: true, data: followUp };
    } catch (error) {
        console.error("Error creating follow up:", error);
        return { success: false, error: "Failed to create follow up" };
    }
}

export async function getFollowUps() {
    try {
        const followUps = await prisma.followUp.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return followUps;
    } catch (error) {
        console.error("Error fetching follow ups:", error);
        return [];
    }
}

export async function deleteFollowUp(id: string) {
    try {
        await prisma.followUp.delete({
            where: { id }
        });
        revalidatePath("/follow-up");
        return { success: true };
    } catch (error) {
        console.error("Error deleting follow up:", error);
        return { success: false, error: "Failed to delete" };
    }
}

export async function updateFollowUpStatus(id: string, status: string) {
    try {
        await prisma.followUp.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/follow-up");
        return { success: true };
    } catch (error) {
        console.error("Error updating status:", error);
        return { success: false, error: "Failed to update status" };
    }
}
