"use client";

import { AddMemberDialog } from "@/components/domain/AddMemberDialog";
import { MoreVertical, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function TeamPage() {
    let members = [];
    try {
        members = await prisma.user.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (e) {
        console.warn("Could not fetch members during render (likely build time or DB unreachable):", e);
        // Default to empty array to allow build to pass
        members = [];
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header with Action */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Equipo</h1>
                    <p className="text-gray-500">Gestión de miembros del ministerio</p>
                </div>
                <AddMemberDialog />
            </div>

            {/* Dark Table Container */}
            <div className="w-full">
                <div className="flex flex-col gap-1"> {/* Gap-1 to separate rows visually if needed, or 0 */}

                    {/* Headers (Optional, but good for UX - making them subtle) */}
                    <div className="grid grid-cols-12 px-6 py-3 text-sm font-medium text-gray-500">
                        <div className="col-span-4">Perfil / Nombre</div>
                        <div className="col-span-6">Correo</div>
                        <div className="col-span-2 text-right">Opciones</div>
                    </div>

                    {members.length === 0 && (
                        <div className="p-8 text-center text-gray-500 bg-[#313131] rounded-2xl">
                            No hay miembros aún. Invita a alguien.
                        </div>
                    )}

                    {/* Rows */}
                    {members.map((member: any, index: number) => {
                        const isFirst = index === 0;
                        const isLast = index === members.length - 1;

                        return (
                            <div
                                key={member.id}
                                className={cn(
                                    "grid grid-cols-12 items-center px-6 py-4 bg-[#313131] text-white transition-colors hover:bg-[#3a3a3a]",
                                    isFirst && "rounded-t-2xl",
                                    isLast && "rounded-b-2xl",
                                    !isLast && "border-b-0" // Explicitly no dividers
                                )}
                            >
                                {/* Col 1: Profile */}
                                <div className="col-span-4 flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border-2 border-white/10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                        <AvatarFallback className="bg-gray-600 text-white"><User className="w-4 h-4" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-base">{member.name}</p>
                                        <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded-full inline-block mt-1">
                                            {member.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Col 2: Email (Replacing Activities for now) */}
                                <div className="col-span-6 text-sm text-gray-300">
                                    {member.email}
                                </div>

                                {/* Col 3: Options */}
                                <div className="col-span-2 flex justify-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="p-2 hover:bg-white/10 rounded-full outline-none transition-colors">
                                            <MoreVertical className="w-5 h-5 text-gray-400" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Editar</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
