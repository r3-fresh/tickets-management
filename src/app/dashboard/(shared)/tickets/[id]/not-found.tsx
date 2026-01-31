import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TicketNotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background px-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                        <FileQuestion className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-6xl font-bold tracking-tight">404</h1>
                    <h2 className="text-2xl font-semibold">
                        Ticket no encontrado
                    </h2>
                    <p className="text-muted-foreground">
                        El ticket que buscas no existe o no tienes permisos para verlo.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button asChild className="w-full">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a mis tickets
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
