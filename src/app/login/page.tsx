import { auth } from "@/lib/auth/server";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user) {
        redirect("/dashboard");
    }

    // Get Application Status
    const setting = await db.query.appSettings.findFirst({
        where: eq(appSettings.key, "allow_new_tickets")
    });

    // Default to true if setting doesn't exist, otherwise parse value
    // The value is stored as a JSON string "true" or "false"
    const isSystemOperational = setting ? setting.value === "true" : true;

    return <LoginForm isSystemOperational={isSystemOperational} />;
}
