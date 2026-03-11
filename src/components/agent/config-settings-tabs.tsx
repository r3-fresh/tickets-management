"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./config-form";
import { AgentCategoriesManagement } from "@/components/agent/categories-management";
import { AgentSubcategoriesManagement } from "@/components/agent/subcategories-management";
import { AgentPriorityConfig } from "@/components/agent/priority-config";

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

interface PriorityConfigItem {
  id: number;
  attentionAreaId: number;
  priority: string;
  description: string;
  slaHours: number;
}

interface SettingsTabsProps {
  initialData: {
    isAcceptingTickets: boolean;
  };
  categories: Category[];
  subcategories: Subcategory[];
  areaId: number;
  priorityConfigs: PriorityConfigItem[];
}

export function SettingsTabs({ initialData, categories, subcategories, priorityConfigs }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="reception" className="w-full">
      <TabsList className="grid w-full max-w-2xl grid-cols-4">
        <TabsTrigger value="reception" className="cursor-pointer">Recepción</TabsTrigger>
        <TabsTrigger value="categories" className="cursor-pointer">Categorías</TabsTrigger>
        <TabsTrigger value="subcategories" className="cursor-pointer">Subcategorías</TabsTrigger>
        <TabsTrigger value="priorities" className="cursor-pointer">Prioridades</TabsTrigger>
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

      <TabsContent value="priorities" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Prioridades de tu área</CardTitle>
            <CardDescription>
              Configura la descripción y el tiempo de atención (SLA) de cada nivel de prioridad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentPriorityConfig priorityConfigs={priorityConfigs} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
