import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { PaymentHistory, PaymentStatusValue } from '../types';
import { updatePaymentStatus, addPeriod, deletePeriod } from '../services/paymentService';
import { formatPeriod, PAYMENT_STATUS_COLORS, MONTHS } from '../lib/utils';

interface Props {
  accountId: string;
  history: PaymentHistory[];
  onChange: (updated: PaymentHistory[]) => void;
}

const PAYMENT_STATUSES: PaymentStatusValue[] = ['Pagado', 'Pendiente', 'Demorado', 'Suspendido', 'Próximo'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export default function PaymentHistoryEditor({ accountId, history, onChange }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newMonth, setNewMonth] = useState('1');
  const [newYear, setNewYear] = useState(String(CURRENT_YEAR));
  const [newStatus, setNewStatus] = useState<PaymentStatusValue>('Próximo');
  const [addError, setAddError] = useState('');

  const sorted = [...history].sort((a, b) => a.period.localeCompare(b.period));

  const handleStatusChange = async (period: string, status: PaymentStatusValue) => {
    setBusy(period);
    try {
      await updatePaymentStatus(accountId, period, status);
      onChange(history.map(h => h.period === period ? { ...h, status } : h));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (period: string) => {
    if (!confirm(`¿Eliminar el período "${formatPeriod(period)}"?`)) return;
    setBusy(period);
    try {
      await deletePeriod(accountId, period);
      onChange(history.filter(h => h.period !== period));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(null);
    }
  };

  const handleAdd = async () => {
    const period = `${newYear}-01-${String(newMonth).padStart(2, '0')}`;
    if (history.some(h => h.period === period)) {
      setAddError('Ese período ya existe.');
      return;
    }
    setAddError('');
    setBusy('add');
    try {
      await addPeriod(accountId, period, newStatus);
      onChange([...history, { period, status: newStatus }]);
      setShowAdd(false);
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-[#0F172A]">Historial de Pagos</h3>
        <button onClick={() => { setShowAdd(!showAdd); setAddError(''); }}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#0B1741] hover:underline">
          <Plus size={15} /> Agregar período
        </button>
      </div>

      {showAdd && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mes</label>
            <select value={newMonth} onChange={e => setNewMonth(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1741]">
              {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Año</label>
            <select value={newYear} onChange={e => setNewYear(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1741]">
              {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as PaymentStatusValue)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1741]">
              {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={handleAdd} disabled={busy === 'add'}
            className="px-4 py-2 bg-[#0B1741] text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 disabled:opacity-60">
            {busy === 'add' ? 'Guardando...' : 'Agregar'}
          </button>
          {addError && <p className="w-full text-red-500 text-xs mt-1">{addError}</p>}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">Sin historial de pagos.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left text-gray-500">
                <th className="p-3 font-semibold">Período</th>
                <th className="p-3 font-semibold">Estado</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(h => (
                <tr key={h.period} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="p-3 font-medium text-[#0F172A]">{formatPeriod(h.period)}</td>
                  <td className="p-3">
                    <select value={h.status}
                      onChange={e => handleStatusChange(h.period, e.target.value as PaymentStatusValue)}
                      disabled={busy === h.period}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B1741] bg-white cursor-pointer disabled:opacity-50 ${PAYMENT_STATUS_COLORS[h.status]}`}>
                      {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(h.period)} disabled={busy === h.period}
                      className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
