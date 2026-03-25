import { Button } from "@/components/ui/button";
import { Monitor, ArrowLeft, HeartCrack } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Panel de branding - visible en desktop */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-foreground text-background flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-background/10 border border-background/15">
            <Monitor className="size-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium tracking-wide uppercase opacity-80">
            Tecnologías y sistemas de información
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1]">
            Error <span className="text-background/60">404</span>
            <span className="block mt-2">Página extraviada</span>
          </h1>
          <p className="text-background/60 text-lg leading-relaxed max-w-md">
            El recurso que intentas acceder no existe, ha sido movido o no tienes los permisos suficientes.
          </p>
        </div>

        <p className="text-background/40 text-sm">
          Plataforma de gestión de requerimientos
        </p>
      </div>

      {/* Panel de error interactivo */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm space-y-10">
          {/* Header con branding - solo mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
              <Monitor className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Gestión de requerimientos</p>
              <p className="text-xs text-muted-foreground">Continental</p>
            </div>
          </div>

          {/* Título y alerta visual */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <div className="rounded-full bg-muted p-4">
                <HeartCrack className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Página no encontrada</h2>
              <p className="text-muted-foreground text-sm">
                Parece que esta ruta es incorrecta o el contenido ya no está disponible.
              </p>
            </div>

            <Button asChild className="w-full h-11 text-sm font-medium mt-4">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Regresar al inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
