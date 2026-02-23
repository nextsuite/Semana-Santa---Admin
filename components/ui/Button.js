import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Button({
    className,
    variant = "primary",
    size = "default",
    isLoading = false,
    children,
    disabled,
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary: "bg-white text-foreground border border-input hover:bg-accent hover:text-accent-foreground shadow-sm",
        ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes = {
        sm: "h-9 px-3 text-xs",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10 p-0",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
