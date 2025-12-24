"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";
import { CategoriesManagement } from "@/components/admin/categories-management";
import { SubcategoriesManagement } from "@/components/admin/subcategories-management";
import { CampusManagement } from "@/components/admin/campus-management";
import { WorkAreasManagement } from "@/components/admin/work-areas-management";
import { Tag, Grid3x3, MapPin, Briefcase, Settings } from "lucide-react";

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

interface Campus {
    id: number;
    name: string;
    code: string | null;
    isActive: boolean;
}

interface WorkArea {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
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
    initialCampus: Campus[];
    initialAreas: WorkArea[];
    initialAttentionAreas: AttentionArea[];
}

export function AdminSettingsTabs({
    initialAllowNewTickets,
    initialDisabledMessage,
    initialCategories,
    initialSubcategories,
    initialCampus,
    initialAreas,
    initialAttentionAreas
}: AdminSettingsTabsProps) {
    return (
        <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="categories">
                    <Tag className="h-4 w-4 mr-2" />
                    Categorías
                </TabsTrigger>
                <TabsTrigger value="subcategories">
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    Subcategorías
                </TabsTrigger>
                <TabsTrigger value="campus">
                    <MapPin className="h-4 w-4 mr-2" />
                    Campus
                </TabsTrigger>
                <TabsTrigger value="work-areas">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Áreas Trabajo
                </TabsTrigger>
                <TabsTrigger value="attention-areas">
                    <Settings className="h-4 w-4 mr-2" />
                    Áreas Atención
                </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración General</CardTitle>
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
                        <CardTitle>Categorías de Tickets</CardTitle>
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
                        <CardTitle>Subcategorías de Tickets</CardTitle>
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

            <TabsContent value="campus" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Campus Locations</CardTitle>
                        <CardDescription>
                            Gestiona las ubicaciones de campus disponibles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CampusManagement initialCampus={initialCampus} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="work-areas" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Áreas de Trabajo</CardTitle>
                        <CardDescription>
                            Gestiona las áreas de trabajo (ubicaciones físicas/departamentos del usuario)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WorkAreasManagement initialAreas={initialAreas} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="attention-areas" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Áreas de Atención</CardTitle>
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
