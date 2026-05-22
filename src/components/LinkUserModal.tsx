import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import type { LinkedUser } from '../types';
import { getLinkedUsers, linkUserByEmail, unlinkUser } from '../services/linkingService';

interface Props {
  accountId: string;
  accountName: string;
  onClose: () => void;
}

export default function LinkUserModal({ accountId, accountName, onClose }: Props) {
  const [users, setUsers] = useState<LinkedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
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
      setSuccess(`Usuario "${email.trim()}" vinculado correctamente.`);
    } catch (err: any) {
      setError(err.message || 'No se pudo vincular el usuario.');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (userId: string, userEmail: string) => {
    if (!confirm(`¿Desvincular a ${userEmail} de esta cuenta?`)) return;
    try {
      await unlinkUser(userId, accountId);
      setUsers(u => u.filter(x => x.user_id !== userId));
    } catch (err: any) {
      setError(err.message || 'Error al desvincular.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-[#0F172A]">Usuarios vinculados</h3>
            <p className="text-sm text-gray-500 mt-0.5">{accountName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Link new user */}
          <div className="flex gap-2 mb-5">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              onKeyDown={e => e.key === 'Enter' && handleLink()}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741]" />
            <button onClick={handleLink} disabled={linking || !email.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0B1741] text-white rounded-xl text-sm font-semibold hover:bg-opacity-90 disabled:opacity-60 transition-opacity">
              <UserPlus size={15} />
              {linking ? '...' : 'Vincular'}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mb-3 bg-red-50 p-3 rounded-xl">{error}</p>}
          {success && <p className="text-emerald-600 text-sm mb-3 bg-emerald-50 p-3 rounded-xl">{success}</p>}

          {/* Linked users list */}
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-4">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Sin usuarios vinculados.</p>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{u.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{u.role}</p>
                  </div>
                  <button onClick={() => handleUnlink(u.user_id, u.email)}
                    className="text-gray-300 hover:text-red-500 transition-colors ml-2">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
