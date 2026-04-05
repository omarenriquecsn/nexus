import React, { useState } from 'react';
import type { Client } from '../../types'; // Importante: verbatimModuleSyntax
import api from '../../api/axios';
import { X, Save, Phone, Mail, User } from 'lucide-react';

interface Props {
  client: Client;
  onClose: () => void;
  onUpdate: (updated: Client) => void;
}

export const EditClientModal = ({ client, onClose, onUpdate }: Props) => {
  const [formData, setFormData] = useState({
    name: client.name,
    phone: client.phone || '',
    email: client.email || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.patch<Client>(`/clients/${client.id}`, formData);
      onUpdate(data);
      onClose();
    } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error al actualizar el cliente:", error.message);
        }
      alert("Error al actualizar datos. Verifica si el email ya existe.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z[-100] flex items-center justify-center p-4">
      <div className="bg-[#0E131F] border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-orange-500 font-black text-xs uppercase tracking-[0.2em]">Perfil del Cliente</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-600" size={18} />
              <input 
                className="w-full bg-slate-900 border border-slate-700 p-3 pl-10 rounded-xl text-white outline-none focus:border-orange-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">WhatsApp / Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-600" size={18} />
              <input 
                placeholder="+58 412..."
                className="w-full bg-slate-900 border border-slate-700 p-3 pl-10 rounded-xl text-white outline-none focus:border-orange-500"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-600" size={18} />
              <input 
                type="email"
                placeholder="cliente@ejemplo.com"
                className="w-full bg-slate-900 border border-slate-700 p-3 pl-10 rounded-xl text-white outline-none focus:border-orange-500"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <button className="w-full bg-orange-500 text-[#070B14] font-black py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 hover:bg-orange-400 shadow-lg shadow-orange-500/10 transition-all">
            <Save size={18} />
            ACTUALIZAR DATOS
          </button>
        </form>
      </div>
    </div>
  );
};