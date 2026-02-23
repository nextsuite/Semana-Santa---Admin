import { cn } from "@/lib/utils";

export function Badge({
    children,
    variant = "default",
    className
}) {
    const variants = {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        primary: "bg-primary/15 text-primary hover:bg-primary/25",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive/15 text-destructive hover:bg-destructive/25",
        outline: "text-foreground",
        success: "bg-green-100 text-green-700 hover:bg-green-100/80", // Keep for specific status
        warning: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80",
        danger: "bg-red-100 text-red-700 hover:bg-red-100/80",
        purple: "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
        blue: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
    };

    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent",
            variants[variant],
            className
        )}>
            {children}
        </div>
    );
}
