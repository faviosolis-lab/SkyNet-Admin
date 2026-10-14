import { useMemo } from 'react';
import type { Account } from '../types';
import { isPastOrCurrentMonth, calcDebt } from '../lib/utils';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { Users, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Activo: '#10B981',
  Inactivo: '#94A3B8',
  Suspendido: '#EF4444',
  Demorado: '#F59E0B',
  Pendiente: '#F97316',
};

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#94A3B8', '#F97316'];

function formatCurrency(val: number) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' })
    .format(val)
    .replace('PYG', 'Gs.');
}

interface Props {
  accounts: Account[];
  loading: boolean;
}

export default function Dashboard({ accounts, loading }: Props) {
  const stats = useMemo(() => {
    const totalDebt = accounts.reduce((sum, a) => sum + calcDebt(a), 0);
    const accountsInDebt = accounts.filter(a => calcDebt(a) > 0).length;
    const accountsUpToDate = accounts.length - accountsInDebt;

    const byStatus = Object.entries(
      accounts.reduce<Record<string, number>>((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    return { totalDebt, accountsInDebt, accountsUpToDate, byStatus };
  }, [accounts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B1741]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-5 md:mb-8">
        <p className="text-[12px] md:text-[13px] uppercase tracking-widest text-[#64748B] font-semibold">Panel de Control</p>
        <h1 className="text-[24px] md:text-[30px] font-black text-[#0F172A] mt-1">Dashboard</h1>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-8">
        <KpiCard
          icon={<Users size={20} />}
          label="Total Cuentas"
          value={accounts.length.toString()}
          color="bg-[#EEF2FF]"
          iconColor="text-[#4F46E5]"
        />
        <KpiCard
          icon={<DollarSign size={20} />}
          label="Deuda Total"
          value={formatCurrency(stats.totalDebt)}
          color="bg-[#FEF3C7]"
          iconColor="text-[#D97706]"
          small
        />
        <KpiCard
          icon={<AlertCircle size={20} />}
          label="Cuentas con Deuda"
          value={stats.accountsInDebt.toString()}
          color="bg-[#FEE2E2]"
          iconColor="text-[#DC2626]"
        />
        <KpiCard
          icon={<CheckCircle size={20} />}
          label="Cuentas al Día"
          value={stats.accountsUpToDate.toString()}
          color="bg-[#ECFDF5]"
          iconColor="text-[#059669]"
        />
      </div>

      <div className="mb-4 md:mb-6">
        {/* Pie chart: estado de cuentas */}
        <div className="bg-white rounded-[24px] md:rounded-[28px] p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-[#0F172A] mb-1">Distribución por Estado</h3>
          <p className="text-xs text-[#94A3B8] mb-4">Cantidad de cuentas por estado actual</p>
          {stats.byStatus.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.byStatus}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={4} dataKey="value" stroke="none"
                  >
                    {stats.byStatus.map((entry, i) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} cuentas`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos</p>
          )}
        </div>
      </div>

      {/* Deuda por cuota mensual */}
      <div className="bg-white rounded-[24px] md:rounded-[28px] p-4 md:p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Detalle de Deuda por Cuenta</h3>
        <p className="text-xs text-[#94A3B8] mb-5">Meses impagos × cuota mensual por cada cuenta con deuda</p>
        {stats.accountsInDebt === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No hay deudas registradas</p>
        ) : (
          <div className="space-y-3">
            {accounts
              .map(a => ({ ...a, debt: calcDebt(a), unpaid: a.paymentHistory.filter(p => isPastOrCurrentMonth(p.period) && (p.status === 'Pendiente' || p.status === 'Demorado')).length }))
              .filter(a => a.debt > 0)
              .sort((a, b) => b.debt - a.debt)
              .map(a => {
                const pct = stats.totalDebt > 0 ? (a.debt / stats.totalDebt) * 100 : 0;
                return (
                  <div key={a.id} className="flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-1.5">
                    <div className="flex-1 min-w-0 md:flex-none md:w-32">
                      <p className="text-[13px] font-bold text-[#0F172A] truncate">{a.name}</p>
                      <p className="text-[11px] text-[#94A3B8]">{a.unpaid} mes{a.unpaid !== 1 ? 'es' : ''} impago{a.unpaid !== 1 ? 's' : ''}</p>
                    </div>
                    <p className="text-[13px] font-bold text-[#0F172A] shrink-0 md:order-3 md:w-32 text-right">{formatCurrency(a.debt)}</p>
                    <div className="w-full md:w-auto md:flex-1 md:order-2 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[#0B1741] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, color, iconColor, small = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  iconColor: string;
  small?: boolean;
}) {
  return (
    <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start gap-3 md:gap-4">
      <div className={`${color} ${iconColor} p-2.5 md:p-3 rounded-2xl shrink-0`}>{icon}</div>
      <div className="min-w-0 w-full">
        <p className="text-[11px] md:text-[12px] font-semibold text-[#64748B] uppercase tracking-wide">{label}</p>
        <p className={`font-black text-[#0F172A] mt-1 leading-none truncate ${small ? 'text-[17px] md:text-[18px]' : 'text-[26px] md:text-[30px]'}`}>{value}</p>
      </div>
    </div>
  );
}
