'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Mail, Lock, ArrowRight, Facebook, Chrome, CheckCircle2, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        try {
            // Save to real database
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email.toLowerCase().trim(),
                    password: formData.password,
                    role: 'USER',
                    status: 'ACTIVE'
                })
            });

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    role: 'USER'
                }));
                setSuccess(true);
                
                // Notify admin panel to refresh user list
                window.dispatchEvent(new Event('admin-user-updated'));

                setTimeout(() => {
                    router.push('/login?registered=true');
                }, 2000);
            } else {
                const error = await res.json();
                alert(error.error || 'Error al registrar usuario');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Error de conexión al servidor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setIsLoading(true);
        try {
            await signIn(provider.toLowerCase(), { callbackUrl: '/account' });
        } catch (error) {
            console.error('Registration error:', error);
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-[40px] p-12 text-center shadow-2xl border border-slate-100 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">¡Cuenta Creada!</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Bienvenido a la familia Dazlea. <br/>
                        Redirigiéndote para iniciar sesión...
                    </p>
                    <div className="mt-8 flex justify-center">
                        <div className="w-8 h-8 border-4 border-[#e996a0]/20 border-t-[#e996a0] rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center p-6">
            <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100">

                {/* Visual Side */}
                <div className="hidden lg:flex bg-[#e996a0] p-16 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full translate-y-1/3 -translate-x-1/4" />

                    <div className="relative z-10">
                        <Link href="/" className="text-white text-4xl font-black tracking-tighter mb-12 block">
                            Webtiendapp<span className="text-pink-400">.</span>
                        </Link>
                        <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                            Únete a la nueva era tecnológica.
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-pink-100/80 font-bold">
                                <CheckCircle2 size={20} className="text-pink-400" />
                                Mejores precios garantizados
                            </div>
                            <div className="flex items-center gap-3 text-pink-100/80 font-bold">
                                <CheckCircle2 size={20} className="text-pink-400" />
                                Catálogo exclusivo y premium
                            </div>
                            <div className="flex items-center gap-3 text-pink-100/80 font-bold">
                                <CheckCircle2 size={20} className="text-pink-400" />
                                Membresía con beneficios VIP
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-white/10">
                        <p className="text-pink-200/50 font-medium text-sm">© 2026 Webtiendapp Technologies. All rights reserved.</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 md:p-12 flex flex-col justify-center max-h-[100vh] overflow-y-auto">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#e996a0] mb-6">
                            <UserIcon size={24} />
                        </div>
                        <h1 className="text-[32px] font-black text-slate-900 tracking-tighter mb-2">Crear Cuenta</h1>
                        <p className="text-slate-400 font-medium">Sé parte de la comunidad tech de Webtiendapp.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Completo</label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 ring-pink-500/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="nombre@ejemplo.com"
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 ring-pink-500/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        required
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder="••••••••"
                                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 ring-pink-500/5 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Confirmar</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        required
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        placeholder="••••••••"
                                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 ring-pink-500/5 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className={`w-full h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${isLoading ? 'bg-slate-100 text-slate-400' : 'bg-[#e996a0] text-white hover:bg-slate-900 active:scale-95 shadow-pink-500/10'}`}
                        >
                            {isLoading ? 'Creando cuenta...' : (
                                <>
                                    Registrarme
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 bg-white px-4">
                            O únete con
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            disabled={isLoading}
                            onClick={() => handleSocialLogin('Google')}
                            className="h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm font-bold text-slate-600 text-[13px] active:scale-95 disabled:opacity-50"
                        >
                            <Chrome size={18} className="text-red-500" />
                            Google
                        </button>
                        <button 
                            disabled={isLoading}
                            onClick={() => handleSocialLogin('Facebook')}
                            className="h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm font-bold text-slate-600 text-[13px] active:scale-95 disabled:opacity-50"
                        >
                            <Facebook size={18} className="text-[#1877F2]" />
                            Facebook
                        </button>
                    </div>

                    <p className="mt-8 text-center text-slate-400 font-medium text-sm">
                        ¿Ya tienes cuenta? <Link href="/login" className="text-[#e996a0] font-black hover:underline">Inicia Sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
