'use client';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="w-full min-h-screen bg-slate-50 py-12">
            <div className="max-w-[1200px] mx-auto px-4">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-[32px] md:text-[48px] font-black text-slate-900 tracking-tight mb-4">
                        Contacto y Ubicación
                    </h1>
                    <p className="text-slate-500 text-[16px] md:text-[18px]">
                        Estamos aquí para ayudarte. Contáctanos para consultar sobre productos, envíos, soporte técnico o cualquier otra duda.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

                    {/* Info de Contacto */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Botones independientes */}
                        <div className="flex gap-4 mb-2">
                            <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95 text-[14px]">
                                <MessageCircle size={18} />
                                WhatsApp
                            </a>
                            <a href="tel:+15551234567" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95 text-[14px]">
                                <Phone size={18} />
                                Llamar
                            </a>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-8">

                            <div>
                                <h3 className="text-[20px] font-bold text-slate-900 mb-6">Información General</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <Phone />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Teléfono</p>
                                            <p className="text-slate-500 mt-1">+1 (555) 123-4567</p>
                                            <p className="text-slate-500">+1 (555) 987-6543</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <Mail />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Correo Electrónico</p>
                                            <p className="text-slate-500 mt-1">soporte@tutienda.com</p>
                                            <p className="text-slate-500">ventas@tutienda.com</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <MapPin />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Ubicación Central</p>
                                            <p className="text-slate-500 mt-1">Av. Principal 1234, Ciudad Tecnológica, País</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <Clock />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Horario de Atención</p>
                                            <p className="text-slate-500 mt-1">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                                            <p className="text-slate-500">Sábado: 10:00 AM - 2:00 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Formulario de Contacto */}
                    <div className="lg:col-span-3">
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-[24px] font-bold text-slate-900 mb-8">Envíanos un Mensaje</h3>

                            <form className="space-y-6" onSubmit={async (e) => { 
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const data = {
                                    name: formData.get('name'),
                                    email: formData.get('email'),
                                    subject: formData.get('subject'),
                                    content: formData.get('content'),
                                };
                                
                                try {
                                    const res = await fetch('/api/messages', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data),
                                    });
                                    if (res.ok) {
                                        alert("¡Mensaje enviado con éxito!");
                                        (e.target as HTMLFormElement).reset();
                                    } else {
                                        alert("Error al enviar el mensaje.");
                                    }
                                } catch (error) {
                                    alert("Error de conexión.");
                                }
                            }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[14px] font-bold text-slate-700">Nombre Completo</label>
                                        <input
                                            name="name"
                                            type="text"
                                            placeholder="Ej: Juan Pérez"
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-[15px]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[14px] font-bold text-slate-700">Correo Electrónico</label>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="ejemplo@correo.com"
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-[15px]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Asunto</label>
                                    <input
                                        name="subject"
                                        type="text"
                                        placeholder="¿En qué podemos ayudarte?"
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-[15px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-slate-700">Mensaje</label>
                                    <textarea
                                        name="content"
                                        rows={5}
                                        placeholder="Escribe tu mensaje aquí..."
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-medium text-[15px]"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    Enviar Mensaje
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Mapa */}
                <div className="mt-12 rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white p-2">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15024.185624792078!2d-99.1352496!3d19.4319409!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce045b78eb28df%3A0x6bba3bc09e99dd5a!2sCentro%20Hist%C3%B3rico%20de%20la%20Cdad.%20de%20M%C3%A9xico%2C%20Centro%2C%20Ciudad%20de%20M%C3%A9xico%2C%20CDMX%2C%20Mexico!5e0!3m2!1sen!2sus!4v1703058880155!5m2!1sen!2sus"
                        width="100%"
                        height="450"
                        style={{ border: 0, borderRadius: '20px' }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>

            </div>
        </div>
    );
}
