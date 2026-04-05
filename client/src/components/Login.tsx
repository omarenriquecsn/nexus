import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { KeyRound, Mail, Loader2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Credenciales inválidas o error de conexión.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nexus-dark p-6">
      <div className="glass-card p-8 rounded-3xl w-full max-w-md border-t-4 border-nexus-accent">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter text-white">
            NEXUS <span className="text-nexus-accent">CORE</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Terminal de Acceso Restringido</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email del Técnico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-slate-900 border border-slate-700 p-3 pl-10 rounded-xl focus:border-nexus-accent outline-none text-white transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contraseña</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-900 border border-slate-700 p-3 pl-10 rounded-xl focus:border-nexus-accent outline-none text-white transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-bold uppercase animate-pulse">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-nexus-accent py-4 rounded-xl font-black uppercase text-white hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'INICIAR SESIÓN'}
          </button>
        </form>
      </div>
    </div>
  );
};