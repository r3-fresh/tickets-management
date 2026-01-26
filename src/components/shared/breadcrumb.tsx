import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link
                href="/dashboard"
                className="hover:text-foreground transition-colors flex items-center gap-1"
            >
                <Home className="h-4 w-4" />
                Inicio
            </Link>

            {items.map((item, index) => (
                <Fragment key={index}>
                    <ChevronRight className="h-4 w-4" />
                    {item.href && index < items.length - 1 ? (
                        <Link
                            href={item.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className={index === items.length - 1 ? "text-foreground font-medium" : ""}>
                            {item.label}
                        </span>
                    )}
                </Fragment>
            ))}
        </nav>
    );
}
