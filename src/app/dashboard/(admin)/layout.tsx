import { requireAdmin } from "@/lib/auth/helpers";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin(); // Autorización centralizada
    return <>{children}</>;
}
