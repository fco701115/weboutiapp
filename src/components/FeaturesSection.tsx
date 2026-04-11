import { Headphones, Lock, Truck, ThumbsUp } from 'lucide-react';

export function FeaturesSection() {
    const features = [
        {
            icon: <Headphones size={24} className="text-gray-600" />,
            title: "Chat en vivo 24/7",
            subtitle: "Obtén asistencia instantánea en cualquier momento",
        },
        {
            icon: <Lock size={24} className="text-amber-500" />,
            title: "Pago Seguro",
            subtitle: "Multiple safe payment methods"
        },
        {
            icon: <Truck size={24} className="text-orange-500" />,
            title: "Envío Exprés",
            subtitle: "Fast & reliable delivery options"
        },
        {
            icon: <ThumbsUp size={24} className="text-amber-400" />,
            title: "Productos de alta calidad",
            subtitle: "Disfruta de productos de alta calidad a precios más bajos"
        }
    ];

    return (
        <div className="w-full bg-[#f8f5ff] py-12">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-purple-100 flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center sm:text-left gap-3 sm:gap-4 hover:shadow-md transition-shadow cursor-default group">
                            {/* Circle icon container */}
                            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#2e1065] flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                <div className="scale-90 sm:scale-100">{f.icon}</div>
                            </div>

                            {/* Text container */}
                            <div className="flex flex-col">
                                <h3 className="text-[14px] sm:text-[16px] font-bold text-[#2e1065] leading-tight">
                                    {f.title}
                                </h3>
                                <p className="text-[10px] sm:text-[12px] text-gray-500 mt-0.5 sm:mt-1 line-clamp-2">
                                    {f.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
