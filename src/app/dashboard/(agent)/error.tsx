'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AgentError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Agent panel error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Error en el panel de agente
                    </h1>
                    <p className="text-muted-foreground">
                        Ocurrió un error al cargar esta sección.
                        Por favor, intenta de nuevo.
                    </p>
                    {error.message && (
                        <div className="mt-4 rounded-md bg-gray-100 dark:bg-gray-800 p-3 text-sm text-left">
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
