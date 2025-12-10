"use client";

import { X, Plus, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Event = {
    id: string;
    title: string;
    time?: string;
    type: "general" | "service" | "practice";
    users?: string[]; // user names
};

interface DayPopoverProps {
    date: Date;
    events: Event[];
    onClose: () => void;
    onAddEvent: () => void;
    position: { x: number; y: number };
}

export function DayPopover({ date, events, onClose, onAddEvent, position }: DayPopoverProps) {
    return (
        <div
            className="absolute z-50 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200"
            style={{ left: position.x, top: position.y }}
        >
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                <h3 className="font-display font-bold text-lg capitalize">
                    {format(date, "EEEE d", { locale: es })}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {events.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No hay actividades</p>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary/20 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        event.type === 'service' ? "bg-purple-500" :
                                            event.type === 'practice' ? "bg-blue-500" : "bg-gray-400"
                                    )} />
                                    <span className="font-semibold text-sm">{event.title}</span>
                                </div>
                                {event.time && (
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {event.time}
                                    </div>
                                )}
                            </div>

                            {event.users && event.users.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {event.users.map(u => (
                                        <span key={u} className="inline-flex items-center text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded-full text-gray-600">
                                            <User className="w-3 h-3 mr-1 opacity-50" />
                                            {u}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={onAddEvent}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                Agregar Actividad
            </button>
        </div>
    );
}
