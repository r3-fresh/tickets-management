import { db } from "@/db";
import { tickets, comments, ticketViews, ticketCategories, appSettings, users } from "@/db/schema";
import { eq, desc, sql, and, or, ilike, SQL, count as drizzleCount } from "drizzle-orm";

/**
 * Resultado de la query de tickets con conteo de comentarios no leídos.
 */
export type TicketWithUnread = Awaited<ReturnType<typeof queryTicketsWithUnread>>[number];

/**
 * Parámetros de filtro para tickets (usados desde URL search params).
 */
export interface TicketFilterParams {
    status?: string;
    assignedTo?: string;
    category?: string;
    search?: string;
    year?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    perPage?: number;
}

/**
 * Resultado paginado de tickets.
 */
export interface PaginatedTicketsResult {
    rows: TicketWithUnread[];
    totalCount: number;
}

/**
 * Construye condiciones WHERE a partir de filtros de tickets.
 */
function buildTicketFilterConditions(filters: TicketFilterParams): SQL[] {
    const conditions: SQL[] = [];

    if (filters.status) {
        conditions.push(eq(tickets.status, filters.status));
    }

    if (filters.assignedTo) {
        if (filters.assignedTo === "unassigned") {
            conditions.push(sql`${tickets.assignedToId} IS NULL`);
        } else {
            conditions.push(eq(tickets.assignedToId, filters.assignedTo));
        }
    }

    if (filters.category) {
        conditions.push(eq(tickets.categoryId, Number(filters.category)));
    }

    if (filters.search) {
        const searchPattern = `%${filters.search}%`;
        conditions.push(
            or(
                ilike(tickets.ticketCode, searchPattern),
                ilike(tickets.title, searchPattern),
            )!,
        );
    }

    if (filters.year && filters.year !== "all") {
        conditions.push(
            sql`extract(year from ${tickets.createdAt}) = ${Number(filters.year)}`,
        );
    }

    if (filters.dateFrom) {
        conditions.push(sql`${tickets.createdAt} >= ${filters.dateFrom}::timestamp`);
    }

    if (filters.dateTo) {
        // Agregar un día para incluir el día completo
        conditions.push(sql`${tickets.createdAt} < (${filters.dateTo}::timestamp + interval '1 day')`);
    }

    return conditions;
}

/**
 * Query reutilizable para obtener tickets con conteo de comentarios no leídos.
 * Consolida el patrón duplicado en dashboards, mis-tickets, seguimiento, explorador y area.
 * 
 * NOTA: Esta función se mantiene para los dashboards que usan limit sin paginación.
 *
 * @param userId - ID del usuario actual (para calcular no leídos)
 * @param where - Condición WHERE de Drizzle (ej: eq(tickets.createdById, userId))
 * @param limit - Límite de resultados (opcional, sin límite por defecto)
 */
export function queryTicketsWithUnread(
    userId: string,
    where?: SQL,
    limit?: number,
) {
    const query = db
        .select({
            id: tickets.id,
            ticketCode: tickets.ticketCode,
            title: tickets.title,
            status: tickets.status,
            priority: tickets.priority,
            categoryId: tickets.categoryId,
            categoryName: ticketCategories.name,
            subcategoryId: tickets.subcategoryId,
            areaId: tickets.areaId,
            campusId: tickets.campusId,
            createdById: tickets.createdById,
            assignedToId: tickets.assignedToId,
            createdAt: tickets.createdAt,
            updatedAt: tickets.updatedAt,
            unreadCommentCount: sql<number>`
                cast(
                    count(
                        case 
                            when ${comments.createdAt} > coalesce(${ticketViews.lastViewedAt}, ${tickets.createdAt})
                            and ${comments.userId} != ${userId}
                            then 1 
                        end
                    ) as integer
                )
            `,
            commentCount: sql<number>`cast(count(${comments.id}) as integer)`,
        })
        .from(tickets)
        .leftJoin(ticketCategories, eq(tickets.categoryId, ticketCategories.id))
        .leftJoin(comments, eq(tickets.id, comments.ticketId))
        .leftJoin(
            ticketViews,
            and(
                eq(tickets.id, ticketViews.ticketId),
                eq(ticketViews.userId, userId),
            ),
        )
        .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
        .orderBy(desc(tickets.createdAt));

    if (where) {
        query.where(where);
    }

    if (limit) {
        query.limit(limit);
    }

    return query;
}

/**
 * Query paginada de tickets con filtros server-side.
 * Ejecuta dos queries en paralelo: una para los datos paginados y otra para el total.
 *
 * @param userId - ID del usuario actual
 * @param filters - Filtros de URL search params
 * @param baseWhere - Condición base (ej: tickets del usuario, del área, etc.)
 */
export async function queryTicketsPaginated(
    userId: string,
    filters: TicketFilterParams,
    baseWhere?: SQL,
): Promise<PaginatedTicketsResult> {
    const page = filters.page || 1;
    const perPage = filters.perPage || 25;
    const offset = (page - 1) * perPage;

    // Combinar condición base con filtros
    const filterConditions = buildTicketFilterConditions(filters);
    const allConditions = baseWhere
        ? [baseWhere, ...filterConditions]
        : filterConditions;
    const whereClause = allConditions.length > 0 ? and(...allConditions) : undefined;

    // Query de datos paginados
    const dataQuery = db
        .select({
            id: tickets.id,
            ticketCode: tickets.ticketCode,
            title: tickets.title,
            status: tickets.status,
            priority: tickets.priority,
            categoryId: tickets.categoryId,
            categoryName: ticketCategories.name,
            subcategoryId: tickets.subcategoryId,
            areaId: tickets.areaId,
            campusId: tickets.campusId,
            createdById: tickets.createdById,
            assignedToId: tickets.assignedToId,
            createdAt: tickets.createdAt,
            updatedAt: tickets.updatedAt,
            unreadCommentCount: sql<number>`
                cast(
                    count(
                        case 
                            when ${comments.createdAt} > coalesce(${ticketViews.lastViewedAt}, ${tickets.createdAt})
                            and ${comments.userId} != ${userId}
                            then 1 
                        end
                    ) as integer
                )
            `,
            commentCount: sql<number>`cast(count(${comments.id}) as integer)`,
        })
        .from(tickets)
        .leftJoin(ticketCategories, eq(tickets.categoryId, ticketCategories.id))
        .leftJoin(comments, eq(tickets.id, comments.ticketId))
        .leftJoin(
            ticketViews,
            and(
                eq(tickets.id, ticketViews.ticketId),
                eq(ticketViews.userId, userId),
            ),
        )
        .groupBy(tickets.id, ticketCategories.name, ticketViews.lastViewedAt)
        .orderBy(desc(tickets.createdAt))
        .limit(perPage)
        .offset(offset);

    if (whereClause) {
        dataQuery.where(whereClause);
    }

    // Query de conteo total (sin joins de comments/views, solo cuenta tickets)
    const countQuery = db
        .select({ count: drizzleCount() })
        .from(tickets)
        .leftJoin(ticketCategories, eq(tickets.categoryId, ticketCategories.id));

    if (whereClause) {
        countQuery.where(whereClause);
    }

    const [rows, countResult] = await Promise.all([dataQuery, countQuery]);

    return {
        rows,
        totalCount: countResult[0]?.count ?? 0,
    };
}

/**
 * Resultado paginado de usuarios.
 */
export interface PaginatedUsersResult {
    rows: (typeof users.$inferSelect)[];
    totalCount: number;
}

/**
 * Query paginada de usuarios con búsqueda server-side.
 */
export async function queryUsersPaginated(
    search?: string,
    page = 1,
    perPage = 25,
): Promise<PaginatedUsersResult> {
    const offset = (page - 1) * perPage;

    const conditions: SQL[] = [];
    if (search) {
        const searchPattern = `%${search}%`;
        conditions.push(
            or(
                ilike(users.name, searchPattern),
                ilike(users.email, searchPattern),
            )!,
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const dataQuery = db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(perPage)
        .offset(offset);

    const countQuery = db
        .select({ count: drizzleCount() })
        .from(users);

    if (whereClause) {
        dataQuery.where(whereClause);
        countQuery.where(whereClause);
    }

    const [rows, countResult] = await Promise.all([dataQuery, countQuery]);

    return {
        rows,
        totalCount: countResult[0]?.count ?? 0,
    };
}

/**
 * Obtiene las opciones de filtro para las listas de tickets.
 * Retorna los usuarios asignados y categorías únicas dentro del scope dado.
 *
 * @param baseWhere - Condición base para acotar el scope (ej: tickets del usuario)
 */
export async function getTicketFilterOptions(baseWhere?: SQL) {
    const assignedQuery = db
        .selectDistinct({
            id: users.id,
            name: users.name,
        })
        .from(tickets)
        .innerJoin(users, eq(tickets.assignedToId, users.id));

    const categoryQuery = db
        .selectDistinct({
            id: ticketCategories.id,
            name: ticketCategories.name,
        })
        .from(tickets)
        .innerJoin(ticketCategories, eq(tickets.categoryId, ticketCategories.id));

    if (baseWhere) {
        assignedQuery.where(baseWhere);
        categoryQuery.where(baseWhere);
    }

    const [assignedUsers, categoriesList] = await Promise.all([
        assignedQuery,
        categoryQuery,
    ]);

    return { assignedUsers, categories: categoriesList };
}

/**
 * Obtiene el valor de una configuración de la aplicación.
 *
 * @param key - Clave de la configuración (ej: "allow_new_tickets")
 * @returns El valor como string, o null si no existe
 */
export async function getAppSetting(key: string): Promise<string | null> {
    const setting = await db.query.appSettings.findFirst({
        where: eq(appSettings.key, key),
    });
    return setting?.value ?? null;
}
