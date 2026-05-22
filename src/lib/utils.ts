export function getDisplayName(email: string): string {
  return email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Usuario';
}

export const ADMIN_EMAIL = 'favio.solis.gonzalez@gmail.com';

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Activo:     { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  Inactivo:   { bg: 'bg-amber-100',   text: 'text-amber-800' },
  Suspendido: { bg: 'bg-red-100',     text: 'text-red-800' },
  Demorado:   { bg: 'bg-orange-100',  text: 'text-orange-800' },
  Pendiente:  { bg: 'bg-yellow-100',  text: 'text-yellow-800' },
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Pagado:     'text-emerald-600',
  Próximo:    'text-gray-400',
  Pendiente:  'text-amber-600',
  Demorado:   'text-red-600',
  Suspendido: 'text-red-800',
};

export const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function formatPeriod(periodStr: string): string {
  if (periodStr.includes('/')) {
    const parts = periodStr.split('/');
    if (parts.length === 2) return `${MONTHS[parseInt(parts[0], 10) - 1] ?? parts[0]} ${parts[1]}`;
    if (parts.length === 3) return `${MONTHS[parseInt(parts[1], 10) - 1] ?? parts[1]} ${parts[2]}`;
  }
  if (periodStr.includes('-')) {
    const parts = periodStr.split('-');
    if (parts.length === 3) return `${MONTHS[parseInt(parts[2], 10) - 1] ?? parts[2]} ${parts[0]}`;
    if (parts.length === 2) return `${MONTHS[parseInt(parts[1], 10) - 1] ?? parts[1]} ${parts[0]}`;
  }
  return periodStr;
}
