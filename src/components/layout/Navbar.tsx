"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Users, Activity, Package } from "lucide-react";

const navItems = [
    { name: "Calendario", href: "/calendar", icon: Calendar },
    { name: "Equipo", href: "/team", icon: Users },
    { name: "Actividades", href: "/activities", icon: Activity },
    { name: "Recursos", href: "/resources", icon: Package },
];

export function Navbar() {
    const pathname = usePathname();

    const allowedPaths = ["/calendar", "/team", "/activities", "/resources"];
    const shouldShowNavbar = allowedPaths.some(path => pathname.startsWith(path));

    if (!shouldShowNavbar) return null;

    return (
        <div className="w-full flex items-center gap-4 px-8 pt-8 pb-0 shrink-0">
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
            <nav className="flex items-center gap-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg border-[0.6px] border-white shadow-md transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-white text-foreground hover:bg-gray-50"
                            )}
                        >
                            <div className="w-5 h-5 relative shrink-0">
                                <item.icon className="w-full h-full" strokeWidth={1.5} />
                            </div>
                            <span className="text-base font-normal font-display leading-normal text-center whitespace-nowrap">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
            {/* Version Indicator */}
            <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500 bg-gray-900/50 px-2 py-1 rounded-md border border-gray-800">
                    v0.3.0-alpha
                </span>
            </div>
        </div>
    );
}
