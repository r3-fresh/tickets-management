
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

interface UserAvatarProps {
    name?: string | null;
    image?: string | null;
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    xs: "h-5 w-5 text-[8px]",
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-12 w-12 text-sm",
} as const;

export function UserAvatar({ name, image, size = "sm", className }: UserAvatarProps) {
    const initials = name?.charAt(0)?.toUpperCase() || "U";

    return (
        <Avatar className={cn(sizeClasses[size], className)}>
            <AvatarImage
                src={image || undefined}
                alt={name || "Usuario"}
                referrerPolicy="no-referrer"
            />
            <AvatarFallback className="bg-muted-foreground/80 text-background font-bold">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
