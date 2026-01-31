import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function () {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user) {
        redirect("/dashboard");
    }

    return <LoginForm />;
}
