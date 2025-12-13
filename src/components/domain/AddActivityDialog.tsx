"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createActivity } from "@/app/activities/actions";
import {
    Music, BookOpen, Heart, Globe, Users, Baby, Car, Coffee,
    DollarSign, Wrench, Video, Mic, Sun, Moon, Star, Calendar,
    CheckCircle, AlertCircle, HelpCircle, User, Zap, Shield, Crown,
    Palmtree, Megaphone, Laptop
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
    Music, BookOpen, Heart, Globe, Users, Baby, Car, Coffee,
    DollarSign, Wrench, Video, Mic, Sun, Moon, Star, Calendar,
    CheckCircle, AlertCircle, HelpCircle, User, Zap, Shield, Crown,
    Palmtree, Megaphone, Laptop
};

const COLORS = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
    "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
    "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
    "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500",
    "bg-rose-500", "bg-gray-500"
];

const STATUS_OPTS = [
    { value: "PENDING", label: "Pendiente", color: "text-amber-500" },
    { value: "DONE", label: "Terminado", color: "text-emerald-500" },
    { value: "CANCELLED", label: "Cancelado", color: "text-red-500" },
];

interface AddActivityDialogProps {
    users: any[];
    currentUser?: any;
}

export function AddActivityDialog({ users, currentUser }: AddActivityDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [responsibleId, setResponsibleId] = useState(currentUser?.id || "");
    const [status, setStatus] = useState("PENDING");

    // No defaults initially
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name || !responsibleId || !selectedColor || !selectedIcon) return;
        setIsSubmitting(true);
        try {
            // Note: Currently createActivity might not accept status if not updated in actions.ts type definition?
            // Assuming DB defaults to PENDING, but if we want to pass it, we need to update actions.ts or assume default.
            // For now, let's just pass what we have. If actions.ts doesn't take status, it will default to PENDING in DB.
            const res = await createActivity({
                name,
                description,
                icon: selectedIcon,
                color: selectedColor,
                responsibleId,
                // status // TODO: Add status to createActivity action if needed explicitly
            });
            if (res.success) {
                setOpen(false);
                setName("");
                setDescription("");
                setSelectedIcon(null);
                setSelectedColor(null);
                setStatus("PENDING");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const SelectedIconComp = selectedIcon ? (ICONS as any)[selectedIcon] : null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 px-4 py-2 rounded-lg border-[0.6px] border-white shadow-md transition-all duration-200 bg-[#313131] text-white hover:bg-[#3a3a3a] font-normal">
                    <span className="text-lg leading-none">+</span>
                    Crear actividad
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-white/10 text-white gap-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-display">Nueva Actividad</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Define una nueva responsabilidad o área de servicio.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] -mr-4 pr-4">
                    <div className="grid gap-6 pr-2">
                        {/* Icon & Name Row */}
                        <div className="flex gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex flex-col items-center gap-2 cursor-pointer group">
                                        <button className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 border-2",
                                            selectedColor
                                                ? cn(selectedColor, "border-transparent text-white shadow-lg")
                                                : "bg-[#252525] border-white/20 text-gray-400 hover:border-white/50 hover:text-white"
                                        )}>
                                            {selectedIcon && SelectedIconComp ? (
                                                <SelectedIconComp className="w-6 h-6" />
                                            ) : (
                                                <span className="text-2xl font-light">+</span>
                                            )}
                                        </button>
                                        <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors">
                                            {selectedIcon ? "Cambiar" : "Añadir ícono"}
                                        </span>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[320px] bg-[#252525] border-white/10 p-4" align="start">
                                    <div className="space-y-4">
                                        {/* Color Grid */}
                                        <div>
                                            <Label className="text-xs text-gray-400 mb-2 block">Color</Label>
                                            <div className="grid grid-cols-9 gap-2">
                                                {COLORS.map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setSelectedColor(color)}
                                                        className={cn(
                                                            "w-6 h-6 rounded-full transition-transform hover:scale-110 border border-transparent",
                                                            color,
                                                            selectedColor === color && "ring-2 ring-white ring-offset-2 ring-offset-[#252525]"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Icon Grid */}
                                        <div>
                                            <Label className="text-xs text-gray-400 mb-2 block">Ícono</Label>
                                            <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                                {Object.keys(ICONS).map(iconName => {
                                                    const Icon = (ICONS as any)[iconName];
                                                    return (
                                                        <button
                                                            key={iconName}
                                                            onClick={() => setSelectedIcon(iconName)}
                                                            className={cn(
                                                                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors border border-transparent",
                                                                selectedIcon === iconName
                                                                    ? "bg-white/10 border-white/20 text-white"
                                                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                            )}
                                                        >
                                                            <Icon className="w-5 h-5" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs text-gray-400">Nombre de la actividad</Label>
                                    <Input
                                        id="title"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nombre de la actividad"
                                        className="bg-[#252525] border-white/10 text-white focus:border-amber-500/50"
                                    />
                                </div>


                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="desc" className="text-xs text-gray-400">Descripción</Label>
                            <RichTextEditor
                                value={description}
                                onChange={setDescription}
                                placeholder="Describe las responsabilidades..."
                                className="focus-within:border-amber-500/50"
                            />
                        </div>

                        {/* Responsible & Status Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Responsable</Label>
                                <Select value={responsibleId} onValueChange={setResponsibleId}>
                                    <SelectTrigger className="bg-[#252525] border-white/10 text-white h-10">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#252525] border-white/10 text-white max-h-[200px]">
                                        {users.map(user => (
                                            <SelectItem key={user.id} value={user.id} className="focus:bg-white/10 focus:text-white">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={user.image} />
                                                        <AvatarFallback className="text-[9px] bg-gray-600">
                                                            {user.name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="truncate max-w-[120px]">{user.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Estado inicial</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-[#252525] border-white/10 text-white h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#252525] border-white/10 text-white">
                                        {STATUS_OPTS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="focus:bg-white/10 focus:text-white">
                                                <span className={opt.color}>{opt.label}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !name || !selectedColor || !selectedIcon}
                        className="bg-[#313131] text-white border-[0.6px] border-white/50 hover:bg-[#3a3a3a] shadow-md transition-colors rounded-lg font-normal"
                    >
                        {isSubmitting ? "Guardando..." : "Crear Actividad"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
