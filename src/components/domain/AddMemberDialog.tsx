"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, CheckCircle2, X } from "lucide-react";

export function AddMemberDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleInvite = async () => {
        if (!name || !email) return;

        setLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch("/api/invite", {
                method: "POST",
                body: JSON.stringify({ name, email }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setErrorMessage(data.error || "Error al enviar invitación");
            }
        } catch (e) {
            console.error(e);
            setErrorMessage("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        // Reset state after dialog closes
        setTimeout(() => {
            setSuccess(false);
            setName("");
            setEmail("");
            setErrorMessage("");
        }, 200);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
                handleClose();
            } else {
                setOpen(true);
            }
        }}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 px-4 py-2 rounded-lg border-[0.6px] border-white shadow-md transition-all duration-200 bg-[#313131] text-white hover:bg-[#3a3a3a] font-normal">
                    <UserPlus className="w-4 h-4" />
                    Añadir miembro
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                {/* Success State */}
                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                        <h3 className="text-xl font-semibold text-white">¡Invitación Enviada!</h3>
                        <p className="text-gray-400 text-center text-sm">
                            Se ha enviado un correo de invitación a <span className="text-white font-medium">{email}</span>
                        </p>
                        <Button
                            onClick={handleClose}
                            className="mt-4 w-full bg-[#313131] text-white border-[0.6px] border-white/50 hover:bg-[#3a3a3a] shadow-md transition-colors rounded-lg font-normal"
                        >
                            Cerrar
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Form State */}
                        <DialogHeader>
                            <DialogTitle>Invitar Miembro</DialogTitle>
                            <DialogDescription>
                                Envía una invitación por correo para unirse al equipo.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right font-normal">
                                    Nombre
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ej. Juan Pérez"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="col-span-3 font-normal"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right font-normal">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="juan@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="col-span-3 font-normal"
                                />
                            </div>
                            {errorMessage && (
                                <p className="text-sm text-red-400 text-center bg-red-900/20 py-2 rounded-md">
                                    {errorMessage}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleInvite} disabled={loading || !name || !email} className="w-full sm:w-auto bg-[#313131] text-white border-[0.6px] border-white/50 hover:bg-[#3a3a3a] shadow-md transition-colors rounded-lg font-normal">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enviar Invitación
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
