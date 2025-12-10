"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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

    useEffect(() => {
        if (!token) {
            setVerifying(false);
            setError("Token no proporcionado");
            return;
        }

        // Verify token validity via API (need a new endpoint or check existing invite status)
        // For now, implementing client-side 'verify' by calling a GET endpoint we should create
        // Or simpler: Just assume pending until we submit form which will fail if invalid.
        // BUT user wants to see their email. 
        // Let's create a small server action or API route to get invite details by token.

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
        return <div className="flex h-screen items-center justify-center bg-[#313131] text-white"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    if (error || !inviteData) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#313131] text-white gap-4">
                <XCircle className="h-12 w-12 text-red-500" />
                <h1 className="text-xl font-bold">Invitación Inválida</h1>
                <p className="text-gray-400">{error || "No se pudo encontrar la invitación."}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#313131] px-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
                <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold font-display text-[#313131]">¡Hola, {inviteData.name}!</h1>
                    <p className="text-gray-500 text-sm mt-2">Configura tu contraseña para unirte al equipo.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-gray-700">Correo (Verificado)</Label>
                        <Input value={inviteData.email} disabled className="bg-gray-100 cursor-not-allowed" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pass" className="text-gray-700">Nueva Contraseña</Label>
                        <Input id="pass" type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-gray-700">Confirmar Contraseña</Label>
                        <Input id="confirm" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>

                    {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full bg-[#313131] hover:bg-black text-white">
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
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#313131] text-white"><Loader2 className="animate-spin h-8 w-8" /></div>}>
            <RegisterForm />
        </Suspense>
    );
}
