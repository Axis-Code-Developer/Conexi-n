import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

// Event type extracted from documents
export interface ExtractedEvent {
    title: string;
    date: string; // ISO format
    time?: string;
    users?: string[];
    type: "general" | "service" | "practice";
    confidence: number; // 0-1 confidence score
}

// System prompt for calendar extraction
const CALENDAR_EXTRACTION_PROMPT = `Eres un experto en extraer eventos de calendario de documentos.

Analiza el documento proporcionado (puede ser un PDF de calendario, imagen de horario, o documento de actividades) y extrae TODOS los eventos que encuentres.

Para cada evento, identifica:
1. **Título del evento** - El nombre de la actividad
2. **Fecha** - En formato ISO (YYYY-MM-DD). Si solo hay día de la semana, calcula la fecha más cercana.
3. **Hora** - Si se menciona (formato 12h o 24h)
4. **Personas asignadas** - Nombres de personas mencionadas para ese evento
5. **Tipo de evento**:
   - "service" para servicios religiosos, misas, cultos
   - "practice" para ensayos, prácticas, reuniones de equipo
   - "general" para cualquier otro tipo

REGLAS IMPORTANTES:
- Extrae TODOS los eventos, incluso si no tienen todos los campos
- Si hay eventos recurrentes, lista cada instancia por separado
- Los nombres de personas deben estar en formato "Nombre Apellido" cuando sea posible
- Las fechas deben calcularse basándose en el contexto del documento

Responde ÚNICAMENTE con un JSON válido en este formato:
{
  "events": [
    {
      "title": "Servicio Dominical",
      "date": "2025-12-15",
      "time": "10:00 AM",
      "users": ["Juan Pérez", "María García"],
      "type": "service",
      "confidence": 0.95
    }
  ],
  "summary": "Se encontraron X eventos en el documento",
  "possibleConflicts": [
    {
      "description": "Juan Pérez tiene dos eventos el mismo día",
      "events": ["Evento 1", "Evento 2"]
    }
  ]
}`;

export interface AnalysisResult {
    events: ExtractedEvent[];
    summary: string;
    possibleConflicts: {
        description: string;
        events: string[];
    }[];
    rawResponse?: string;
    error?: string;
}

/**
 * Analyzes a calendar document (PDF or image) using Gemini Vision
 */
export async function analyzeCalendarDocument(
    fileData: {
        base64: string;
        mimeType: string;
    }
): Promise<AnalysisResult> {
    try {
        const response = await genai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: fileData.mimeType,
                                data: fileData.base64,
                            },
                        },
                        {
                            text: CALENDAR_EXTRACTION_PROMPT,
                        },
                    ],
                },
            ],
        });

        const textResponse = response.text ?? "";

        // Parse JSON from response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return {
                events: [],
                summary: "No se pudo extraer información del documento",
                possibleConflicts: [],
                rawResponse: textResponse,
                error: "No valid JSON found in response"
            };
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            events: parsed.events || [],
            summary: parsed.summary || `Se encontraron ${parsed.events?.length || 0} eventos`,
            possibleConflicts: parsed.possibleConflicts || [],
            rawResponse: textResponse,
        };
    } catch (error) {
        console.error("Gemini analysis error:", error);
        return {
            events: [],
            summary: "Error al analizar el documento",
            possibleConflicts: [],
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
