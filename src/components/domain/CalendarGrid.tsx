"use client";

import { useState, useEffect, useCallback } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday
} from "date-fns";
import { es } from "date-fns/locale";
import {
    ChevronLeft, ChevronRight, Plus, X, User, Check, ChevronsUpDown,
    Circle, Waves, MapPin, Users, Star, BookOpen, Smile, Ban, ShieldAlert,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverClose
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EVENT_TYPES, SUPERVISORS, STAFF_MEMBERS } from "@/lib/constants";
import { getEvents, createEvent, updateEvent, getAllUsers, deleteEvent, getCurrentUser } from "@/app/calendar/actions";
import Image from "next/image";

const ICON_MAP: any = {
    Circle, Waves, MapPin, Users, Star, BookOpen, Smile, Ban
};

// Types
type Event = {
    id: string;
    title: string;
    date: Date;
    time?: string;
    type: string;
    supervisorId?: string | null;
    staffName?: string | null;
    supervisorName?: string | null; // Added
    assignments?: { user: { id: string; name: string; isStaff?: boolean; image?: string | null } }[];
    supervisor?: { name: string } | null;
};

type CalendarUser = {
    id: string;
    name: string;
    image: string | null;
    isStaff?: boolean;
    supervisorName?: string | null;
    staffName?: string | null;
};

interface CalendarGridProps {
    className?: string;
}

export function CalendarGrid({ className }: CalendarGridProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [users, setUsers] = useState<CalendarUser[]>([]);
    const [currentUser, setCurrentUser] = useState<CalendarUser | null>(null);

    // Form States (Shared for Create and Edit)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [eventType, setEventType] = useState<string>("");
    const [supervisor, setSupervisor] = useState<string>("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [staffUser, setStaffUser] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openMemberSelect, setOpenMemberSelect] = useState(false);
    const [exceptionMode, setExceptionMode] = useState(false);

    // Edit State
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Delete State
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Conflict State
    const [conflictData, setConflictData] = useState<{
        type: 'supervisor' | 'staff';
        value: string;
        conflictingMembers: string[];
    } | null>(null);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const loadEvents = useCallback(async () => {
        const res = await getEvents(currentMonth);
        if (res.success && res.events) {
            setEvents(res.events as any);
        }
    }, [currentMonth]);

    const loadUsers = useCallback(async () => {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
    }, []);

    const fetchCurrentUser = useCallback(async () => {
        const user = await getCurrentUser();
        if (user) setCurrentUser(user);
    }, []);

    useEffect(() => {
        loadEvents();
        loadUsers();
        fetchCurrentUser();
    }, [loadEvents, loadUsers, fetchCurrentUser]);

    // Initialize form for editing
    const initializeEditForm = (event: Event) => {
        setEditingEventId(event.id);
        setSelectedDate(new Date(event.date));
        setEventType(event.type);
        // Use supervisorName (string) if available, otherwise supervisor relation name
        setSupervisor(event.supervisorName || event.supervisor?.name || "");
        setStaffUser(event.staffName || "");
        setSelectedMembers(event.assignments?.map(a => a.user.id) || []);
    };

    // Reset form
    const resetForm = () => {
        setEventType("");
        setSupervisor("");
        setStaffUser("");
        setSelectedMembers([]);
        setEditingEventId(null);
        setExceptionMode(false);
        setConflictData(null); // Clear conflict data on form reset
    };

    const handleAddEvent = async () => {
        if (!selectedDate) return;
        setIsSubmitting(true);

        try {
            const finalType = eventType || "CHURCH_MEETING_VISTA_AL_MAR";
            const title = (EVENT_TYPES as any)[finalType]?.label || "Evento";

            const res = await createEvent({
                title,
                date: selectedDate,
                type: finalType,
                supervisorId: supervisor,
                staffName: staffUser,
                memberIds: selectedMembers
            });

            if (res.success) {
                await loadEvents();
                resetForm(); // This will effectively close the controlled popover
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateEvent = async () => {
        if (!selectedDate || !editingEventId) return;
        setIsSubmitting(true);

        try {
            const finalType = eventType || "CHURCH_MEETING_VISTA_AL_MAR";
            const title = (EVENT_TYPES as any)[finalType]?.label || "Evento";

            const res = await updateEvent(editingEventId, {
                title,
                type: finalType,
                supervisorId: supervisor,
                staffName: staffUser,
                memberIds: selectedMembers
            });

            if (res.success) {
                await loadEvents();
                resetForm(); // This will effectively close the controlled popover
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteEvent(eventToDelete);
            if (res.success) {
                await loadEvents();
                setEventToDelete(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleMember = (userId: string) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    const handleSupervisorChange = (value: string) => {
        if (exceptionMode) {
            setSupervisor(value);
            return;
        }

        // Check if any selected members have this supervisor assigned to them
        const conflictingMembers = users
            .filter(u => selectedMembers.includes(u.id) && u.supervisorName === value)
            .map(u => u.id);

        if (conflictingMembers.length > 0) {
            setConflictData({ type: 'supervisor', value, conflictingMembers });
            // Don't set the supervisor yet - wait for user decision
        } else {
            setSupervisor(value);
        }
    };

    const handleStaffChange = (value: string) => {
        if (exceptionMode) {
            setStaffUser(value);
            return;
        }

        // Check if any selected members have this staff assigned to them
        const conflictingMembers = users
            .filter(u => selectedMembers.includes(u.id) && u.staffName === value)
            .map(u => u.id);

        if (conflictingMembers.length > 0) {
            setConflictData({ type: 'staff', value, conflictingMembers });
            // Don't set the staff yet - wait for user decision
        } else {
            setStaffUser(value);
        }
    };

    const resolveConflict = (action: 'remove' | 'exception') => {
        if (!conflictData) return;

        if (action === 'exception') {
            setExceptionMode(true);
            if (conflictData.type === 'supervisor') setSupervisor(conflictData.value);
            else setStaffUser(conflictData.value);
        } else {
            // Remove conflicting members
            setSelectedMembers(prev => prev.filter(id => !conflictData.conflictingMembers.includes(id)));
            if (conflictData.type === 'supervisor') setSupervisor(conflictData.value);
            else setStaffUser(conflictData.value);
        }
        setConflictData(null);
    };

    const renderEventForm = (isEdit: boolean) => (
        <div className="p-4 space-y-4">
            <div className="space-y-2">
                <Label className="text-xs text-gray-400">Tipo de Evento</Label>
                <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="h-9 bg-[#313131]/50 border-white/10 text-xs text-white">
                        <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent className="z-[200] bg-[#313131] border-white/10 text-white">
                        {Object.entries(EVENT_TYPES).map(([key, value]: any) => {
                            const Icon = ICON_MAP[value.iconName];
                            return (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="text-xs focus:bg-white/10 focus:text-white cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        {value.icon ? (
                                            <Image src={value.icon} alt="" width={16} height={16} className="w-4 h-4 brightness-0 invert opacity-70" />
                                        ) : Icon ? (
                                            <Icon className="w-4 h-4" />
                                        ) : null}
                                        <span>{value.label}</span>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-gray-400">Supervisor</Label>
                <Select value={supervisor} onValueChange={handleSupervisorChange}>
                    <SelectTrigger className="h-8 bg-[#313131]/50 border-white/10 text-xs text-white">
                        <SelectValue placeholder="Asignar supervisor" />
                    </SelectTrigger>
                    <SelectContent className="z-[200] bg-[#313131] border-white/10 text-white">
                        {SUPERVISORS.map((sup) => (
                            <SelectItem key={sup} value={sup} className="text-xs focus:bg-white/10 focus:text-white">
                                {sup}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-gray-400">Staff</Label>
                <Select value={staffUser} onValueChange={handleStaffChange}>
                    <SelectTrigger className="h-8 bg-[#313131]/50 border-white/10 text-xs text-white">
                        <SelectValue placeholder="Seleccionar Staff" />
                    </SelectTrigger>
                    <SelectContent className="z-[200] bg-[#313131] border-white/10 text-white">
                        {STAFF_MEMBERS.map((staffName) => (
                            <SelectItem key={staffName} value={staffName} className="text-xs focus:bg-white/10 focus:text-white">
                                {staffName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs text-gray-400">Miembros</Label>
                    <button
                        type="button"
                        onClick={() => setExceptionMode(!exceptionMode)}
                        className={cn(
                            "p-1 rounded transition-colors",
                            exceptionMode ? "bg-amber-500/20 text-amber-400" : "text-gray-500 hover:text-amber-400"
                        )}
                        title={exceptionMode ? "Modo excepción activado" : "Activar modo excepción"}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                    </button>
                </div>
                <Popover open={openMemberSelect} onOpenChange={setOpenMemberSelect}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openMemberSelect} className="w-full justify-between h-8 bg-[#313131]/50 border-white/10 text-xs font-normal text-white hover:bg-white/5 hover:text-white">
                            {selectedMembers.length > 0 ? `${selectedMembers.length} seleccionados` : "Seleccionar miembros"}
                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0 z-[200] bg-[#313131] border-white/10 text-white">
                        <Command className="bg-[#313131] text-white">
                            <CommandInput placeholder="Buscar miembro..." className="h-8 text-xs border-b border-white/10" />
                            <CommandList>
                                <CommandEmpty>No encontrado.</CommandEmpty>
                                <CommandGroup>
                                    {users
                                        .filter(user => {
                                            if (exceptionMode) return true;
                                            // Fix: Check if user IS the supervisor (name match), not if they HAVE the supervisor
                                            if (supervisor && user.name === supervisor) return false;
                                            if (staffUser && user.staffName === staffUser) return false;
                                            return true;
                                        })
                                        .map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={user.name}
                                                onSelect={() => toggleMember(user.id)}
                                                className="text-xs aria-selected:bg-white/10 aria-selected:text-white"
                                            >
                                                <Check className={cn("mr-2 h-3 w-3", selectedMembers.includes(user.id) ? "opacity-100" : "opacity-0")} />
                                                {user.name}
                                                {user.isStaff && <ShieldAlert className="ml-2 w-3 h-3 text-red-500" />}
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <Button
                onClick={isEdit ? handleUpdateEvent : handleAddEvent}
                disabled={isSubmitting}
                className="w-full h-8 text-xs font-medium bg-white text-black hover:bg-gray-200"
            >
                {isSubmitting ? "Guardando..." : (isEdit ? "Actualizar Actividad" : "Guardar Actividad")}
            </Button>
        </div>
    );

    return (
        <div className="bg-[#252525] rounded-2xl shadow-lg border-[0.6px] border-white/20 overflow-hidden h-full flex flex-col relative">
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-[#2a2a2a]">
                <h2 className="text-2xl font-display font-semibold text-white capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-white/20 bg-[#2a2a2a]">
                {weekDays.map((day) => (
                    <div key={day} className="py-2 text-center text-sm font-medium text-gray-400 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>

            <div className="overflow-auto flex-1">
                <div className="grid grid-cols-7 bg-[#1a1a1a] gap-[1px] min-h-full">
                    {days.map((day) => {
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
                        // Use supervisorName or supervisor relation name
                        const supervisors = Array.from(new Set(dayEvents.map(e => e.supervisorName || e.supervisor?.name).filter(Boolean)));

                        return (
                            <Popover key={day.toString()} onOpenChange={(open) => {
                                if (open) {
                                    setSelectedDate(day);
                                    resetForm(); // Clear form for new event
                                }
                            }}>
                                {/* Removed hover effects from wrapper to fix double hover flash */}
                                <div
                                    className={cn(
                                        "bg-[#313131] p-2 min-h-[120px] flex flex-col gap-1 transition-colors relative group border border-white/5 cursor-pointer",
                                        !isCurrentMonth && "bg-[#252525] text-gray-500",
                                    )}
                                >
                                    <PopoverTrigger asChild>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-sm w-7 h-7 flex items-center justify-center rounded-lg font-medium transition-colors",
                                                    isToday(day)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-gray-300"
                                                )}>
                                                    {format(day, dateFormat)}
                                                </span>
                                                {supervisors.length > 0 && (
                                                    <div className="flex flex-col">
                                                        {supervisors.slice(0, 2).map((sup: any) => (
                                                            <span key={sup} className="text-[9px] text-gray-400 bg-white/5 px-1 rounded-sm truncate max-w-[60px]">
                                                                {sup}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg">
                                                <Plus className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </PopoverTrigger>

                                    {/* Events List on Day Cell */}
                                    <div className="flex flex-col gap-2 mt-1 overflow-visible z-10">
                                        {dayEvents.slice(0, 3).map(event => {
                                            const style = (EVENT_TYPES as any)[event.type] || EVENT_TYPES.CHURCH_MEETING_VISTA_AL_MAR;
                                            const IconComp = style.icon ? null : ICON_MAP[style.iconName];

                                            return (
                                                <div key={event.id} className="flex flex-col gap-1">
                                                    {/* Edit Event Popover - CONTROLLED */}
                                                    <Popover
                                                        open={editingEventId === event.id}
                                                        onOpenChange={(open) => {
                                                            if (open) initializeEditForm(event);
                                                            else setEditingEventId(null);
                                                        }}
                                                    >
                                                        <PopoverTrigger asChild onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Explicitly set open state here to be sure, although onOpenChange handles it?
                                                            // Actually Trigger automatically toggles, but since we control 'open', we rely on onOpenChange being called.
                                                            // But let's call initialize directly to be safe.
                                                            initializeEditForm(event);
                                                        }}>
                                                            <div className={cn(
                                                                "text-[10px] truncate px-1.5 py-1 rounded border flex items-center gap-1 cursor-pointer hover:brightness-125 transition-all shadow-sm",
                                                                style.softBg || "bg-gray-500/20",
                                                                style.textColor || "text-gray-300",
                                                                style.borderColor || "border-transparent"
                                                            )}>
                                                                {style.icon ? (
                                                                    <Image src={style.icon} alt="icon" width={10} height={10} className="w-3 h-3 brightness-0 invert opacity-80" />
                                                                ) : (
                                                                    IconComp && <IconComp className="w-3 h-3 opacity-90" />
                                                                )}
                                                                <span className="font-medium">{event.title}</span>
                                                            </div>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            side="right"
                                                            align="start"
                                                            className={cn(
                                                                "w-[320px] text-white p-0 overflow-hidden rounded-xl z-[50] border shadow-2xl backdrop-blur-3xl",
                                                                style.softBg ? style.softBg.replace("/40", "/90") : "bg-[#2a2a2a]",
                                                                style.borderColor || "border-white/20"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/10">
                                                                <h3 className="font-display font-bold text-lg text-white">Editar Actividad</h3>
                                                                <PopoverClose className="text-white/70 hover:text-white" onClick={() => setEditingEventId(null)}>
                                                                    <X className="w-5 h-5" />
                                                                </PopoverClose>
                                                            </div>
                                                            {renderEventForm(true)}
                                                        </PopoverContent>
                                                    </Popover>

                                                    {/* Member Avatars */}
                                                    {event.assignments && event.assignments.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 px-1" onClick={(e) => e.stopPropagation()}>
                                                            <TooltipProvider>
                                                                {event.assignments.slice(0, 5).map((assignment) => (
                                                                    <Tooltip key={assignment.user.id}>
                                                                        <TooltipTrigger asChild>
                                                                            <Avatar className={cn(
                                                                                "w-5 h-5 border-[1.5px] border-[#313131] transition-transform hover:z-10 hover:scale-110",
                                                                                currentUser?.id === assignment.user.id && "ring-2 ring-amber-400 ring-offset-1 ring-offset-[#313131]"
                                                                            )}>
                                                                                <AvatarImage src={assignment.user.image || undefined} />
                                                                                <AvatarFallback className="text-[8px] bg-gray-600 text-white">
                                                                                    {assignment.user.name.substring(0, 2).toUpperCase()}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className="bg-black/90 text-white text-xs border-white/10">
                                                                            <p>{assignment.user.name}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                ))}
                                                            </TooltipProvider>
                                                            {event.assignments.length > 5 && (
                                                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-700 text-[8px] text-white border-[1.5px] border-[#313131]">
                                                                    +{event.assignments.length - 5}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {dayEvents.length > 3 && (
                                            <span className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 3} más</span>
                                        )}
                                    </div>
                                </div>


                                <PopoverContent side="right" align="start" sideOffset={8} className="w-[320px] bg-[#2a2a2a] border-white/20 text-white p-0 overflow-hidden rounded-xl z-[40]">
                                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                                        <h3 className="font-display font-bold text-lg capitalize text-white">
                                            {format(day, "EEEE d", { locale: es })}
                                        </h3>
                                        <PopoverClose className="text-gray-400 hover:text-gray-300 transition-colors">
                                            <X className="w-5 h-5" />
                                        </PopoverClose>
                                    </div>

                                    <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {dayEvents.length === 0 ? (
                                            <p className="text-gray-400 text-sm text-center py-2">No hay actividades</p>
                                        ) : (
                                            dayEvents.map((event) => {
                                                const style = (EVENT_TYPES as any)[event.type] || EVENT_TYPES.CHURCH_MEETING_VISTA_AL_MAR;
                                                const IconComp = style.icon ? null : ICON_MAP[style.iconName];

                                                return (
                                                    <div key={event.id} className={cn(
                                                        "p-3 rounded-lg border flex flex-col gap-2 shadow-sm relative group/item",
                                                        style.softBg,
                                                        style.borderColor
                                                    )}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEventToDelete(event.id);
                                                            }}
                                                            className="absolute top-2 right-2 text-white/40 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>

                                                        {/* Header */}
                                                        <div className="flex items-start gap-3 pr-6">
                                                            <div className={cn("mt-0.5 shrink-0", style.textColor)}>
                                                                {style.icon ? (
                                                                    <Image src={style.icon} alt="i" width={18} height={18} className="w-4.5 h-4.5 brightness-0 invert" />
                                                                ) : (
                                                                    IconComp && <IconComp className="w-4.5 h-4.5" />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <span className={cn("font-bold text-sm leading-tight", style.textColor)}>
                                                                    {event.title}
                                                                </span>
                                                                {event.supervisor && (
                                                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                                        <span className="opacity-70">Sup:</span> {event.supervisor.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Members/Avatars in Detail View */}
                                                        {(event.assignments && event.assignments.length > 0) && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {event.assignments.map((a: any) => (
                                                                    <TooltipProvider key={a.id}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Avatar className={cn(
                                                                                    "w-6 h-6 border border-white/10",
                                                                                    currentUser?.id === a.user.id && "ring-2 ring-primary ring-offset-1 ring-offset-[#2a2a2a]"
                                                                                )}>
                                                                                    <AvatarImage src={a.user.image} />
                                                                                    <AvatarFallback className="text-[9px] bg-gray-700 text-white">
                                                                                        {a.user.name.substring(0, 2).toUpperCase()}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="bg-black/90 text-white text-xs border-white/10">
                                                                                <p>{a.user.name}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {renderEventForm(false)}
                                </PopoverContent>
                            </Popover>
                        );
                    })}
                </div>
            </div>

            <AlertDialog open={!!conflictData} onOpenChange={() => setConflictData(null)}>
                <AlertDialogContent className="bg-[#252525] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Conflicto de Servicio detectado</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Algunos de los miembros seleccionados tienen un rol de servicio asignado que entra en conflicto con el {conflictData?.type === 'supervisor' ? 'Supervisor' : 'Staff'} seleccionado: <strong>{conflictData?.value}</strong>.
                            <br /><br />
                            ¿Qué deseas hacer?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:gap-0">
                        <div className="flex flex-col sm:flex-row gap-2 w-full justify-end">
                            <AlertDialogCancel
                                onClick={() => resolveConflict('remove')}
                                className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:text-red-400"
                            >
                                Remover conflictos
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => resolveConflict('exception')}
                                className="bg-[#313131] text-white border-[0.6px] border-white/50 hover:bg-[#3a3a3a] shadow-md transition-colors rounded-lg font-normal"
                            >
                                Activar Modo Excepción
                            </AlertDialogAction>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
                <AlertDialogContent className="bg-[#252525] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Esta acción no se puede deshacer. La actividad será eliminada permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-500 text-white hover:bg-red-600"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
