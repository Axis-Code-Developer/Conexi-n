"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addMonths, endOfMonth, startOfMonth } from "date-fns";

export async function getEvents(date: Date) {
    try {
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        const events = await prisma.event.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                supervisor: true,
                assignments: {
                    include: {
                        user: true
                    }
                },
                tags: true,
            },
        });

        // Transform to match Calendar expected interface if needed, or return raw and transform in client
        return { success: true, events };
    } catch (error) {
        console.error("Error fetching events:", error);
        return { success: false, events: [] };
    }
}

import { auth } from "@/auth";

export async function createEvent(data: {
    title: string;
    date: Date;
    type: string;
    supervisorId?: string;
    staffName?: string;
    memberIds?: string[];
}) {
    try {
        let supervisorUserId = null;
        if (data.supervisorId) {
            const user = await prisma.user.findFirst({ where: { name: data.supervisorId } });
            if (user) supervisorUserId = user.id;
        }

        const newEvent = await prisma.event.create({
            data: {
                title: data.title,
                date: data.date,
                type: data.type as any, // Cast to enum
                supervisorId: supervisorUserId,
                staffName: data.staffName,
                supervisorName: data.supervisorId, // Store the name as passed
                assignments: {
                    create: data.memberIds?.map(userId => ({
                        userId: userId,
                        role: "Member" // Default role
                    }))
                }
            }
        });

        revalidatePath("/calendar");
        return { success: true, event: newEvent };
    } catch (error) {
        console.error("Failed to create event:", error);
        return { success: false, error: "Failed to create event" };
    }
}

export async function updateEvent(eventId: string, data: {
    title: string;
    type: string;
    supervisorId?: string;
    staffName?: string;
    memberIds?: string[];
}) {
    try {
        let supervisorUserId = null;
        if (data.supervisorId) {
            const user = await prisma.user.findFirst({ where: { name: data.supervisorId } });
            if (user) supervisorUserId = user.id;
        }

        // Transaction to update event and replace assignments
        await prisma.$transaction(async (tx) => {
            // Update Event details
            await tx.event.update({
                where: { id: eventId },
                data: {
                    title: data.title,
                    type: data.type as any,
                    supervisorId: supervisorUserId, // Use the calculated ID
                    staffName: data.staffName,
                    supervisorName: data.supervisorId, // Store the name as passed
                }
            });

            // Replace Assignments
            // 1. Delete existing
            await tx.assignment.deleteMany({
                where: { eventId: eventId }
            });

            // 2. Create new
            if (data.memberIds && data.memberIds.length > 0) {
                await tx.assignment.createMany({
                    data: data.memberIds.map(userId => ({
                        eventId: eventId,
                        userId: userId,
                        role: "Member"
                    }))
                });
            }
        });

        revalidatePath("/calendar");
        return { success: true };
    } catch (error) {
        console.error("Failed to update event:", error);
        return { success: false, error: "Failed to update event" };
    }
}

export async function getCurrentUser() {
    try {
        const session = await auth();
        if (!session?.user?.email) return null;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, image: true }
        });
        return user;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

export async function getAllUsers() {
    // For the member selection dropdown
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            image: true,
            isStaff: true,
            supervisorName: true,
            staffName: true
        }
    });
}

export async function deleteEvent(id: string) {
    try {
        // Delete assignments first to avoid Foreign Key constraint errors
        await prisma.assignment.deleteMany({
            where: { eventId: id }
        });

        await prisma.event.delete({ where: { id } });
        revalidatePath("/calendar");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete event:", error);
        return { success: false, error: "Failed to delete event" };
    }
}
