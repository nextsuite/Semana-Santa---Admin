export default function AuthLayout({ children }) {
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-muted/20 p-4">
            <div className="w-full max-w-md">
                {children}
            </div>
        </main>
    );
}
