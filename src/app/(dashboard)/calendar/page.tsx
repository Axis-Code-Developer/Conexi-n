"use client";

import { AgentInterface } from "@/components/domain/AgentInterface";
import { CalendarGrid } from "@/components/domain/CalendarGrid";

export default function CalendarPage() {
    return (
        <div className="flex h-full gap-6 items-stretch">
            {/* Left Column: AI Agent - Fixed Width */}
            <div className="w-[350px] shrink-0">
                <AgentInterface />
            </div>

            {/* Right Column: Calendar - Flex Grow */}
            <div className="flex-1 min-w-0 h-[calc(100vh-140px)]"> {/* Adjust height to fit screen minus navbar/padding */}
                <CalendarGrid />
            </div>
        </div>
    );
}
