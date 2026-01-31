import { requireAgent } from "@/lib/auth/helpers";

export default async function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAgent(); // Autorización centralizada
    return <>{children}</>;
}
