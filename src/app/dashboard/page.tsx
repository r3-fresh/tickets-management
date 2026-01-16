import { getSession } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role === "admin") {
        redirect("/dashboard/admin");
    }

    redirect("/dashboard/tickets");
}
