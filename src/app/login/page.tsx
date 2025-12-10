"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Credenciales inválidas");
            } else {
                router.push("/calendar");
            }
        } catch { // Remove unused var 'err'
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#313131] px-4">
            <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold font-display text-[#313131]">Bienvenido</h1>
                    <p className="text-gray-500 text-sm mt-2">Inicia sesión en Ministerio Organizador</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Correo Electrónico</Label>
                        <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>

                    {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full bg-[#313131] hover:bg-black text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Entrar
                    </Button>
                </form>
            </div>
        </div>
    );
}
