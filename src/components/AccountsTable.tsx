import { useState, useMemo } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import type { Account } from '../types';
import { STATUS_COLORS } from '../lib/utils';

interface Props {
  accounts: Account[];
  loading: boolean;
  onSelect: (account: Account) => void;
  onNew: () => void;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(val).replace('PYG', 'Gs.');

export default function AccountsTable({ accounts, loading, onSelect, onNew }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filtered = useMemo(() => accounts.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.name.toLowerCase().includes(q) || a.accountNumber.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'Todos' || a.status === statusFilter;
    return matchSearch && matchStatus;
  }), [accounts, search, statusFilter]);

  return (
    <div className="p-8 flex-1">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Cuentas</h1>
            <p className="text-sm text-gray-500 mt-0.5">{accounts.length} cuentas en total</p>
          </div>
          <button onClick={onNew}
            className="flex items-center gap-2 bg-[#0B1741] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-opacity shadow-sm">
            <Plus size={16} /> Nueva cuenta
          </button>
        </div>

        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Buscar por nombre o número..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741]" />
          </div>
          <div className="relative w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741] appearance-none cursor-pointer">
              <option value="Todos">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Suspendido">Suspendido</option>
              <option value="Demorado">Demorado</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Cargando cuentas...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-500">
                  <th className="p-4 font-semibold">Cuenta</th>
                  <th className="p-4 font-semibold">Nro.</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-right">Tarifa</th>
                  <th className="p-4 font-semibold text-right">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">No se encontraron cuentas.</td></tr>
                ) : filtered.map(acc => {
                  const colors = STATUS_COLORS[acc.status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                  return (
                    <tr key={acc.id} onClick={() => onSelect(acc)}
                      className="border-b border-gray-100 last:border-0 hover:bg-blue-50/40 cursor-pointer transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-[#0F172A]">{acc.name}</span>
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-xs">{acc.accountNumber}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors.bg} ${colors.text}`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-[#0F172A]">{formatCurrency(acc.monthlyFee)}</td>
                      <td className="p-4 text-right text-gray-500">{acc.dueDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
