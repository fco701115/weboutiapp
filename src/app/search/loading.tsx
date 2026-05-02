import { Search } from 'lucide-react';

export default function Loading() {
    return (
        <div className="bg-[#f7f9fa] min-h-screen">
            <div className="max-w-[1200px] mx-auto px-4 py-10 animate-pulse">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-4">
                        <div className="h-10 w-64 bg-gray-200 rounded-lg" />
                        <div className="h-4 w-32 bg-gray-100 rounded" />
                    </div>
                    <div className="h-14 w-48 bg-gray-200 rounded-[24px]" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-10">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl h-[350px] border border-gray-100 p-4 space-y-4">
                            <div className="w-full aspect-square bg-gray-100 rounded-xl" />
                            <div className="h-4 w-3/4 bg-gray-100 rounded" />
                            <div className="h-4 w-1/2 bg-gray-100 rounded" />
                            <div className="h-8 w-1/3 bg-gray-200 rounded mt-4" />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-2xl border border-white flex items-center gap-3 animate-bounce">
                    <Search className="text-[#e996a0] animate-spin" size={20} />
                    <span className="font-black text-[#e996a0] uppercase tracking-widest text-[12px]">Buscando...</span>
                </div>
            </div>
        </div>
    );
}
