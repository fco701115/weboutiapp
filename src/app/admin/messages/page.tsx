'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Mail, Search, Trash2, CheckCircle, Clock, X, Eye, Inbox, Archive, Send, Filter, User, Calendar } from 'lucide-react';

export default function AdminMessages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');

    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const sendReply = async () => {
        if (!replyText.trim()) return;
        setIsSending(true);
        try {
            // Aquí simularíamos el envío de email
            // Por ahora, solo marcamos como respondido o guardamos un log
            console.log('Enviando respuesta a:', selectedMessage.email, 'Contenido:', replyText);
            
            // Podríamos actualizar el estado del mensaje si tuviéramos un estado 'REPLIED'
            // await updateStatus(selectedMessage.id, 'READ'); 

            alert(`Respuesta enviada a ${selectedMessage.name} (${selectedMessage.email})`);
            setReplyText('');
        } catch (error) {
            alert('Error al enviar la respuesta');
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages?_t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setMessages(data);
            } else {
                setMessages([]);
            }
        } catch (error) {
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        if (!id) return;
        
        // Optimistic update for the messages list
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
        
        // Optimistic update for the selected detail view
        setSelectedMessage((current: any) => {
            if (current && current.id === id) {
                return { ...current, status };
            }
            return current;
        });

        try {
            const res = await fetch(`/api/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            
            if (!res.ok) {
                console.error('Failed to update status on server');
                fetchMessages(); // Revert to server state on failure
            }
        } catch (error) {
            console.error('Network error during status update:', error);
            fetchMessages(); // Revert on network error
        }
    };



    const deleteMessage = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este mensaje?')) return;
        try {
            const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchMessages();
                setSelectedMessage(null);
            }
        } catch (error) {
            alert('Error deleting message');
        }
    };

    const filteredMessages = (Array.isArray(messages) ? messages : []).filter(msg => {
        const matchesSearch = 
            msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (msg.subject && msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
            msg.content.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === 'ALL') return matchesSearch;
        return matchesSearch && msg.status === activeTab;
    });



    const getStatusColor = (status: string) => {
        switch (status) {
            case 'UNREAD': return 'bg-blue-100 text-blue-700';
            case 'READ': return 'bg-emerald-100 text-emerald-700';
            case 'ARCHIVED': return 'bg-slate-100 text-slate-500';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'UNREAD': return 'No leído';
            case 'READ': return 'Leído';
            case 'ARCHIVED': return 'Archivado';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[24px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Mail className="text-blue-600" />
                        Bandeja de Mensajes
                    </h2>
                    <p className="text-slate-500 text-[14px]">Gestiona las consultas y contactos de tus clientes.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                {/* List Sidebar */}
                <div className={`w-full lg:w-[400px] bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col overflow-hidden ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>

                    <div className="p-5 border-b border-slate-100 bg-slate-50/30 space-y-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar mensajes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-11 pr-4 bg-white border border-slate-100 rounded-2xl text-[14px] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'UNREAD', 'READ', 'ARCHIVED'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                                        activeTab === tab 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                        : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                                    }`}
                                >
                                    {tab === 'ALL' ? 'Todos' : tab === 'UNREAD' ? 'Nuevos' : tab === 'READ' ? 'Leídos' : 'Archivados'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
                                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-slate-400 font-bold text-[13px]">Cargando mensajes...</p>
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="p-10 text-center flex flex-col items-center gap-3">
                                <Inbox size={40} className="text-slate-100" />
                                <p className="text-slate-400 font-bold text-[14px]">No hay mensajes.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (msg.status === 'UNREAD') updateStatus(msg.id, 'READ');
                                        }}
                                        className={`p-5 cursor-pointer transition-all hover:bg-blue-50/30 group relative ${
                                            selectedMessage?.id === msg.id ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateStatus(msg.id, msg.status === 'UNREAD' ? 'READ' : 'UNREAD');
                                                }}
                                                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl transition-all shadow-sm active:scale-95 ${getStatusColor(msg.status)}`}
                                            >
                                                {getStatusLabel(msg.status)}
                                            </button>
                                            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                                                <Clock size={12} className="text-slate-300" />
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className={`text-[14px] leading-tight mb-1 truncate ${msg.status === 'UNREAD' ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                                            {msg.name}
                                        </h3>
                                        <p className="text-[13px] text-slate-500 font-medium truncate">
                                            {msg.subject || 'Sin asunto'}
                                        </p>
                                        <p className="text-[12px] text-slate-400 mt-2 line-clamp-1">
                                            {msg.content}
                                        </p>
                                        
                                        {selectedMessage?.id === msg.id && (
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className={`
                    ${selectedMessage ? 'fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:flex-1' : 'hidden lg:flex lg:flex-1'} 
                    bg-white lg:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col
                `}>
                    {selectedMessage ? (

                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Header */}
                            <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-3 lg:gap-4">
                                    <button 
                                        onClick={() => setSelectedMessage(null)}
                                        className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        <ArrowLeft size={24} />

                                    </button>
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[3px] shadow-lg shadow-blue-500/10">

                                        <div className="w-full h-full rounded-[13px] bg-white flex items-center justify-center font-black text-[20px] text-blue-600 uppercase">
                                            {selectedMessage.name.substring(0, 2)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-black text-[20px] text-slate-900 leading-none">{selectedMessage.name}</h3>
                                        <span className="text-[13px] font-bold text-slate-400 mt-1">{selectedMessage.email}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => updateStatus(selectedMessage.id, selectedMessage.status === 'ARCHIVED' ? 'READ' : 'ARCHIVED')}
                                        className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm"
                                        title={selectedMessage.status === 'ARCHIVED' ? 'Desarchivar' : 'Archivar'}
                                    >
                                        <Archive size={20} />
                                    </button>
                                    <button 
                                        onClick={() => deleteMessage(selectedMessage.id)}
                                        className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Bar */}
                            <div className="px-8 py-4 bg-white border-b border-slate-50 flex items-center gap-8">
                                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                    <User size={14} className="text-slate-300" />
                                    <span>Remitente</span>
                                </div>
                                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Calendar size={14} className="text-slate-300" />
                                    <span>Recibido: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
                                <div className="max-w-3xl">
                                    {selectedMessage.subject && (
                                        <h4 className="text-[24px] font-black text-slate-900 mb-6 leading-tight">
                                            {selectedMessage.subject}
                                        </h4>
                                    )}
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-slate-600 text-[16px] leading-relaxed whitespace-pre-wrap">
                                            {selectedMessage.content}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Reply Input */}
                            <div className="p-8 border-t border-slate-100 bg-slate-50/30">
                                <div className="flex flex-col gap-4">
                                    <textarea 
                                        placeholder={`Responder a ${selectedMessage.name}...`}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        disabled={isSending}
                                        className="w-full h-32 p-4 bg-white border border-slate-100 rounded-[20px] text-[14px] font-medium resize-none focus:ring-4 ring-blue-500/5 outline-none transition-all shadow-inner disabled:opacity-50"
                                    />
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={sendReply}
                                            disabled={isSending || !replyText.trim()}
                                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSending ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send size={18} />
                                            )}
                                            {isSending ? 'Enviando...' : 'Enviar Respuesta'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-6">
                            <div className="w-24 h-24 rounded-[40px] bg-slate-50 flex items-center justify-center text-slate-200">
                                <Mail size={48} />
                            </div>
                            <div className="max-w-xs space-y-2">
                                <h3 className="text-[20px] font-black text-slate-900">Selecciona un mensaje</h3>
                                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                                    Selecciona un mensaje de la bandeja de entrada para ver el contenido completo y responder.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
