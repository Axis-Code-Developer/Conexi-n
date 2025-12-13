"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [inviteData, setInviteData] = useState<{ email: string; name: string } | null>(null);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setVerifying(false);
            setError("Token no proporcionado");
            return;
        }

        fetch(`/api/invite/verify?token=${token}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setInviteData(data);
                }
            })
            .catch(() => setError("Error verificando invitación"))
            .finally(() => setVerifying(false));

    }, [token]);


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                body: JSON.stringify({ token, password }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/login?registered=true");
            } else {
                setError(data.error || "Error al registrar");
            }
        } catch {
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return <div className="flex h-screen items-center justify-center bg-[#1A1A1A] text-white"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    if (error && !inviteData) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#1A1A1A] text-white gap-4">
                <XCircle className="h-12 w-12 text-red-500" />
                <h1 className="text-xl font-bold">Invitación Inválida</h1>
                <p className="text-gray-400">{error || "No se pudo encontrar la invitación."}</p>
            </div>
        );
    }

    if (!inviteData) {
        return null;
    }

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
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">¡Hola, {inviteData.name}!</h1>
                    <p className="text-gray-400 text-base">Configura tu contraseña para unirte al equipo.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-gray-300 font-normal ml-1">Correo (Verificado)</Label>
                        <Input value={inviteData.email} disabled className="bg-[#252525] border-white/10 text-gray-400 cursor-not-allowed" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pass" className="text-gray-300 font-normal ml-1">Nueva Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="pass"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                minLength={6}
                                placeholder="••••••••"
                                className="pr-10"
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

                    <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-gray-300 font-normal ml-1">Confirmar Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="confirm"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400 font-medium text-center bg-red-900/20 py-2 rounded-md">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 font-semibold rounded-lg h-10 transition-all shadow-lg hover:shadow-white/10">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Finalizar Registro
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#1A1A1A] text-white"><Loader2 className="animate-spin h-8 w-8" /></div>}>
            <RegisterForm />
        </Suspense>
    );
}
