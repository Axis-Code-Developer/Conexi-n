"use client";

import { useState, useRef, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayPopover } from "./DayPopover";

// Mock data types and initial data
type Event = {
    id: string;
    title: string;
    date: Date;
    time?: string;
    type: "general" | "service" | "practice";
    users?: string[];
};

const MOCK_EVENTS: Event[] = [
    { id: "1", title: "Servicio Dominical", date: new Date(), time: "10:00 AM", type: "service", users: ["Juan", "Maria"] },
    { id: "2", title: "Ensayo General", date: new Date(), time: "07:00 PM", type: "practice", users: ["Pedro"] }
];

export function CalendarGrid() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
    const [popover, setPopover] = useState<{ date: Date; x: number; y: number } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const handleDayClick = (day: Date, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent closing immediately logic if implemented on container
        const isRightHalf = e.clientX > window.innerWidth / 2;
        // Simple positioning logic relative to click or fixed offset
        // Ideally we use a library like floating-ui, but custom logic:
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = isRightHalf ? rect.left - 330 : rect.right + 10; // Popover width approx 320
        const y = Math.min(rect.top, window.innerHeight - 400); // Prevent overflow bottom

        setPopover(popover?.date.getTime() === day.getTime() ? null : { date: day, x, y });
    };

    const closePopover = () => setPopover(null);

    const addEvent = () => {
        if (!popover) return;
        const newEvent: Event = {
            id: Math.random().toString(),
            title: "Nueva Actividad",
            date: popover.date,
            type: "general"
        };
        setEvents([...events, newEvent]);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col relative" ref={containerRef} onClick={closePopover}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-2xl font-display font-semibold text-foreground capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); prevMonth(); }} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextMonth(); }} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                {weekDays.map((day) => (
                    <div key={day} className="py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-100 gap-[1px]">
                {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const dayEvents = events.filter(e => isSameDay(e.date, day));

                    return (
                        <div
                            key={day.toString()}
                            onClick={(e) => handleDayClick(day, e)}
                            className={cn(
                                "bg-white p-2 min-h-[100px] flex flex-col gap-1 transition-colors hover:bg-gray-50 cursor-pointer relative group",
                                !isCurrentMonth && "bg-gray-50/30 text-gray-400",
                                popover?.date.getTime() === day.getTime() && "bg-blue-50/50"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium transition-colors",
                                    isToday(day)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700"
                                )}>
                                    {format(day, dateFormat)}
                                </span>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full">
                                    <Plus className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>

                            {/* Events Preview (Chips) */}
                            <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                                {dayEvents.slice(0, 3).map(event => (
                                    <div key={event.id} className={cn(
                                        "text-[10px] truncate px-1.5 py-0.5 rounded border border-transparent",
                                        event.type === 'service' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                            event.type === 'practice' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                "bg-gray-100 text-gray-600"
                                    )}>
                                        {event.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <span className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 3} más</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Popover Portal/Overlay */}
            {popover && (
                <div onClick={(e) => e.stopPropagation()}>
                    <DayPopover
                        date={popover.date}
                        events={events.filter(e => isSameDay(e.date, popover.date))}
                        onClose={closePopover}
                        onAddEvent={addEvent}
                        position={{ x: popover.x, y: popover.y }}
                    />
                </div>
            )}
        </div>
    );
}
