"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "./form";
import { AgentCategoriesManagement } from "@/components/agent/categories-management";
import { AgentSubcategoriesManagement } from "@/components/agent/subcategories-management";

interface SettingsTabsProps {
    initialData: {
        isAcceptingTickets: boolean;
    };
    categories: any[];
    subcategories: any[];
    areaId: number;
}

export function SettingsTabs({ initialData, categories, subcategories }: SettingsTabsProps) {
    return (
        <Tabs defaultValue="reception" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
                <TabsTrigger value="reception">Recepción de Tickets</TabsTrigger>
                <TabsTrigger value="categories">Categorías</TabsTrigger>
                <TabsTrigger value="subcategories">Subcategorías</TabsTrigger>
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
