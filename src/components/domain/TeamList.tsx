"use client";

import { AddMemberDialog } from "@/components/domain/AddMemberDialog";
import { UserManagementRow } from "@/components/domain/UserManagementRow";
import { cn } from "@/lib/utils";

interface TeamListProps {
    members: any[];
}

export function TeamList({ members }: TeamListProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Header with Action */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Equipo</h1>
                    <p className="text-gray-400">Gestión de miembros del ministerio</p>
                </div>
                <AddMemberDialog />
            </div>

            {/* Dark Card Container (Typical Style) */}
            <div className="w-full bg-[#313131] rounded-3xl p-6 border-[0.6px] border-white/50 shadow-md">
                <div className="flex flex-col">

                    {/* Headers */}
                    <div className="grid grid-cols-12 px-8 py-4 text-sm font-medium text-gray-400 mb-2 gap-4">
                        <div className="col-span-4">Perfil / Nombre</div>
                        <div className="col-span-4">Correo</div>
                        <div className="col-span-3">Asignaciones</div>
                        <div className="col-span-1 text-right"></div>
                    </div>

                    {members.length === 0 && (
                        <div className="p-12 text-center text-gray-500 rounded-2xl bg-[#3a3a3a]">
                            No hay miembros aún. Invita a alguien.
                        </div>
                    )}

                    {/* Rows */}
                    {members.map((member: any, index: number) => (
                        <UserManagementRow
                            key={member.id}
                            member={member}
                            index={index}
                            total={members.length}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
