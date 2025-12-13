"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createActivity(data: {
    name: string;
    description?: string;
    icon: string;
    color: string;
    responsibleId: string;
    status?: "PENDING" | "DONE" | "CANCELLED";
}) {
    try {
        await prisma.activity.create({
            data: {
                name: data.name,
                description: data.description,
                icon: data.icon,
                color: data.color,
                responsibleId: data.responsibleId,
                status: data.status || "PENDING",
            }
        });

        revalidatePath("/activities");
        return { success: true };
    } catch (error) {
        console.error("Failed to create activity", error);
        return { success: false, error: "Failed to create activity" };
    }
}

export async function createActivityUpdate(data: {
    activityId: string;
    title: string;
    content: string;
    authorId: string;
}) {
    try {
        await prisma.activityUpdate.create({
            data: {
                title: data.title,
                content: data.content,
                activityId: data.activityId,
                authorId: data.authorId,
            }
        });

        revalidatePath("/activities");
        return { success: true };
    } catch (error) {
        console.error("Failed to create activity update", error);
        return { success: false, error: "Failed to create update" };
    }
}

export async function updateActivityStatus(activityId: string, status: "PENDING" | "DONE" | "CANCELLED") {
    try {
        await prisma.activity.update({
            where: { id: activityId },
            data: { status }
        });

        revalidatePath("/activities");
        return { success: true };
    } catch (error) {
        console.error("Failed to update activity status", error);
        return { success: false, error: "Failed to update activity status" };
    }
}

export async function deleteActivity(activityId: string) {
    try {
        await prisma.activity.delete({
            where: { id: activityId }
        });
        revalidatePath("/activities");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete activity", error);
        return { success: false, error: "Failed to delete activity" };
    }
}

export async function getActivities() {
    try {
        const activities = await prisma.activity.findMany({
            include: {
                responsible: {
                    select: { name: true, image: true, id: true }
                },
                updates: {
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, activities };
    } catch (error) {
        console.error("Failed to get activities", error);
        return { success: false, activities: [] };
    }
}

export async function getUsersSimple() {
    return await prisma.user.findMany({
        select: { id: true, name: true, image: true },
        orderBy: { name: "asc" }
    });
}
