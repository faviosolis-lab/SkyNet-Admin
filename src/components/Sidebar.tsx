import { LayoutList, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';

type Page = 'dashboard' | 'accounts';

interface Props {
  activePage: Page;
  onPageChange: (p: Page) => void;
  userEmail: string;
  onLogout: () => void;
}

export default function Sidebar({ activePage, onPageChange, userEmail, onLogout }: Props) {
  return (
    <aside className="w-64 min-h-screen bg-[#0B1741] text-white flex flex-col p-6 shrink-0">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-white/10 p-2 rounded-xl">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h2 className="font-black text-lg leading-none">SkyNet</h2>
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase">Admin</p>
        </div>
      </div>

      <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Navegación</p>
      <nav className="flex flex-col gap-1.5">
        <button onClick={() => onPageChange('dashboard')}
          className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-medium transition-all ${activePage === 'dashboard' ? 'bg-white text-[#0B1741] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
          <LayoutDashboard size={18} strokeWidth={activePage === 'dashboard' ? 2.5 : 2} />
          Dashboard
        </button>
        <button onClick={() => onPageChange('accounts')}
          className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-medium transition-all ${activePage === 'accounts' ? 'bg-white text-[#0B1741] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
          <LayoutList size={18} strokeWidth={activePage === 'accounts' ? 2.5 : 2} />
          Cuentas
        </button>
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <p className="text-xs text-white/40 truncate mb-3">{userEmail}</p>
        <button onClick={onLogout}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
