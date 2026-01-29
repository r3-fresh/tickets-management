"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Ticket,
    LogOut,
    Menu,
    X,
    User,
    Shield,
    Eye,
    Settings,
    ChevronLeft,
    ChevronRight,
    BookOpen
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { SidebarUserInfo } from "@/components/dashboard/sidebar-user-info";
import { cn } from "@/lib/utils/cn";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse
    const pathname = usePathname();
    const router = useRouter();

    // Use auth hook to get session data
    const { data: session } = authClient.useSession();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login"); // Handle redirect here
                },
            },
        });
    };

    // --- NAVIGATION ITEMS CONFIGURATION ---

    // Common items
    const knowledgeBaseItem = {
        href: "https://docs.google.com/spreadsheets/d/1F23_z7fQJbfGCmvavge3Igw-FcyG4Xd_A-MR3s5WURc/",
        label: "Base de conocimiento",
        icon: BookOpen,
        external: true
    };

    const userNavItems = [
        { href: "/dashboard/usuario", label: "Mi panel", icon: LayoutDashboard },
        { href: "/dashboard/usuario/mis-tickets", label: "Mis tickets", icon: Ticket },
        { href: "/dashboard/usuario/seguimiento", label: "En seguimiento", icon: Eye },
    ];

    const agentNavItems = [
        { href: "/dashboard/agente", label: "Mi panel", icon: LayoutDashboard },
        { href: "/dashboard/agente/mis-tickets", label: "Mis tickets", icon: Ticket },
        { href: "/dashboard/agente/seguimiento", label: "En seguimiento", icon: Eye },
        { href: "/dashboard/agente/tickets-area", label: "Tickets del área", icon: Ticket },
    ];

    const adminNavItems = [
        { href: "/dashboard/admin", label: "Panel de control", icon: LayoutDashboard },
        { href: "/dashboard/admin/tickets", label: "Explorador de tickets", icon: Ticket },
    ];

    // Type assertion for better-auth session with role
    const userRole = (session?.user as { role?: string })?.role;

    // Roles item (Admin)
    const rolesItem = { href: "/dashboard/admin/gestion-usuarios", label: "Gestión de usuarios", icon: Shield, external: false };

    // Settings items (Agent/Admin)
    const settingsItem = {
        href: userRole === "admin" ? "/dashboard/admin/configuracion" : "/dashboard/agente/configuracion",
        label: userRole === "admin" ? "Configuración del sistema" : "Configuración del área",
        icon: Settings,
        external: false
    };

    let navigationSection = userNavItems;
    let resourcesSection = [knowledgeBaseItem];

    if (userRole === "admin") {
        navigationSection = adminNavItems;
        resourcesSection.push(rolesItem); // Add Roles to resources
        resourcesSection.push(settingsItem);
    } else if (userRole === "agent") {
        navigationSection = agentNavItems;
        resourcesSection.push(settingsItem);
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-background">
            {/* --- DESKTOP SIDEBAR --- */}
            <div
                className={cn(
                    "hidden md:flex flex-col transition-all duration-300 ease-in-out z-20 border-r border-sidebar-border",
                    "bg-sidebar text-sidebar-foreground",
                    isCollapsed ? "w-20" : "w-72"
                )}
            >
                {/* 1. TOP: User Profile */}
                <div className={cn(
                    "relative flex border-b border-sidebar-border transition-all duration-300",
                    isCollapsed ? "flex-col items-center justify-center py-4 px-2 gap-4" : "flex-col items-start py-6 px-6 gap-3"
                )}>
                    {/* Theme Toggle - Absolute Top Right (visible only expanded) */}
                    {!isCollapsed && (
                        <div className="absolute top-4 right-4 z-20">
                            <ModeToggle />
                        </div>
                    )}

                    <Avatar className={cn("transition-all duration-300 ring-2 ring-sidebar-ring shrink-0", isCollapsed ? "h-8 w-8" : "h-12 w-12")}>
                        <AvatarImage src={session?.user?.image || undefined} referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {session?.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>

                    {!isCollapsed && (
                        <div className="flex flex-col items-start w-full min-w-0 space-y-1">
                            <h2 className="font-semibold text-sm w-full wrap-break-word leading-tight" title={session?.user?.name || ""}>
                                {session?.user?.name || "Usuario"}
                            </h2>
                            <p className="text-xs text-muted-foreground w-full break-all" title={session?.user?.email || ""}>
                                {session?.user?.email || ""}
                            </p>
                            <div className="pt-2">
                                <SidebarUserInfo role={userRole || "user"} />
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. MIDDLE: Navigation */}
                <div className="flex-1 overflow-y-auto py-6 space-y-6">
                    {/* Navigation Section */}
                    <div className="px-3">
                        {!isCollapsed && (
                            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider animate-in fade-in duration-300">
                                Navegación
                            </h3>
                        )}
                        <nav className="space-y-1">
                            {navigationSection.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                            isCollapsed ? "justify-center" : "",
                                            isActive
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        )}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <Icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3", isActive && "text-primary")} />
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Separator */}
                    <div className="mx-4 border-t border-sidebar-border" />

                    {/* Resources Section */}
                    <div className="px-3">
                        {!isCollapsed && (
                            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider animate-in fade-in duration-300">
                                Recursos
                            </h3>
                        )}
                        <nav className="space-y-1">
                            {resourcesSection.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        target={item.external ? "_blank" : undefined}
                                        className={cn(
                                            "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                            isCollapsed ? "justify-center" : "",
                                            isActive
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        )}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <Icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* 3. BOTTOM: Controls & Logout */}
                <div className="p-4 border-t border-sidebar-border bg-sidebar mt-auto">
                    <div className={cn("flex items-center", isCollapsed ? "flex-col gap-6 justify-center" : "gap-2 flex-row")}>
                        {/* Collapse Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={cn(
                                "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent h-9 w-9 border border-sidebar-border transition-all",
                                isCollapsed ? "order-2" : "order-2"
                            )}
                            title={isCollapsed ? "Expandir" : "Colapsar"}
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>

                        <button
                            onClick={handleSignOut}
                            className={cn(
                                "flex items-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors cursor-pointer",
                                isCollapsed ? "justify-center p-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 order-1" : "flex-1 px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 order-1"
                            )}
                            title="Cerrar sesión"
                        >
                            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                            {!isCollapsed && <span className="text-sm font-medium">Cerrar sesión</span>}
                        </button>
                    </div>
                </div>
            </div>


            {/* --- MOBILE SIDEBAR --- */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 transform bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
                    <span className="text-lg font-bold">Menu</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex flex-col h-full overflow-y-auto pb-20">
                    {/* Mobile Profile */}
                    <div className="p-6 border-b border-sidebar-border flex flex-col items-center relative">
                        <div className="absolute top-4 right-4">
                            <ModeToggle />
                        </div>
                        <Avatar className="h-16 w-16 mb-3 ring-2 ring-sidebar-ring">
                            <AvatarImage src={session?.user?.image || undefined} referrerPolicy="no-referrer" />
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                {session?.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="font-semibold text-lg">{session?.user?.name || "Usuario"}</h2>
                        <p className="text-sm text-muted-foreground mb-2">{session?.user?.email || ""}</p>
                        <SidebarUserInfo role={userRole || "user"} />
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-6">
                        <div>
                            <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Navegación
                            </h3>
                            <div className="space-y-1">
                                {navigationSection.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={cn(
                                            "group flex items-center px-3 py-3 text-base font-medium rounded-lg",
                                            pathname === item.href
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        )}
                                    >
                                        <item.icon className="mr-4 h-6 w-6 shrink-0" />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Recursos
                            </h3>
                            <div className="space-y-1">
                                {resourcesSection.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        target={item.external ? "_blank" : undefined}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="group flex items-center px-3 py-3 text-base font-medium rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    >
                                        <item.icon className="mr-4 h-6 w-6 shrink-0" />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-sidebar-border">
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center justify-center px-4 py-3 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* --- MAIN HEADER (Mobile Only) & CONTENT --- */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b border-border bg-white dark:bg-card px-4 shadow-sm md:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-muted-foreground focus:outline-none"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="text-lg font-bold">Gestión de tickets</span>
                    <div className="w-6" />
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
