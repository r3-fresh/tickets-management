import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user && (session.user as any).role === "admin") {
        redirect("/dashboard/agent");
    }

    redirect("/dashboard/tickets");
}
