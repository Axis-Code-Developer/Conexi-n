"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, FileIcon, X, Video, Link as LinkIcon, FileText, FolderPlus, Image as ImageIcon, BookOpen, Music as MusicIcon, Mic, Folder } from "lucide-react";
import { createResource } from "@/app/resources/actions";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const CATEGORIES = [
    { value: "Documentos", label: "Documentos", icon: Folder },
    { value: "Multimedia", label: "Multimedia", icon: MusicIcon },
    { value: "Guías", label: "Guías", icon: BookOpen },
    { value: "Reuniones", label: "Reuniones", icon: Mic },
    { value: "Otros", label: "Otros", icon: Folder }
];

const TYPES = [
    { value: "DOCUMENT", label: "Documento", icon: Upload, description: "Subir archivo" },
    { value: "VIDEO", label: "Video", icon: Video, description: "Enlace de video" },
    { value: "LINK", label: "Enlace", icon: LinkIcon, description: "Enlace externo" },
    { value: "TEXT", label: "Texto", icon: FileText, description: "Redacción libre" },
];

export function AddResourceDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("DOCUMENT");
    const [fileUrl, setFileUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        setUploading(true);
        setFileName(file.name);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/resources/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.fileUrl) {
                setFileUrl(data.fileUrl);
            } else {
                alert(data.error || "Error al subir el archivo");
                setFileName("");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error al subir el archivo");
            setFileName("");
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setFileUrl("");
        setFileName("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!title || !category || !type) return;
        if (type === "DOCUMENT" && !fileUrl) return;
        if ((type === "VIDEO" || type === "LINK") && !fileUrl) return;

        setLoading(true);
        try {
            await createResource({
                title,
                description,
                category,
                type,
                fileUrl
            });
            setOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("");
        setType("DOCUMENT");
        setFileUrl("");
        setFileName("");
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 px-4 py-2 rounded-lg border-[0.6px] border-white shadow-xl shadow-black/30 transition-all duration-200 bg-[#313131] text-white hover:bg-[#3a3a3a] font-normal">
                    <FolderPlus className="w-4 h-4" />
                    Nuevo Recurso
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-white/10 text-white max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Crear Recurso</DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] -mr-4 pr-4">
                    <div className="grid gap-6 py-4">
                        {/* Header Input: Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-gray-400">Título del recurso</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Título del recurso"
                                className="bg-[#252525] border-white/10 text-white focus:border-white/20"
                            />
                        </div>

                        {/* WYSIWYG / Description */}
                        <div className="space-y-2">
                            <Label className="text-gray-400">{type === 'TEXT' ? 'Contenido' : 'Descripción'}</Label>
                            <RichTextEditor
                                value={description}
                                onChange={setDescription}
                                className="bg-[#252525] border-white/10 min-h-[150px]"
                            />
                        </div>

                        {/* Metadata Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-400">Categoría</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="bg-[#252525] border-white/10 text-white w-full">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#252525] border-white/10 text-white">
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <cat.icon className="w-4 h-4" />
                                                    {cat.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">Tipo de Recurso</Label>
                                <Select value={type} onValueChange={(v) => { setType(v); setFileUrl(""); setFileName(""); }}>
                                    <SelectTrigger className="bg-[#252525] border-white/10 text-white w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#252525] border-white/10 text-white">
                                        {TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <t.icon className="w-4 h-4" />
                                                    {t.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dynamic Content based on Type */}
                        {type === "DOCUMENT" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-gray-400">Archivo</Label>
                                {fileName ? (
                                    <div className="flex items-center justify-between bg-[#252525] border border-white/10 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <FileIcon className="w-5 h-5 text-blue-400" />
                                            <span className="text-sm text-white truncate max-w-[280px]">{fileName}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={clearFile} className="text-gray-400 hover:text-red-400 h-8 w-8">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => inputRef.current?.click()}
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                                            dragActive
                                                ? "border-blue-500 bg-blue-500/10"
                                                : "border-white/10 hover:border-white/30 bg-[#252525]"
                                        )}
                                    >
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,.gif"
                                        />
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                                <p className="text-sm text-gray-400">Subiendo archivo...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="w-8 h-8 text-gray-500" />
                                                <p className="text-sm text-gray-400">
                                                    Arrastra un archivo aquí o <span className="text-blue-400">selecciona</span>
                                                </p>
                                                <p className="text-xs text-gray-500">PDF, Office, Imágenes (máx. 20MB)</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {(type === "VIDEO" || type === "LINK") && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="url" className="text-gray-400">
                                    {type === "VIDEO" ? "URL del Video" : "URL del Enlace"}
                                </Label>
                                <Input
                                    id="url"
                                    value={fileUrl}
                                    onChange={(e) => setFileUrl(e.target.value)}
                                    placeholder={type === "VIDEO" ? "https://youtube.com/watch?v=..." : "https://..."}
                                    className="bg-[#252525] border-white/10 text-white"
                                />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !title || !category || (type !== 'TEXT' && !fileUrl)}
                        className="bg-[#313131] text-white border-[0.6px] border-white/50 hover:bg-[#3a3a3a] shadow-md transition-colors rounded-lg font-normal"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publicar Recurso
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
