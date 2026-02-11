import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted px-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-3">
                        <FileQuestion className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-6xl font-bold tracking-tight">404</h1>
                    <h2 className="text-2xl font-semibold">
                        Página no encontrada
                    </h2>
                    <p className="text-muted-foreground">
                        La página que estás buscando no existe o ha sido movida.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button asChild className="w-full">
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
