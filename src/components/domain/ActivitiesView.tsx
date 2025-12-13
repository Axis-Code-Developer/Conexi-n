"use client";

import { useState } from "react";
import { AddActivityDialog } from "@/components/domain/AddActivityDialog";
import { AddActivityUpdateDialog } from "@/components/domain/AddActivityUpdateDialog";
import { updateActivityStatus, deleteActivity } from "@/app/activities/actions";
import { cn } from "@/lib/utils";
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
    Music, BookOpen, Heart, Globe, Users, Baby, Car, Coffee,
    DollarSign, Wrench, Video, Mic, Sun, Moon, Star, Calendar,
    CheckCircle, AlertCircle, HelpCircle, User, Zap, Shield, Crown,
    Palmtree, Megaphone, Laptop, ChevronLeft, ChevronRight, Trash2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const ICONS: any = {
    Music, BookOpen, Heart, Globe, Users, Baby, Car, Coffee,
    DollarSign, Wrench, Video, Mic, Sun, Moon, Star, Calendar,
    CheckCircle, AlertCircle, HelpCircle, User, Zap, Shield, Crown,
    Palmtree, Megaphone, Laptop
};

const STATUS_CONFIG = {
    PENDING: {
        label: "Pendiente",
        icon: HelpCircle,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10"
    },
    DONE: {
        label: "Terminado",
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

interface ActivitiesViewProps {
    users: any[];
    activities: any[];
    currentUser?: any;
}

export function ActivitiesView({ users, activities, currentUser }: ActivitiesViewProps) {
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);

    const paginatedActivities = activities.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handleStatusChange = async (activityId: string, newStatus: string) => {
        await updateActivityStatus(activityId, newStatus as "PENDING" | "DONE" | "CANCELLED");
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Actividades</h1>
                    <p className="text-gray-400">Gestión de áreas de responsabilidad</p>
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
                    <AddActivityDialog users={users} currentUser={currentUser} />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">

                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4 shadow-xl shadow-black/20">
                            <img src="/icons/Files/file-heart-02.svg" alt="No activities" className="w-8 h-8 opacity-60 invert" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Sin actividades</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                            No hay áreas de responsabilidad activas en este momento.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {paginatedActivities.map(activity => {
                            const Icon = (ICONS as any)[activity.icon] || Star;

                            // Status Logic
                            const statusConfig = STATUS_CONFIG[activity.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                            const StatusIcon = statusConfig.icon;

                            const responsible = activity.responsible || { name: "Sin asignar", image: null };
                            const dateObj = new Date(activity.createdAt);
                            const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={activity.id} className="group relative">
                                    {/* Row 1: Avatar + Name + Date|Time + Status */}
                                    <div className="flex items-center justify-between pb-2 border-b border-white/5 group-hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-6 h-6 border border-white/10">
                                                <AvatarImage src={responsible.image} />
                                                <AvatarFallback className="text-[10px] bg-gray-700 text-gray-300">
                                                    {responsible.name?.substring(0, 2).toUpperCase() || "??"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-200">
                                                    {responsible.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {dateStr} <span className="text-gray-600 mx-1">|</span> {timeStr}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="hidden sm:block h-[1px] w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                            {/* Status Select */}
                                            <Select
                                                value={activity.status}
                                                onValueChange={(value) => handleStatusChange(activity.id, value)}
                                            >
                                                <SelectTrigger className="bg-[#252525] border-white/10 text-white h-9 w-[140px]">
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
                                                                    <Icon className={cn("w-4 h-4", config.color)} />
                                                                    <span className={config.color}>{config.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button className="text-gray-500 hover:text-red-500 transition-colors p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-gray-400">
                                                            Esta acción no se puede deshacer. Se eliminará permanentemente la actividad y todos sus avances.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-transparent text-white hover:bg-white/10 border-white/10">Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => deleteActivity(activity.id)}
                                                            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-border/10 border"
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    {/* Row 2: Indented Content */}
                                    <div className="flex mt-3 pl-3">

                                        <div className="flex-1 pb-2">
                                            <div className="flex items-start gap-3 mb-2">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                                                        activity.color
                                                    )}>
                                                        <Icon className="w-3.5 h-3.5 text-white" />
                                                    </div>

                                                    {/* Add Update Button */}
                                                    <AddActivityUpdateDialog
                                                        activityId={activity.id}
                                                        activityName={activity.name}
                                                        currentUser={currentUser}
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <span className="text-base font-semibold text-white block mb-1">
                                                        {activity.name}
                                                    </span>

                                                    {/* Description rendered as HTML if possible, or just text */}
                                                    {activity.description && (
                                                        <div
                                                            className="text-sm text-gray-400 leading-relaxed max-w-2xl rich-text-content"
                                                            dangerouslySetInnerHTML={{ __html: activity.description }}
                                                        />
                                                    )}

                                                    {/* Updates List */}
                                                    {activity.updates && activity.updates.length > 0 && (
                                                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-white/5">
                                                            {activity.updates.map((update: any) => {
                                                                const updateDate = new Date(update.createdAt);
                                                                const updateDateStr = updateDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                                const updateTimeStr = updateDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                                                                return (
                                                                    <div key={update.id} className="relative">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-sm font-medium text-gray-300">
                                                                                {update.title}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">
                                                                                {updateDateStr} <span className="text-gray-600 mx-1">|</span> {updateTimeStr}
                                                                            </span>
                                                                        </div>
                                                                        <div
                                                                            className="text-sm text-gray-400 rich-text-content"
                                                                            dangerouslySetInnerHTML={{ __html: update.content }}
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
}
