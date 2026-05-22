import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onLogin: (email: string, id: string) => void;
}

function getFriendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  return msg;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) onLogin(data.user.email!, data.user.id);
    } catch (err: any) {
      setError(getFriendlyError(err.message || 'Error al iniciar sesión.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#0B1741] p-3 rounded-2xl mb-4 shadow-lg">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-[26px] font-black text-[#0F172A] tracking-tight">SkyNet Admin</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Panel de administración</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#0F172A]">Correo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@ejemplo.com" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#0B1741] focus:ring-4 focus:ring-[#0B1741]/10 outline-none transition-all font-medium text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#0F172A]">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#0B1741] focus:ring-4 focus:ring-[#0B1741]/10 outline-none transition-all font-medium text-sm" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#0B1741] disabled:opacity-70 text-white py-3.5 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-md mt-2 text-sm">
            {loading ? 'Ingresando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
