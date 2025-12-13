"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveCalendarFile(data: {
    fileName: string;
    fileSize: number;
    content?: string;
    uploadedBy: string;
}) {
    try {
        const fileRecord = await prisma.calendarFile.create({
            data: {
                fileName: data.fileName,
                fileSize: data.fileSize,
                content: data.content,
                uploadedBy: data.uploadedBy
            }
        });

        revalidatePath("/calendar");
        return { success: true, data: fileRecord };
    } catch (error) {
        console.error("Error saving calendar file:", error);
        return { success: false, error: "Failed to save file record" };
    }
}

export async function getCalendarFiles() {
    try {
        const files = await prisma.calendarFile.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return files;
    } catch (error) {
        console.error("Error fetching calendar files:", error);
        return [];
    }
}
