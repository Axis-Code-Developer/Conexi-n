"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ChevronLeft, ChevronRight, Trash2, HelpCircle, CheckCircle, AlertCircle, ClipboardList, Phone, Mail
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { AddFollowUpDialog } from "@/components/domain/AddFollowUpDialog";
import { deleteFollowUp, updateFollowUpStatus } from "@/app/(dashboard)/follow-up/actions";
import { toast } from "sonner"; // Assuming sonner

const STATUS_CONFIG = {
    PENDING: {
        label: "Pendiente",
        icon: HelpCircle,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10"
    },
    DONE: {
        label: "Completado",
        icon: CheckCircle,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10"
    },
    CANCELLED: {
        label: "Cancelado",
        icon: AlertCircle,
        color: "text-red-500",
        bgColor: "bg-red-500/10"
    },
};

interface FollowUpViewProps {
    initialFollowUps: any[];
}

export function FollowUpView({ initialFollowUps }: FollowUpViewProps) {
    const [page, setPage] = useState(1);
    const [followUps, setFollowUps] = useState(initialFollowUps);

    // Sync state if initial props change (e.g. revalidation)
    // Actually simplicity: just prioritize props if we don't need optimistic local state for everything, 
    // but better to just use the prop directly if the parent revalidates
    const dataToDisplay = initialFollowUps;

    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(dataToDisplay.length / ITEMS_PER_PAGE);

    const paginatedFollowUps = dataToDisplay.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handleDelete = async (id: string) => {
        const res = await deleteFollowUp(id);
        if (res.success) {
            // Toast success
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        await updateFollowUpStatus(id, newStatus);
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Asimilación</h1>
                    <p className="text-gray-400">Seguimiento de nuevos creyentes</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1 bg-[#252525] rounded-md p-1 border border-white/10">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                            <span className="text-xs text-gray-400 min-w-[30px] text-center">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    )}

                    <AddFollowUpDialog />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {dataToDisplay.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4 shadow-xl shadow-black/20">
                            <Image
                                src="/icons/General/heart.svg"
                                alt="Sin registros"
                                width={32}
                                height={32}
                                className="opacity-60 invert"
                            />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Sin registros de asimilación</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                            No hay personas en proceso de asimilación en este momento.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {paginatedFollowUps.map(followUp => {
                            const statusConfig = STATUS_CONFIG[followUp.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                            // const StatusIcon = statusConfig.icon;

                            const dateObj = new Date(followUp.date);
                            const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            // Using createdAt for the time record if user didn't specify time? 
                            // Or assuming date has time? The dialog sets date-only string to state, but passed as Date object.
                            // The Prisma model has 'date'.

                            return (
                                <div key={followUp.id} className="group relative bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all duration-300">
                                    {/* Row 1: Evangelizer Info & Status */}
                                    <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">Atendido por</span>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-5 h-5 border border-white/10">
                                                        <AvatarFallback className="text-[9px] bg-gray-700 text-gray-300">
                                                            {followUp.evangelizer?.substring(0, 2).toUpperCase() || "??"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium text-gray-300">
                                                        {followUp.evangelizer}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                {dateStr}
                                            </span>

                                            <div className="h-4 w-[1px] bg-white/10" />

                                            {/* Status Select */}
                                            <Select
                                                value={followUp.status}
                                                onValueChange={(value) => handleStatusChange(followUp.id, value)}
                                            >
                                                <SelectTrigger className="bg-[#252525] border-white/10 text-white h-7 text-xs w-[130px] shadow-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#252525] border-white/10 text-white">
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                                                        const Icon = config.icon;
                                                        return (
                                                            <SelectItem
                                                                key={key}
                                                                value={key}
                                                                className="focus:bg-white/10 focus:text-white cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Icon className={cn("w-3 h-3", config.color)} />
                                                                    <span className={config.color}>{config.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button className="text-gray-500 hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded-md">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-gray-400">
                                                            Esta acción eliminará permanentemente a <span className="text-white font-medium">{followUp.fullName}</span> del sistema.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-transparent text-white hover:bg-white/10 border-white/10">Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(followUp.id)}
                                                            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-border/10 border"
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    {/* Main Content: Info Person + Reason */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left: Personal Data */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                                                <span className="text-lg font-semibold text-white">
                                                    {followUp.fullName.substring(0, 1).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white leading-tight mb-1">
                                                    {followUp.fullName}
                                                </h3>
                                                <div className="flex flex-col gap-1 text-sm text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3 opacity-70" />
                                                        <span>{followUp.whatsapp}</span>
                                                        <a href={`https://wa.me/${followUp.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-500 hover:underline ml-1">
                                                            (Chat)
                                                        </a>
                                                    </div>
                                                    {followUp.email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3 h-3 opacity-70" />
                                                            <span>{followUp.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Spiritual Data */}
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-sm">
                                            <div className="grid grid-cols-2 gap-y-2 mb-2">
                                                <div className="text-gray-500">Aceptó a Jesús</div>
                                                <div className="text-gray-200 font-medium">{followUp.acceptedJesus}</div>

                                                <div className="text-gray-500">Seguimiento</div>
                                                <div className="text-gray-200 font-medium">
                                                    {followUp.agreedToFollowUp === "Sí" ? (
                                                        <span className="text-green-400">Aceptado</span>
                                                    ) : (
                                                        <span className="text-gray-400">Rechazado</span>
                                                    )}
                                                </div>
                                            </div>

                                            {followUp.reason && (
                                                <div className="mt-3 pt-3 border-t border-white/5">
                                                    <p className="text-gray-500 text-xs mb-1">Motivo / Notas</p>
                                                    <p className="text-gray-300 italic">"{followUp.reason}"</p>
                                                </div>
                                            )}

                                            {followUp.observations && (
                                                <div className="mt-2 text-xs text-amber-500/80">
                                                    <span className="font-bold">Obs:</span> {followUp.observations}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
