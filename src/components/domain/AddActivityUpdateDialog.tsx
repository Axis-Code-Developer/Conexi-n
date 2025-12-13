"use client";

import { useState } from "react";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createActivityUpdate } from "@/app/activities/actions";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddActivityUpdateDialogProps {
    activityId: string;
    activityName: string;
    currentUser: any;
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddActivityUpdateDialog({ activityId, activityName, currentUser }: AddActivityUpdateDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content || !title) return;
        setIsSubmitting(true);
        try {
            const res = await createActivityUpdate({
                activityId,
                title,
                content,
                authorId: currentUser.id,
            });
            if (res.success) {
                setOpen(false);
                setContent("");
                setTitle("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-transparent hover:text-amber-500 text-gray-400 transition-colors"
                    title="Añadir avance"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-[#1a1a1a] border-white/10 text-white gap-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-display">Añadir Avance</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Redacta un nuevo avance para la actividad <span className="text-white font-medium">{activityName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-white">Nombre del Avance</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Reunión con proveedores"
                            className="bg-[#252525] border-white/10 text-white placeholder:text-gray-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Detalles</Label>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escribe los detalles del avance..."
                            className="focus-within:border-amber-500/50 min-h-[200px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title || !content || content === '<p></p>'}
                        className="bg-[#313131] text-white border-[0.6px] border-white/50 hover:bg-[#3a3a3a] shadow-md transition-colors rounded-lg font-normal"
                    >
                        {isSubmitting ? "Guardando..." : "Publicar Avance"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
