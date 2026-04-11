
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';

export default function AdminLoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.user ) {
            const role = (session.user as any).role;
            if (role === 'SUPER_ADMIN' || role === 'EDITOR') {
                router.push('/admin');
            } else {
                setError('No tienes permisos para acceder a esta área.');
            }
        }
    }, [status, session, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl: '/admin'
            });


            if (result?.error) {
                console.error('Login error:', result.error);
                setError(result.error === 'CredentialsSignin' ? 'Credenciales inválidas' : result.error);
                setIsLoading(false);
            }
 else {
                // NextAuth should handle the session update
                // The useEffect will handle the redirection if role is correct
                // BUT we need to make sure credentials provider is configured if they want passwords
                
                // For now, let's also allow Social login if they are Admins
                // But the user asked for a "login for admin panel".
            }
        } catch (err) {
            setError('Ocurrió un error al intentar iniciar sesión.');
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            <div className="w-full max-w-[450px] animate-in fade-in zoom-in duration-500">
                <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-800/10">
                    <div className="p-10">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-16 h-16 bg-blue-600 rounded-[20px] flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20">
                                <ShieldCheck size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Admin Panel</h1>
                            <p className="text-slate-400 font-bold text-sm">Ingreso exclusivo para Administradores y Editores</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-500">
                                <AlertCircle size={20} />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email Profesional</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@empresa.com"
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Clave de Acceso</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={isLoading}
                                className={`w-full h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${isLoading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-slate-900 active:scale-95 shadow-blue-500/20'}`}
                            >
                                {isLoading ? 'Autenticando...' : (
                                    <>
                                        Entrar al Panel
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                    </div>
                    
                    <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                        <button 
                            onClick={() => router.push('/')}
                            className="text-[12px] font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowRight size={14} className="rotate-180" />
                            Regresar a la tienda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
