import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function Select({ className, ...props }) {
    return (
        <div className="relative">
            <select
                className={cn(
                    "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:border-ring/50 pr-8 cursor-pointer",
                    className
                )}
                {...props}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                <ChevronDown className="h-4 w-4" />
            </div>
        </div>
    );
}
