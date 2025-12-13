"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
        } catch {
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#1A1A1A]">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-[#171717] p-8 shadow-2xl border-[0.6px] border-white/20">
                <div className="text-center space-y-2">
                    <div className="mx-auto mb-4 w-[60px] h-[60px] relative">
                        <img
                            src="/images/logo.png"
                            alt="Ministry Logo"
                            className="w-full h-full object-cover rounded-lg border-[0.6px] border-white shadow-md"
                        />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">Bienvenido</h1>
                    <p className="text-gray-400 text-base">Inicia sesión en Ministerio Conexión</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300 font-normal ml-1">Correo Electrónico</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="tu@email.com"
                            className="bg-[#252525] border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300 font-normal ml-1">Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="bg-[#252525] border-white/10 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400 font-medium text-center bg-red-900/20 py-2 rounded-md">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 font-semibold rounded-lg h-10 transition-all shadow-lg hover:shadow-white/10">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Entrar
                    </Button>
                </form>
            </div>
        </div>
    );
}
