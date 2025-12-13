"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MoreVertical, Pencil, Trash2, Check, ShieldAlert, BadgeCheck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { SUPERVISORS, STAFF_MEMBERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { updateUserSupervisor, setStaffStatus } from "@/app/actions";

interface UserManagementRowProps {
    member: any; // User type
    index: number;
    total: number;
}

export function UserManagementRow({ member, index, total }: UserManagementRowProps) {
    const [supervisor, setSupervisor] = useState<string | null>(member.supervisorName || null);
    const [isStaff, setIsStaff] = useState<boolean>(member.isStaff || false);
    const [showStaffDialog, setShowStaffDialog] = useState(false);
    const [showRemoveStaffDialog, setShowRemoveStaffDialog] = useState(false);
    const [selectedStaffIdentity, setSelectedStaffIdentity] = useState<string | null>(null);

    // Sync state with props to avoid "flash and reset" issues if parent re-renders
    useEffect(() => {
        setSupervisor(member.supervisorName || null);
        setIsStaff(member.isStaff || false);
    }, [member]);

    const handleSupervisorChange = async (name: string) => {
        // Toggle off if same
        const newValue = supervisor === name ? null : name;
        setSupervisor(newValue); // Optimistic update

        const result = await updateUserSupervisor(member.id, newValue || "");
        if (!result.success) {
            // Revert on failure
            setSupervisor(member.supervisorName || null);
            // Optionally show toast
        }
    };

    const handleStaffConfirm = async () => {
        if (selectedStaffIdentity) {
            setIsStaff(true); // Optimistic
            const result = await setStaffStatus(member.id, true, selectedStaffIdentity);
            setShowStaffDialog(false);
            if (!result.success) {
                setIsStaff(false);
            }
        }
    };

    const handleStaffToggle = () => {
        if (isStaff) {
            // Turn off -> Show remove dialog
            setShowRemoveStaffDialog(true);
        } else {
            // Turn on -> Show add dialog
            setShowStaffDialog(true);
        }
    };

    const handleRemoveStaffConfirm = async () => {
        setIsStaff(false);
        await setStaffStatus(member.id, false);
        setShowRemoveStaffDialog(false);
    };

    return (
        <div
            className={cn(
                "grid grid-cols-12 items-center px-8 py-5 text-white transition-colors gap-4",
                "bg-[#3a3a3a] hover:bg-[#404040]",
                index === 0 && "rounded-t-2xl",
                index === total - 1 && "rounded-b-2xl",
                "border-b border-white/5 last:border-0"
            )}
        >
            {/* Col 1: Profile */}
            <div className="col-span-4 flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-white/10 rounded-xl">
                    {member.image ? (
                        <AvatarImage src={member.image} />
                    ) : null}
                    <AvatarFallback className="bg-gray-600 text-white rounded-xl"><User className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-base">{member.name}</p>
                        {isStaff && <BadgeCheck className="w-4 h-4 text-blue-400" title="Staff" />}
                    </div>

                    <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded-full inline-block">
                            {member.role}
                        </span>
                        {/* Removed duplicate supervisor badge since it's now in the button */}
                    </div>
                </div>
            </div>

            {/* Col 2: Email */}
            <div className="col-span-4 text-sm text-gray-300">
                {member.email}
            </div>

            {/* Col 3: Actions (Supervisor & Staff) */}
            <div className="col-span-3 flex items-center gap-2">
                {/* Supervisor Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs bg-[#2a2a2a] border-white/10 hover:bg-[#333] text-gray-300 min-w-[100px] justify-start px-2">
                            {supervisor ? (
                                <span className="flex items-center gap-1.5 overflow-hidden">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                    <span className="truncate">{supervisor}</span>
                                </span>
                            ) : "Asignar"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#2a2a2a] border-white/10 text-white" align="start">
                        <DropdownMenuLabel>Asignar Supervisor</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {SUPERVISORS.map(sup => (
                            <DropdownMenuCheckboxItem
                                key={sup}
                                checked={supervisor === sup}
                                onCheckedChange={() => handleSupervisorChange(sup)}
                                className="focus:bg-white/10 focus:text-white"
                            >
                                {sup}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Staff Toggle Button */}
                <Button
                    variant={isStaff ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("h-7 w-7 p-0", isStaff && "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30")}
                    onClick={handleStaffToggle}
                    title={isStaff ? "Es Staff" : "Marcar como Staff"}
                >
                    <ShieldAlert className="w-4 h-4" />
                </Button>
            </div>

            {/* Col 4: Options */}
            <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-white/10 rounded-full outline-none transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#2a2a2a] border-white/10 text-white">
                        <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white">
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:text-red-400 cursor-pointer focus:bg-white/10">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Staff Confirm Dialog */}
            <AlertDialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
                <AlertDialogContent className="bg-[#1a1a1a] border border-white/10 text-white sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-display">Confirmar Staff</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            ¿Esta persona pertenece al equipo de Staff?
                            Si es así, selecciona su identidad:
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {STAFF_MEMBERS.map(staff => (
                            <div
                                key={staff}
                                className={cn(
                                    "p-3 rounded-lg cursor-pointer flex items-center justify-between border transition-all",
                                    selectedStaffIdentity === staff
                                        ? "bg-blue-500/20 border-blue-500/50 text-blue-200"
                                        : "bg-[#252525] border-white/5 hover:bg-[#303030] hover:border-white/10"
                                )}
                                onClick={() => setSelectedStaffIdentity(staff)}
                            >
                                <span className="text-sm font-medium">{staff}</span>
                                {selectedStaffIdentity === staff && <Check className="w-4 h-4 text-blue-400" />}
                            </div>
                        ))}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => { setShowStaffDialog(false); setSelectedStaffIdentity(null); }}
                            className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
                        >
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleStaffConfirm}
                            disabled={!selectedStaffIdentity}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Remove Staff Confirmation Dialog */}
            {showRemoveStaffDialog && (
                <AlertDialog open={showRemoveStaffDialog} onOpenChange={setShowRemoveStaffDialog}>
                    <AlertDialogContent className="bg-[#2a2a2a] border-white/20 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Remover Staff</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                ¿Ya no es staff?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-[#3a3a3a] text-white border-white/20 hover:bg-[#404040] hover:text-white">
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleRemoveStaffConfirm}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Confirmar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
