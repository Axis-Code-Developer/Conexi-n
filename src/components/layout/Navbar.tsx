"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Users, Package, LogOut, Settings, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const navItems = [
    { name: "Calendario", href: "/calendar", icon: Calendar },
    { name: "Equipo", href: "/team", icon: Users },
    { name: "Actividades", href: "/activities", icon: "/icons/Files/file-heart-02.svg", isImage: true },
    { name: "Asimilación", href: "/follow-up", icon: "/icons/General/heart.svg", isImage: true },
    { name: "Recursos", href: "/resources", icon: Package },
];

interface UserData {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
}

export function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<UserData | null>(null);

    // Fetch fresh user data from API
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };
        fetchUser();
    }, [pathname]);

    const allowedPaths = ["/calendar", "/team", "/activities", "/follow-up", "/resources", "/settings"];
    const shouldShowNavbar = allowedPaths.some(path => pathname.startsWith(path));

    if (!shouldShowNavbar) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 h-24 flex items-center px-8 text-foreground">
            {/* Background with gradient mask */}
            <div
                className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-3xl -z-10"
                style={{
                    maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
                }}
            />

            {/* Content Container - Solid */}
            <div className="w-full flex items-center gap-4 relative z-10">
                {/* Logo */}
                <div className="relative shrink-0 w-[46px] h-[46px] rounded-lg border-[0.6px] border-white shadow-md overflow-hidden bg-white">
                    <Image
                        src="/images/logo.png"
                        alt="Ministry Logo"
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg border-[0.6px] shadow-md transition-all duration-200",
                                    isActive
                                        ? "bg-white text-black border-white shadow-lg hover:shadow-white/10"
                                        : "bg-[#252525] text-white border-white/10 hover:bg-[#2a2a2a] hover:border-white/20"
                                )}
                            >
                                <div className="w-5 h-5 relative shrink-0 flex items-center justify-center">
                                    {'isImage' in item ? (
                                        <Image
                                            src={item.icon as string}
                                            alt={item.name}
                                            width={20}
                                            height={20}
                                            className={cn("object-contain", isActive ? "" : "invert")}
                                        />
                                    ) : (
                                        <item.icon className="w-full h-full" strokeWidth={1.5} />
                                    )}
                                </div>
                                <span className="text-base font-normal font-display leading-normal text-center whitespace-nowrap">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Menu (Right Side) */}
                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="relative shrink-0 w-[42px] h-[42px] rounded-md border-[0.6px] border-white/20 shadow-md cursor-pointer overflow-hidden bg-[#252525] hover:border-white/40 transition-all hover:shadow-lg">
                                <Avatar className="w-full h-full rounded-md">
                                    {user?.image ? (
                                        <AvatarImage src={user.image} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-[#313131] text-white rounded-md">
                                        {user?.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.name || "Cargando..."}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email || "..."}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer w-full flex items-center">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Configuración</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span className="text-red-400">Cerrar sesión</span>
                                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
