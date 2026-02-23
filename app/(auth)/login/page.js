'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';

export default function LoginPage() {
    const { login, pb } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        alert('Intentando conectar a: ' + (pb?.baseUrl || 'URL no definida'));


        const result = await login(username, password);
        if (!result.success) {
            alert('ERROR: ' + (result.error || 'Desconocido')); // Native alert
            setError(result.error || 'Credenciales incorrectas o error en el servidor.');
            setLoading(false);
        } else {
            // Login successful
        }
    };

    return (
        <Card className="w-full shadow-lg border-border/60">
            <CardHeader className="space-y-4 flex flex-col items-center text-center pt-10 pb-2">
                <div className="w-full relative mb-2 px-7">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo-color.png"
                        alt="Logo Semana Santa"
                        className="object-contain w-full"
                    />
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="username"
                                type="text"
                                placeholder="Usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md text-center font-medium animate-fade-in">
                            {error}
                        </div>
                    )}

                    <Button className="w-full mt-4 font-semibold" type="submit" disabled={loading} size="lg">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verificando...
                            </>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center pb-8 pt-2">
                <p className="text-xs text-muted-foreground text-center">
                    &copy; {new Date().getFullYear()} - Developed by <a href="https://instagram.com/ivangomezfm" target="_blank" rel="noopener noreferrer">Ivan Gómez</a>
                </p>
            </CardFooter>
        </Card>
    );
}
