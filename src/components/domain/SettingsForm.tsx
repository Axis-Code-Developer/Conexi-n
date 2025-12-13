"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, User } from "lucide-react";
import { Label } from "@/components/ui/label";

interface UserData {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    supervisorName?: string | null;
}

interface SettingsFormProps {
    user: UserData;
}

export function SettingsForm({ user }: SettingsFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States - initialized with fresh DB data
    const [loadingImage, setLoadingImage] = useState(false);
    const [name, setName] = useState(user.name);
    const [saving, setSaving] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        const validTypes = ["image/png", "image/jpeg", "image/webp"];
        if (!validTypes.includes(file.type)) {
            alert("Formato no permitido. Solo PNG, JPEG y WEBP.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Archivo muy grande. Máximo 5MB.");
            return;
        }

        setLoadingImage(true);

        try {
            // Upload file
            const formData = new FormData();
            formData.append("avatar", file);

            const uploadRes = await fetch("/api/user/upload-avatar", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const error = await uploadRes.json();
                alert(error.error || "Error al subir la imagen");
                setLoadingImage(false);
                return;
            }

            const { imageUrl } = await uploadRes.json();

            // Update profile with new image URL
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                body: JSON.stringify({ image: imageUrl }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                // Refresh the page to get fresh data from server
                router.refresh();
            } else {
                alert("Error al actualizar el perfil");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setLoadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleNameBlur = async () => {
        const trimmedName = name.trim();

        if (trimmedName === "") {
            // Reset to original name if empty
            setName(user.name);
            return;
        }

        if (trimmedName === user.name) {
            return; // No changes
        }

        setSaving(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                body: JSON.stringify({ name: trimmedName }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Error al actualizar el nombre");
                setName(user.name); // Revert on error
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
            setName(user.name); // Revert on error
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 px-8 pt-8 pb-12 w-full max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Configuración</h1>
                <p className="text-gray-400">Administra tu perfil y preferencias</p>
            </div>

            <div className="w-full bg-[#313131] rounded-lg p-8 border-[0.6px] border-white/50 shadow-md">
                <h2 className="text-xl font-semibold text-white mb-6">Perfil Público</h2>

                <div className="flex flex-col sm:flex-row gap-8 items-start">
                    {/* Image Section */}
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-32 h-32 rounded-lg border-2 border-white/20 shadow-lg bg-[#3a3a3a]">
                            {user.image ? (
                                <AvatarImage src={user.image} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-[#3a3a3a] text-white text-4xl rounded-lg">
                                <User className="w-16 h-16 text-gray-500" />
                            </AvatarFallback>
                        </Avatar>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loadingImage}
                            className="bg-[#3a3a3a] text-white border-[0.6px] border-white/30 hover:bg-[#404040] shadow-sm font-normal rounded-lg text-xs h-8"
                        >
                            {loadingImage ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                            ) : (
                                <Camera className="w-3 h-3 mr-2" />
                            )}
                            Nueva Imagen
                        </Button>
                        <p className="text-[10px] text-gray-500 text-center max-w-[140px]">
                            PNG, JPEG o WEBP. Máximo 5MB.
                        </p>
                    </div>

                    {/* Fields Section */}
                    <div className="flex-1 grid gap-6 w-full max-w-lg">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300 font-normal">Nombre Completo</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleNameBlur}
                                disabled={saving}
                                className="bg-[#3a3a3a] border-white/10 focus-visible:bg-[#404040] transition-all disabled:opacity-50"
                                placeholder="Tu nombre completo"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 font-normal">Correo Electrónico</Label>
                            <div className="flex items-center px-3 py-2 bg-[#3a3a3a] border-[0.6px] border-white/10 rounded-lg text-white text-sm opacity-50 cursor-not-allowed">
                                {user.email}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 font-normal">Rol</Label>
                            <div className="inline-flex items-center px-3 py-1 bg-[#3a3a3a] text-white border-[0.6px] border-white/10 rounded-lg text-xs font-medium w-fit uppercase tracking-wider">
                                {user.role}
                            </div>
                        </div>

                        {/* Supervisor Display */}
                        <div className="space-y-2">
                            <Label className="text-gray-300 font-normal">Supervisor Asignado</Label>
                            <div className="flex items-center gap-2 px-3 py-2 bg-[#3a3a3a] border-[0.6px] border-white/10 rounded-lg text-white text-sm">
                                {user.supervisorName ? (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        <span>{user.supervisorName}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-500 italic">No asignado</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
