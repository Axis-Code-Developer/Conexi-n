"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldAlert } from "lucide-react";

export default function SetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await fetch("/api/setup", {
                method: "POST",
                body: JSON.stringify({ name, email, password }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/login?setup=success");
            } else {
                setError(data.error);
            }
        } catch {
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
            <div className="w-full max-w-sm space-y-6 rounded-2xl bg-[#313131] p-8 border border-gray-700">
                <div className="text-center">
                    <ShieldAlert className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <h1 className="text-2xl font-bold font-display">Setup Inicial</h1>
                    <p className="text-gray-400 text-sm mt-2">Crea el usuario Administrador Maestro</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" required className="bg-black/50 border-gray-600" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo</Label>
                        <Input id="email" name="email" type="email" required className="bg-black/50 border-gray-600" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña Maestra</Label>
                        <Input id="password" name="password" type="password" required className="bg-black/50 border-gray-600" />
                    </div>

                    {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-gray-200">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Admin y Bloquear Setup
                    </Button>
                </form>
            </div>
        </div>
    );
}
