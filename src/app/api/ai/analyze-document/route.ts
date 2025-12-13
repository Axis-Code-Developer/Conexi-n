import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzeCalendarDocument, type AnalysisResult } from "@/lib/gemini";

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No se proporcionó ningún archivo" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Tipo de archivo no soportado. Solo PDF, PNG, JPEG, WEBP" },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "Archivo muy grande. Máximo 10MB" },
                { status: 400 }
            );
        }

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        // Analyze document with Gemini
        const result: AnalysisResult = await analyzeCalendarDocument({
            base64,
            mimeType: file.type,
        });

        if (result.error) {
            return NextResponse.json(
                {
                    error: "Error al analizar documento",
                    details: result.error,
                    events: [],
                    summary: result.summary,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            events: result.events,
            summary: result.summary,
            possibleConflicts: result.possibleConflicts,
            fileName: file.name,
        });
    } catch (error) {
        console.error("Document analysis error:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
