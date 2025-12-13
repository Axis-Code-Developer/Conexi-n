"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createResource(data: {
    title: string;
    description?: string;
    category: string;
    type: string;
    fileUrl?: string;
}) {
    try {
        await prisma.resource.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                type: data.type,
                fileUrl: data.fileUrl,
            }
        });

        revalidatePath("/resources");
        return { success: true };
    } catch (error) {
        console.error("Failed to create resource", error);
        return { success: false, error: "Failed to create resource" };
    }
}

export async function deleteResource(id: string) {
    try {
        await prisma.resource.delete({
            where: { id }
        });
        revalidatePath("/resources");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete resource", error);
        return { success: false, error: "Failed to delete resource" };
    }
}

export async function getResources() {
    try {
        const resources = await prisma.resource.findMany({
            orderBy: { createdAt: "desc" }
        });
        return { success: true, resources };
    } catch (error) {
        console.error("Failed to get resources", error);
        return { success: false, resources: [] };
    }
}
