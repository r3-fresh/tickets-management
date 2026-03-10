"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";
import { AdminCategoriesManagement as CategoriesManagement } from "@/components/admin/categories-management";
import { SubcategoriesManagement } from "@/components/admin/subcategories-management";
import { Tag, Grid3x3, Settings } from "lucide-react";

interface Category {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    displayOrder: number;
}

interface Subcategory {
    id: number;
    categoryId: number;
    name: string;
    description: string | null;
    isActive: boolean;
    displayOrder: number;
    category?: {
        id: number;
        name: string;
    };
}

import { AttentionAreasList } from "@/components/admin/attention-areas-list";

interface AttentionArea {
    id: number;
    name: string;
    slug: string;
    isAcceptingTickets: boolean;
}

interface AdminSettingsTabsProps {
    initialAllowNewTickets: boolean;
    initialDisabledMessage?: string;
    initialCategories: Category[];
    initialSubcategories: Subcategory[];
    initialAttentionAreas: AttentionArea[];
}

export function AdminSettingsTabs({
    initialAllowNewTickets,
    initialDisabledMessage,
    initialCategories,
    initialSubcategories,
    initialAttentionAreas
}: AdminSettingsTabsProps) {
    return (
        <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="cursor-pointer">General</TabsTrigger>
                <TabsTrigger value="categories" className="cursor-pointer">
                    <Tag className="h-4 w-4 mr-2" />
                    Categorías
                </TabsTrigger>
                <TabsTrigger value="subcategories" className="cursor-pointer">
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    Subcategorías
                </TabsTrigger>
                <TabsTrigger value="attention-areas" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Áreas de atención
                </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración general</CardTitle>
                        <CardDescription>
                            Administra las opciones globales de la aplicación
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SettingsForm
                            initialAllowNewTickets={initialAllowNewTickets}
                            initialDisabledMessage={initialDisabledMessage}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Categorías de tickets</CardTitle>
                        <CardDescription>
                            Gestiona las categorías principales para clasificar los tickets
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoriesManagement
                            initialCategories={initialCategories}
                            attentionAreas={initialAttentionAreas}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="subcategories" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Subcategorías de tickets</CardTitle>
                        <CardDescription>
                            Gestiona las subcategorías para cada categoría principal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SubcategoriesManagement
                            initialSubcategories={initialSubcategories}
                            categories={initialCategories}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="attention-areas" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Áreas de atención</CardTitle>
                        <CardDescription>
                            Gestiona las áreas responsables de resolver tickets (TSI, Fondo Editorial, etc.)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AttentionAreasList areas={initialAttentionAreas} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
