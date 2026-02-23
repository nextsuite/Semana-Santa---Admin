export default function PageWrapper({ children, title, subtitle, action }) {
    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between border-b border-border pb-5">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && (
                    <div className="mt-4 sm:mt-0">
                        {action}
                    </div>
                )}
            </div>

            <div className="animate-fade-in">
                {children}
            </div>
        </div>
    );
}

