"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, AlertCircle, Loader2, History, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveCalendarFile, getCalendarFiles } from "@/app/(dashboard)/calendar/actions";

interface CalendarFileItem {
    id: string;
    fileName: string;
    fileSize: number;
    createdAt: Date;
    status?: "uploading" | "analyzing" | "success" | "error";
    message?: string;
}

export function AgentInterface() {
    const [files, setFiles] = useState<CalendarFileItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Fetch initial history and user
    useEffect(() => {
        const init = async () => {
            // Fetch User
            try {
                const userRes = await fetch("/api/user/me");
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setCurrentUser(userData.user);
                }
            } catch (e) { console.error(e); }

            // Fetch Files
            const dbFiles = await getCalendarFiles();
            setFiles(dbFiles.map((f: any) => ({
                id: f.id,
                fileName: f.fileName,
                fileSize: f.fileSize,
                createdAt: f.createdAt,
                status: "success", // Assume stored files are successful
                message: "Procesado"
            })));
        };
        init();
    }, []);

    const handleFile = async (file: File) => {
        // Validate file type
        const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
        if (!validTypes.includes(file.type)) {
            alert("Tipo de archivo no soportado");
            return;
        }

        // Optimistic UI update
        const tempId = Math.random().toString();
        const newFileItem: CalendarFileItem = {
            id: tempId,
            fileName: file.name,
            fileSize: file.size,
            createdAt: new Date(),
            status: "uploading",
            message: "Subiendo..."
        };

        setFiles(prev => [newFileItem, ...prev]);

        try {
            // Save to DB
            const saveRes = await saveCalendarFile({
                fileName: file.name,
                fileSize: file.size,
                uploadedBy: currentUser?.name || "Desconocido", // Fallback
                content: "" // Placeholder
            });

            if (!saveRes.success) throw new Error("Error al guardar registro");

            // Update status to analyzing
            setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: "analyzing", message: "Analizando..." } : f));

            // Call Analysis API
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/ai/analyze-document", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: "error", message: data.error || "Error al analizar" } : f));
                return;
            }

            // Success final
            setFiles(prev => prev.map(f => f.id === tempId ? {
                ...f,
                id: saveRes.data?.id || tempId, // Update with real ID
                status: "success",
                message: "Completado"
            } : f));

        } catch (error) {
            console.error(error);
            setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: "error", message: "Error de conexión" } : f));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-display font-bold text-white">Gestor de Calendarios</h2>
                <p className="text-gray-400 text-sm">Sube documentos para extraer eventos.</p>
            </div>

            {/* Upload Zone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-sm shrink-0",
                    isDragging
                        ? "border-primary bg-primary/10 scale-[0.99]"
                        : "border-white/20 bg-[#252525] hover:bg-[#2a2a2a] hover:border-white/30"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-gray-300" />
                </div>
                <p className="font-medium text-white text-sm">Haz clic o arrastra un archivo</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG</p>
            </div>

            {/* File History Section ("Explorer" style) */}
            <div className="flex-1 flex flex-col min-h-0 pt-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-base font-medium text-gray-400">
                        Historial de archivos
                    </h3>
                    <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                                <History className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl bg-[#1a1a1a] border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Historial Completo</DialogTitle>
                                <DialogDescription>Todos los archivos procesados por el agente.</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[400px] mt-4 pr-4">
                                <div className="space-y-1">
                                    {files.map(file => (
                                        <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-[#252525] border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                    <FileIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{file.fileName}</p>
                                                    <p className="text-xs text-gray-500">{new Date(file.createdAt).toLocaleString()} • {formatFileSize(file.fileSize)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {file.status === 'success' && <span className="text-xs text-green-400 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">Procesado</span>}
                                                {file.status === 'error' && <span className="text-xs text-red-400 px-2 py-1 bg-red-500/10 rounded-full border border-red-500/20">Error</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Main List - Explorer Style */}
                <ScrollArea className="flex-1 pr-3 -mr-3">
                    {files.length === 0 ? (
                        <div className="text-left py-4 text-gray-500 text-sm pl-2">
                            No hay archivos recientes.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {files.slice(0, 8).map((file) => ( // Show more files now
                                <div
                                    key={file.id}
                                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
                                >
                                    {/* Icon */}
                                    <div className="shrink-0">
                                        {file.status === 'uploading' || file.status === 'analyzing' ? (
                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        ) : file.status === 'error' ? (
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <FileText className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-base text-gray-400 group-hover:text-white truncate transition-colors font-normal">
                                            {file.fileName}
                                        </p>
                                    </div>

                                    <div className="text-[10px] text-gray-600 group-hover:text-gray-500">
                                        {new Date(file.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
