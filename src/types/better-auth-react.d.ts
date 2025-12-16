import "better-auth/react";

declare module "better-auth/react" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
            role: string;
        };
    }
}
