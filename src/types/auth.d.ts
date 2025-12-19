import type { Session, User } from "better-auth/types";
import type { UserRole } from "./index";

declare module "better-auth/types" {
    interface User {
        role: UserRole;
    }

    interface Session {
        user: User & {
            role: UserRole;
        };
    }
}
