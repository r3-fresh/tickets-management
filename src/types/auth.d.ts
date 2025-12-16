import type { Session, User } from "better-auth/types";

declare module "better-auth/types" {
    interface User {
        role: string;
    }

    interface Session {
        user: User & {
            role: string;
        };
    }
}
