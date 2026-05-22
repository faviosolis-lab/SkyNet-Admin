import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import type { LinkedUser } from '../types';
import { getLinkedUsers, linkUserByEmail, unlinkUser } from '../services/linkingService';

interface Props {
  accountId: string;
}

export default function LinkedUsersPanel({ accountId }: Props) {
  const [users, setUsers] = useState<LinkedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    getLinkedUsers(accountId)
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [accountId]);

  const handleLink = async () => {
    if (!email.trim()) return;
    setLinking(true);
    setError('');
    setSuccess('');
    try {
      await linkUserByEmail(email.trim(), accountId);
      const updated = await getLinkedUsers(accountId);
      setUsers(updated);
      setEmail('');
      setSuccess(`Usuario "${email.trim()}" vinculado.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message?.includes('no encontrado')
        ? `No existe ningún usuario con el email "${email.trim()}".`
        : (err.message || 'No se pudo vincular el usuario.'));
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (userId: string, userEmail: string) => {
    if (!confirm(`¿Desvincular a ${userEmail}?`)) return;
    setError('');
    try {
      await unlinkUser(userId, accountId);
      setUsers(u => u.filter(x => x.user_id !== userId));
    } catch (err: any) {
      setError(err.message || 'Error al desvincular.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Users size={18} className="text-[#0B1741]" />
        <h3 className="font-bold text-[#0F172A]">Usuarios Vinculados</h3>
      </div>

      {/* Vincular nuevo usuario */}
      <div className="flex gap-2 mb-5">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLink()}
          placeholder="correo@ejemplo.com"
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741]"
        />
        <button
          onClick={handleLink}
          disabled={linking || !email.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0B1741] text-white rounded-xl text-sm font-semibold hover:bg-opacity-90 disabled:opacity-50 transition-opacity"
        >
          <UserPlus size={15} />
          {linking ? '...' : 'Vincular'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3 bg-red-50 p-3 rounded-xl">{error}</p>}
      {success && <p className="text-emerald-600 text-sm mb-3 bg-emerald-50 p-3 rounded-xl">{success}</p>}

      {/* Lista de usuarios */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-4">Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">Sin usuarios vinculados a esta cuenta.</p>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{u.email}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{u.role}</p>
              </div>
              <button
                onClick={() => handleUnlink(u.user_id, u.email)}
                className="text-gray-300 hover:text-red-500 transition-colors ml-3"
                title="Desvincular"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
