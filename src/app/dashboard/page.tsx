import { getSession } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";

export default async function () {
    const session = await getSession();

    if (!session?.user) {
        redirect("/login");
    }

    // Admins go to their control panel
    if (session.user.role === "admin") {
        redirect("/dashboard/panel");
    }

    // Agents and regular users: redirect to mis-tickets for now
    // In the future, this could be a unified home page
    redirect("/dashboard/mis-tickets");
}
