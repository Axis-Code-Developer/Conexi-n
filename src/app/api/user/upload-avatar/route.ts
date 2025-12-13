import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "avatars");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(req: Request) {
    try {
        console.log("🔵 [UPLOAD AVATAR] Request received");

        const session = await auth();
        console.log("🔵 [UPLOAD AVATAR] Session:", session?.user);

        if (!session || !session.user || !session.user.id) {
            console.log("🔴 [UPLOAD AVATAR] Unauthorized - no session or user ID");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("avatar") as File;
        console.log("🔵 [UPLOAD AVATAR] File received:", file?.name, file?.type, file?.size);

        if (!file) {
            console.log("🔴 [UPLOAD AVATAR] No file provided");
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            console.log("🔴 [UPLOAD AVATAR] Invalid file type:", file.type);
            return NextResponse.json({
                error: "Formato no permitido. Solo PNG, JPEG y WEBP."
            }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            console.log("🔴 [UPLOAD AVATAR] File too large:", file.size);
            return NextResponse.json({
                error: "Archivo muy grande. Máximo 5MB."
            }, { status: 400 });
        }

        // Create upload directory if it doesn't exist
        console.log("🔵 [UPLOAD AVATAR] Upload directory:", UPLOAD_DIR);
        if (!existsSync(UPLOAD_DIR)) {
            console.log("🔵 [UPLOAD AVATAR] Creating upload directory");
            await mkdir(UPLOAD_DIR, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${session.user.id}-${timestamp}.${extension}`;
        const filepath = join(UPLOAD_DIR, filename);
        console.log("🔵 [UPLOAD AVATAR] Saving to:", filepath);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        console.log("✅ [UPLOAD AVATAR] File saved successfully");

        // Return the public URL
        const imageUrl = `/uploads/avatars/${filename}`;
        console.log("✅ [UPLOAD AVATAR] Image URL:", imageUrl);

        return NextResponse.json({
            success: true,
            imageUrl
        });

    } catch (error: any) {
        console.error("🔴 [UPLOAD AVATAR] Error:", error);
        console.error("🔴 [UPLOAD AVATAR] Error message:", error?.message);
        console.error("🔴 [UPLOAD AVATAR] Error stack:", error?.stack);
        return NextResponse.json({
            error: "Error al subir la imagen",
            details: error?.message
        }, { status: 500 });
    }
}
