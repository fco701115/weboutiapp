'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Mail, Lock, ArrowRight, Facebook, Chrome, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get('registered') === 'true';
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // If already logged in, redirect to account
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/account');
        }
    }, [status, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (result?.error) {
                // NextAuth returns the error message thrown in authorize() through result.error
                setError(result.error);
                setIsLoading(false);
            } else {
                // Fetch user info to update localStorage (redundant but consistent with existing structure)
                const res = await fetch('/api/users');
                const users = await res.json();
                const dbUser = Array.isArray(users) ? users.find((u: any) => u.email === email) : null;

                localStorage.setItem('user', JSON.stringify({
                    name: dbUser?.name || email.split('@')[0],
                    email: email,
                    role: dbUser?.role || 'USER'
                }));
                
                window.dispatchEvent(new Event('local-user-updated'));
                router.push('/account');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Ocurrió un error inesperado');
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setIsLoading(true);
        try {
            await signIn(provider.toLowerCase(), { callbackUrl: '/account' });
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center p-6">
            <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100">

                {/* Visual Side */}
                <div className="hidden lg:flex bg-[#e996a0] p-16 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full translate-y-1/3 -translate-x-1/4" />

                    <div className="relative z-10">
                        <Link href="/" className="text-white text-4xl font-black tracking-tighter mb-12 block">
                            Webshopapp<span className="text-pink-400">.</span>
                        </Link>
                        <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                            Bienvenido a la mejor tecnología.
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-blue-100/80 font-bold">
                                <CheckCircle2 size={20} className="text-pink-400" />
                                Envíos express en 24h
                            </div>
                            <div className="flex items-center gap-3 text-blue-100/80 font-bold">
                                <CheckCircle2 size={20} className="text-pink-400" />
                                Garantía premium oficial
                            </div>
                            <div className="flex items-center gap-3 text-blue-100/80 font-bold">
                                <CheckCircle2 size={20} className="text-pink-400" />
                                Soporte técnico especializado
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-white/10">
                        <p className="text-pink-200/50 font-medium text-sm">© 2026 Webshopapp Technologies. All rights reserved.</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center">
                    <div className="mb-10">
                        {isRegistered && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in slide-in-from-top-4 duration-500">
                                <CheckCircle2 size={20} />
                                <span className="text-sm font-bold">¡Cuenta creada con éxito! Inicia sesión para continuar.</span>
                            </div>
                        )}
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-500">
                                <AlertCircle size={20} className="shrink-0" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#e996a0] mb-6">
                            <LayoutGrid size={24} />
                        </div>
                        <h1 className="text-[32px] font-black text-slate-900 tracking-tighter mb-2">Iniciar Sesión</h1>
                        <p className="text-slate-400 font-medium">Ingresa a tu cuenta para gestionar tus pedidos.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nombre@ejemplo.com"
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 ring-pink-500/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between px-1">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
                                <button type="button" className="text-[11px] font-black text-[#e996a0] hover:underline uppercase tracking-tight">¿Olvido clave?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 ring-pink-500/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className={`w-full h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${isLoading ? 'bg-slate-100 text-slate-400' : 'bg-[#e996a0] text-white hover:bg-slate-900 active:scale-95 shadow-pink-500/10'}`}
                        >
                            {isLoading ? 'Verificando...' : (
                                <>
                                    Entrar
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 bg-white px-4">
                            O continuar con
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            disabled={isLoading}
                            onClick={() => handleSocialLogin('Google')}
                            className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm font-bold text-slate-600 text-[14px] active:scale-95 disabled:opacity-50"
                        >
                            <Chrome size={18} className="text-red-500" />
                            Google
                        </button>
                        <button 
                            disabled={isLoading}
                            onClick={() => handleSocialLogin('Facebook')}
                            className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm font-bold text-slate-600 text-[14px] active:scale-95 disabled:opacity-50"
                        >
                            <Facebook size={18} className="text-[#1877F2]" />
                            Facebook
                        </button>
                    </div>

                    <p className="mt-10 text-center text-slate-400 font-medium">
                        ¿No tienes cuenta? <Link href="/register" className="text-[#e996a0] font-black hover:underline">Regístrate gratis</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center p-6 text-slate-400 font-bold uppercase tracking-widest text-sm">
                Cargando...
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
