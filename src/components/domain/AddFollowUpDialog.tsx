"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Ensure this is available or use a custom class
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClipboardList, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createFollowUp } from "@/app/(dashboard)/follow-up/actions";
import { toast } from "sonner"; // Assuming sonner or similar toast is used, or just log

const STEPS = [
    { id: 1, title: "Inicio" },
    { id: 2, title: "Contacto" },
    { id: 3, title: "Decisión" },
    { id: 4, title: "Seguimiento" },
];

interface UserData {
    id: string;
    name: string;
    email: string;
    image: string | null;
}

export function AddFollowUpDialog() {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };
        if (open) fetchUser();
    }, [open]);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        fullName: "",
        whatsapp: "+504 ",
        email: "",
        acceptedJesus: "",
        reason: "",
        agreedToFollowUp: "Sí",
        observations: ""
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Format phone number: +504 1234-5678
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Ensure it always starts with +504
        if (!value.startsWith("+504 ")) {
            value = "+504 " + value.replace(/^\+?504\s?/, "").replace(/\D/g, "");
        }

        // Extract just the part after +504
        const numberPart = value.substring(5).replace(/\D/g, "");

        // Limit to 8 digits
        const limitedDigits = numberPart.slice(0, 8);

        // Format with dash
        let formatted = "+504 ";
        if (limitedDigits.length > 4) {
            formatted += limitedDigits.slice(0, 4) + "-" + limitedDigits.slice(4);
        } else {
            formatted += limitedDigits;
        }

        setFormData(prev => ({ ...prev, whatsapp: formatted }));
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            fullName: "",
            whatsapp: "+504 ",
            email: "",
            acceptedJesus: "",
            reason: "",
            agreedToFollowUp: "Sí",
            observations: ""
        });
        setCurrentStep(1);
    };

    // Validation for each step
    const canProceedToNextStep = () => {
        if (currentStep === 2) {
            // Step 2 requires fullName and whatsapp (at least +504 and some digits)
            // +504 1234-5678 is length 5 + 4 + 1 + 4 = 14 chars approx
            // Let's say at least +504 and 1 digit: length > 5
            return formData.fullName.trim() !== "" && formData.whatsapp.length > 6;
        }
        if (currentStep === 3) {
            // Step 3 requires acceptedJesus and reason
            return formData.acceptedJesus !== "" && formData.reason.trim() !== "";
        }
        return true;
    };

    const nextStep = () => {
        if (currentStep < STEPS.length && canProceedToNextStep()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.whatsapp) return;

        setIsSubmitting(true);
        try {
            const result = await createFollowUp({
                evangelizer: user?.name || "Desconocido", // Use logged in user name
                date: new Date(formData.date),
                fullName: formData.fullName,
                whatsapp: formData.whatsapp,
                email: formData.email,
                acceptedJesus: formData.acceptedJesus,
                reason: formData.reason,
                agreedToFollowUp: formData.agreedToFollowUp,
                observations: formData.observations
            });

            if (result.success) {
                setOpen(false);
                resetForm();
            } else {
                console.error("Error saving:", result.error);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLastStep = currentStep === STEPS.length;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    const formattedTime = currentDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 px-4 py-2 rounded-lg border-[0.6px] border-white shadow-md transition-all duration-200 bg-[#313131] text-white hover:bg-[#3a3a3a] font-normal">
                    <ClipboardList className="w-4 h-4" />
                    Llenar formulario
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[900px] bg-[#1a1a1a] border-white/10 text-white gap-0 p-0 sm:rounded-3xl">
                {/* Header with Stepper on LEFT */}
                <div className="px-6 pt-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-6">
                        {/* Mini Stepper - LEFT */}
                        <div className="flex items-center gap-1">
                            {STEPS.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                                        disabled={step.id >= currentStep}
                                        className={cn(
                                            "w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-all",
                                            currentStep === step.id
                                                ? "bg-white text-black"
                                                : currentStep > step.id
                                                    ? "bg-white/20 text-white cursor-pointer"
                                                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                                        )}
                                    >
                                        {currentStep > step.id ? (
                                            <Check className="w-3.5 h-3.5" />
                                        ) : (
                                            step.id
                                        )}
                                    </button>
                                    {index < STEPS.length - 1 && (
                                        <div className={cn(
                                            "w-4 h-[2px] mx-0.5",
                                            currentStep > step.id ? "bg-white/30" : "bg-white/10"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Title - Correctly using DialogTitle for accessibility */}
                        <div>
                            <DialogTitle className="text-lg font-display font-semibold">Nuevo Registro</DialogTitle>
                            {/* Hidden Description to avoid warnings if strictly required, but usually title is the main one */}
                            <DialogDescription className="sr-only">Formulario para ingresar un nuevo seguimiento</DialogDescription>
                        </div>
                    </div>
                </div>

                {/* Content - CENTERED */}
                <ScrollArea className="max-h-[65vh] w-full">
                    <div className="px-6 py-10 min-h-[400px] flex items-center justify-center">
                        <div className="w-full max-w-md mx-auto">

                            {/* Step 1: Bienvenida */}
                            {currentStep === 1 && (
                                <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
                                    {/* Avatar */}
                                    <Avatar className="w-20 h-20 border-2 border-white/20">
                                        {user?.image ? (
                                            <AvatarImage src={user.image} />
                                        ) : null}
                                        <AvatarFallback className="bg-[#313131] text-white text-2xl">
                                            {user?.name?.[0]?.toUpperCase() || "?"}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* User name */}
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-white mb-1">
                                            {user?.name || "Cargando..."}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {formattedDate} <span className="text-gray-600 mx-1">|</span> {formattedTime}
                                        </p>
                                    </div>

                                    {/* Encouraging message */}
                                    <div className="space-y-4 pt-4">
                                        <p className="text-lg text-white">
                                            ¡Gracias por servir con amor y respeto! 🤗
                                        </p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Recuerda que cada alma tiene su eternidad.
                                        </p>
                                        <blockquote className="text-sm text-gray-500 italic leading-relaxed border-l-2 border-white/20 pl-4 text-center">
                                            "Pero Dios, que es rico en misericordia, por su gran amor con que nos amó, aun estando nosotros muertos en pecados, nos dio vida juntamente con Cristo (por gracia sois salvos),"
                                            <footer className="text-gray-600 not-italic mt-2">— Efesios 2:4-5</footer>
                                        </blockquote>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Datos de Contacto */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="text-center mb-8">
                                        <h3 className="text-xl font-bold text-white mb-2">¿A quién conociste?</h3>
                                        <p className="text-sm text-gray-400">Ingresa los datos de contacto de la persona</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="text-xs text-gray-400">Nombre completo</Label>
                                            <Input
                                                id="fullName"
                                                value={formData.fullName}
                                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                                                placeholder="Nombre y apellidos"
                                                className="bg-[#252525] border-white/10 text-white focus:border-white/20 text-center h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp" className="text-xs text-gray-400">WhatsApp / Teléfono</Label>
                                            <Input
                                                id="whatsapp"
                                                value={formData.whatsapp}
                                                onChange={handlePhoneChange}
                                                placeholder="+504 1234-5678"
                                                className="bg-[#252525] border-white/10 text-white focus:border-white/20 text-center h-12"
                                                maxLength={14} // +504 (5) + 8 digits + 1 dash = 14 chars
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs text-gray-400">Correo electrónico (opcional)</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                placeholder="correo@ejemplo.com"
                                                className="bg-[#252525] border-white/10 text-white focus:border-white/20 text-center h-12"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Decisión Espiritual */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="text-center mb-8">
                                        <h3 className="text-xl font-bold text-white mb-2">Decisión espiritual</h3>
                                        <p className="text-sm text-gray-400">¿Qué sucedió en este encuentro?</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-400">¿Aceptó a Jesús como su salvador?</Label>
                                            <Select value={formData.acceptedJesus} onValueChange={(v) => handleInputChange("acceptedJesus", v)}>
                                                <SelectTrigger className="bg-[#252525] border-white/10 text-white h-12 text-center justify-center">
                                                    <SelectValue placeholder="Seleccionar respuesta" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#252525] border-white/10 text-white">
                                                    <SelectItem value="Sí" className="focus:bg-white/10 focus:text-white justify-center">Sí, aceptó a Jesús 🙏</SelectItem>
                                                    <SelectItem value="No" className="focus:bg-white/10 focus:text-white justify-center">No, aún no</SelectItem>
                                                    <SelectItem value="Ya era creyente" className="focus:bg-white/10 focus:text-white justify-center">Ya era creyente</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reason" className="text-xs text-gray-400">Motivo de acercamiento</Label>
                                            <textarea
                                                id="reason"
                                                value={formData.reason}
                                                onChange={(e) => handleInputChange("reason", e.target.value)}
                                                placeholder="Oración, consejería, invitación..."
                                                className="w-full bg-[#252525] border border-white/10 text-white focus:border-white/20 rounded-md p-3 min-h-[100px] resize-none text-sm text-center"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Seguimiento */}
                            {currentStep === 4 && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="text-center mb-8">
                                        <h3 className="text-xl font-bold text-white mb-2">Seguimiento</h3>
                                        <p className="text-sm text-gray-400">Detalles finales del registro</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-400">¿Está de acuerdo con recibir seguimiento?</Label>
                                            <Select value={formData.agreedToFollowUp} onValueChange={(v) => handleInputChange("agreedToFollowUp", v)}>
                                                <SelectTrigger className="bg-[#252525] border-white/10 text-white h-12 text-center justify-center">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#252525] border-white/10 text-white">
                                                    <SelectItem value="Sí" className="focus:bg-white/10 focus:text-white justify-center">Sí, acepta seguimiento ✅</SelectItem>
                                                    <SelectItem value="No" className="focus:bg-white/10 focus:text-white justify-center">No, prefiere no ser contactado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="observations" className="text-xs text-gray-400">Observaciones (opcional)</Label>
                                            <textarea
                                                id="observations"
                                                value={formData.observations}
                                                onChange={(e) => handleInputChange("observations", e.target.value)}
                                                placeholder="Notas adicionales sobre la persona..."
                                                className="w-full bg-[#252525] border border-white/10 text-white focus:border-white/20 rounded-md p-3 min-h-[100px] resize-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/5">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-gray-500">
                            Paso {currentStep} de {STEPS.length}
                        </div>
                        <div className="flex items-center gap-2">
                            {currentStep > 1 && (
                                <Button
                                    variant="ghost"
                                    onClick={prevStep}
                                    className="text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    Atrás
                                </Button>
                            )}
                            {currentStep === 1 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    className="text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    Cancelar
                                </Button>
                            )}
                            {!isLastStep ? (
                                <Button
                                    onClick={nextStep}
                                    disabled={!canProceedToNextStep()}
                                    className="bg-[#313131] text-white border-[0.6px] border-white/50 hover:bg-[#3a3a3a] shadow-md transition-colors rounded-lg font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !canProceedToNextStep()}
                                    className="bg-[#313131] text-white border-[0.6px] border-white/50 hover:bg-[#3a3a3a] shadow-md transition-colors rounded-lg font-normal disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        "Registrar"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
