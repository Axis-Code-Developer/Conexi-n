"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserSupervisor(userId: string, supervisorName: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { supervisorName: supervisorName || null },
        });

        revalidatePath("/team");
        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating supervisor:", error);
        return { success: false, error: "Failed to update supervisor" };
    }
}

export async function setStaffStatus(userId: string, isStaff: boolean, staffIdentity?: string) {
    try {
        const data: any = { isStaff };

        // Save the staff identity string to staffName field
        if (isStaff && staffIdentity) {
            data.staffName = staffIdentity;
        } else if (!isStaff) {
            // Clear staffName when removing staff status
            data.staffName = null;
        }

        await prisma.user.update({
            where: { id: userId },
            data: data,
        });

        revalidatePath("/team");
        return { success: true };
    } catch (error) {
        console.error("Error setting staff status:", error);
        return { success: false, error: "Failed to update staff status" };
    }
}
