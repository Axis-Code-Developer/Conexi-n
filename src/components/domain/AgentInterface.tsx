"use client";

import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

export function AgentInterface() {
    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Agente IA</h2>
                <p className="text-gray-500 text-sm">Sube tus calendarios PDF para detectar eventos y conflictos.</p>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-gray-900">Haz clic o arrastra un archivo</p>
                <p className="text-sm text-gray-500 mt-1">Soporta PDF, JPG, PNG</p>
            </div>

            {/* Status / Activity Log */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col">
                <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Actividad del Agente
                </h3>

                <div className="space-y-4">
                    {/* Mock Item 1 */}
                    <div className="flex gap-3 text-sm">
                        <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                            <p className="font-medium">Calendario_Jovenes.pdf</p>
                            <p className="text-gray-500 text-xs">Analizando fechas...</p>
                        </div>
                    </div>

                    {/* Mock Item 2 */}
                    <div className="flex gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                            <p className="font-medium text-amber-800">Posible Conflicto</p>
                            <p className="text-amber-700 text-xs mt-1">
                                "Juan Perez" tiene ensayo de alabanza el 15 Oct.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
