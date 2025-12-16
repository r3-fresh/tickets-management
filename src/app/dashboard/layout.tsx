
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    PlusCircle,
    Ticket,
    LogOut,
    Menu,
    X,
    User,
    Shield
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

    const navItems = [
        { href: "/dashboard/tickets", label: "Mis Tickets", icon: Ticket },
    ];

    // Admin-only items
    const adminItems = [
        { href: "/dashboard/tickets/new", label: "Nuevo Ticket", icon: PlusCircle },
        { href: "/dashboard/agent", label: "Bandeja de Tickets", icon: User },
        { href: "/dashboard/admin/roles", label: "Gestión de Roles", icon: Shield },
    ];

    const allNavItems = (session?.user as any)?.role === "admin"
        ? [...navItems, ...adminItems]
        : navItems;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <h1 className="text-xl font-bold text-gray-900">TSI Tickets</h1>
                    </div>

                    <nav className="mt-6 flex-1 space-y-1 px-2">
                        {allNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon
                                        className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-500"
                                            }`}
                                    />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section at bottom */}
                    <div className="flex-shrink-0 border-t border-gray-200 p-4">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="bg-teal-500 text-white text-lg">
                                    {session?.user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {session?.user?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {session?.user?.email}
                                </p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mobile Sidebar (original structure, but adapted for mobile) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:hidden`} // Only show on mobile, hidden on md and up
            >
                <div className="flex h-16 items-center justify-between px-4 border-b">
                    <span className="text-xl font-bold text-blue-600">TSI Tickets</span>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="mt-6 flex-1 space-y-1 px-2">
                    {allNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                                        }`}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t p-4">
                    <div className="flex items-center mb-4">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={session?.user?.image || ""} />
                            <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">{session?.user?.name || "Cargando..."}</p>
                            <p className="text-xs text-gray-500 truncate w-40">{session?.user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleSignOut}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm md:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="text-lg font-bold text-gray-900">TSI Tickets</span>
                    <div className="w-6" /> {/* Placeholder for balance */}
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
