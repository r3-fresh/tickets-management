'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin panel error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted px-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-3">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Error en el panel de administración
                    </h1>
                    <p className="text-muted-foreground">
                        Ocurrió un error al cargar el panel de administración. 
                        Por favor, intenta de nuevo o contacta con soporte técnico.
                    </p>
                    {error.message && (
                        <div className="mt-4 rounded-md bg-muted p-3 text-sm text-left">
                            <p className="font-mono text-xs text-muted-foreground break-all">
                                {process.env.NODE_ENV === 'development'
                                    ? error.message
                                    : error.digest
                                        ? `Código de error: ${error.digest}`
                                        : 'Error interno del servidor'
                                }
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={reset}
                        className="w-full"
                    >
                        Intentar de nuevo
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
