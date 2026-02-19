"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "./config-form";
import { AgentCategoriesManagement } from "@/components/agent/categories-management";
import { AgentSubcategoriesManagement } from "@/components/agent/subcategories-management";

interface Category {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    displayOrder: number;
    attentionAreaId?: number | null;
    subcategories?: {
        id: number;
        name: string;
        isActive: boolean;
    }[];
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

interface SettingsTabsProps {
    initialData: {
        isAcceptingTickets: boolean;
    };
    categories: Category[];
    subcategories: Subcategory[];
    areaId: number;
}

export function SettingsTabs({ initialData, categories, subcategories }: SettingsTabsProps) {
    return (
        <Tabs defaultValue="reception" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
                <TabsTrigger value="reception" className="cursor-pointer">Recepción de tickets</TabsTrigger>
                <TabsTrigger value="categories" className="cursor-pointer">Categorías</TabsTrigger>
                <TabsTrigger value="subcategories" className="cursor-pointer">Subcategorías</TabsTrigger>
            </TabsList>

            <TabsContent value="reception" className="mt-6">
                <SettingsForm initialData={initialData} />
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
                <AgentCategoriesManagement categories={categories} />
            </TabsContent>

            <TabsContent value="subcategories" className="mt-6">
                <AgentSubcategoriesManagement
                    subcategories={subcategories}
                    categories={categories}
                />
            </TabsContent>
        </Tabs>
    );
}
