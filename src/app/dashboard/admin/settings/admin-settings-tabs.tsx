"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";
import { CategoriesManagement } from "./categories-management";
import { SubcategoriesManagement } from "./subcategories-management";
import { CampusManagement } from "./campus-management";
import { WorkAreasManagement } from "./work-areas-management";
import { Tag, Grid3x3, MapPin, Briefcase } from "lucide-react";

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

interface AdminSettingsTabsProps {
    initialAllowNewTickets: boolean;
    initialCategories: Category[];
    initialSubcategories: Subcategory[];
    initialCampus: Campus[];
    initialAreas: WorkArea[];
}

export function AdminSettingsTabs({
    initialAllowNewTickets,
    initialCategories,
    initialSubcategories,
    initialCampus,
    initialAreas
}: AdminSettingsTabsProps) {
    return (
        <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
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
                <TabsTrigger value="areas">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Áreas
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
                        <SettingsForm initialAllowNewTickets={initialAllowNewTickets} />
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
                        <CategoriesManagement initialCategories={initialCategories} />
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

            <TabsContent value="areas" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Áreas de Trabajo</CardTitle>
                        <CardDescription>
                            Gestiona las áreas de trabajo disponibles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WorkAreasManagement initialAreas={initialAreas} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
