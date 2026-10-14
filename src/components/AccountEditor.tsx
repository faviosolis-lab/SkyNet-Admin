import { useState } from 'react';
import { Save, X, Trash2, AlertTriangle } from 'lucide-react';
import type { Account, AccountStatusValue } from '../types';
import { updateAccount, createAccount, deleteAccount } from '../services/accountService';

interface Props {
  account: Account | null; // null = new account
  onSave: (updated: Partial<Account> & { id?: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const STATUS_OPTIONS: AccountStatusValue[] = ['Activo', 'Inactivo', 'Suspendido', 'Demorado', 'Pendiente'];

export default function AccountEditor({ account, onSave, onCancel, onDelete }: Props) {
  const isNew = account === null;
  const [form, setForm] = useState({
    accountNumber: account?.accountNumber ?? '',
    name: account?.name ?? '',
    status: (account?.status ?? 'Activo') as AccountStatusValue,
    monthlyFee: account?.monthlyFee ?? 0,
    dueDate: account?.dueDate === '---' ? '' : (account?.dueDate ?? ''),
    comments: account?.comments ?? '',
    ruc: account?.ruc ?? '',
    billingEmail: account?.billingEmail ?? '',
    contactName: account?.contactName ?? '',
    contactPhone: account?.contactPhone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDirty = isNew || (
    form.accountNumber !== (account?.accountNumber ?? '')           ||
    form.name          !== (account?.name ?? '')                    ||
    form.status        !== (account?.status ?? 'Activo')            ||
    form.monthlyFee    !== (account?.monthlyFee ?? 0)               ||
    form.dueDate       !== (account?.dueDate === '---' ? '' : (account?.dueDate ?? '')) ||
    form.comments      !== (account?.comments ?? '')                ||
    form.ruc           !== (account?.ruc ?? '')                     ||
    form.billingEmail  !== (account?.billingEmail ?? '')            ||
    form.contactName   !== (account?.contactName ?? '')             ||
    form.contactPhone  !== (account?.contactPhone ?? '')
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const field = (label: string, key: keyof typeof form, type: 'text' | 'number' | 'select' = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {type === 'select' ? (
        <select value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-3 py-3 md:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741] bg-white">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key] as string | number}
          onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          className="w-full px-3 py-3 md:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741]" />
      )}
    </div>
  );

  const handleSave = async () => {
    if (!form.name.trim() || !form.accountNumber.trim()) {
      setError('Nombre y número de cuenta son obligatorios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        account_number: form.accountNumber,
        name: form.name,
        status: form.status,
        monthly_fee: form.monthlyFee,
        due_date: form.dueDate || '---',
        comments: form.comments,
        ruc: form.ruc || undefined,
        billing_email: form.billingEmail || undefined,
        contact_name: form.contactName || undefined,
        contact_phone: form.contactPhone || undefined,
      };
      if (isNew) {
        await createAccount(payload);
        onSave({});
      } else {
        await updateAccount(account!.id, payload);
        onSave({
          id: account!.id,
          accountNumber: form.accountNumber,
          name: form.name,
          status: form.status,
          monthlyFee: form.monthlyFee,
          dueDate: form.dueDate || '---',
          comments: form.comments,
          ruc: form.ruc,
          billingEmail: form.billingEmail,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!account || deleteConfirm !== account.name) return;
    setDeleting(true);
    try {
      await deleteAccount(account.id);
      onDelete?.();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la cuenta.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">

      {showDeleteModal && account && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
          <div className="bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl w-full max-w-md p-6 sm:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2.5 rounded-2xl">
                <AlertTriangle className="text-red-600" size={22} />
              </div>
              <h3 className="text-lg font-black text-[#0F172A]">Eliminar cuenta</h3>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              Esta acción es <span className="font-bold text-red-600">irreversible</span>. Se eliminarán todos los datos
              de la cuenta y su historial de pagos.
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Para confirmar, escribe el nombre de la cuenta:
              <span className="font-bold text-[#0F172A]"> {account.name}</span>
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Escribe el nombre exacto..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              autoFocus
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                className="px-4 py-3 sm:py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== account.name || deleting}
                className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={15} />
                {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-3 md:mb-5">
        <h3 className="font-bold text-[#0F172A]">{isNew ? 'Nueva Cuenta' : 'Datos de la Cuenta'}</h3>
        <button onClick={onCancel} aria-label="Cerrar" className="flex items-center justify-center w-10 h-10 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {field('Nombre', 'name')}
        {field('Número de Cuenta', 'accountNumber')}
        {field('Estado', 'status', 'select')}
        {field('Tarifa Mensual (Gs.)', 'monthlyFee', 'number')}
        {field('Vencimiento', 'dueDate')}
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Comentarios</label>
        <textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} rows={3}
          className="w-full px-3 py-3 md:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741] resize-none" />
      </div>

      <div className="mb-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-bold text-[#0B1741] uppercase tracking-widest mb-3">Datos del Cliente</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">RUC</label>
            <input type="text" value={form.ruc} onChange={e => setForm(f => ({ ...f, ruc: e.target.value }))}
              placeholder="Ej: 80012345-6"
              className="w-full px-3 py-3 md:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Correo para Facturas</label>
            <input type="email" value={form.billingEmail} onChange={e => setForm(f => ({ ...f, billingEmail: e.target.value }))}
              placeholder="facturacion@empresa.com"
              className="w-full px-3 py-3 md:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741]" />
          </div>
        </div>
        <p className="text-xs font-bold text-[#0B1741] uppercase tracking-widest mb-1">Contacto en Sitio</p>
        <p className="text-xs text-gray-400 mb-3">Persona presente en la ubicación del equipo instalado</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre de Contacto</label>
            <input type="text" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
              placeholder="Juan López"
              className="w-full px-3 py-3 md:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Teléfono de Contacto</label>
            <input type="tel" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
              placeholder="0981 123 456"
              className="w-full px-3 py-3 md:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1741]" />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 md:gap-2">
        <div>
          {!isNew && (
            <button
              onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); }}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 md:py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors"
            >
              <Trash2 size={15} />
              Eliminar cuenta
            </button>
          )}
        </div>
        <div className="flex flex-col-reverse md:flex-row gap-2">
          <button onClick={onCancel}
            className="px-4 py-3 md:py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!isDirty || saving}
            className="flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-[#0B1741] text-white rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
            <Save size={15} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
