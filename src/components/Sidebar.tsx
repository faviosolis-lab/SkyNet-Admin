import { LayoutList, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';

type Page = 'dashboard' | 'accounts';

interface Props {
  activePage: Page;
  onPageChange: (p: Page) => void;
  userEmail: string;
  onLogout: () => void;
}

const NAV_ITEMS: { page: Page; label: string; icon: typeof LayoutList }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'accounts', label: 'Cuentas', icon: LayoutList },
];

export default function Sidebar({ activePage, onPageChange, userEmail, onLogout }: Props) {
  return (
    <>
      {/* Desktop: sidebar lateral */}
      <aside className="hidden md:flex w-64 min-h-screen bg-[#0B1741] text-white flex-col p-6 shrink-0">
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
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
            <button key={page} onClick={() => onPageChange(page)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-medium transition-all ${activePage === page ? 'bg-white text-[#0B1741] shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
              <Icon size={18} strokeWidth={activePage === page ? 2.5 : 2} />
              {label}
            </button>
          ))}
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

      {/* Mobile: barra superior */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0B1741] text-white pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-white/10 p-1.5 rounded-lg shrink-0">
              <ShieldCheck size={18} />
            </div>
            <h2 className="font-black text-base leading-none">SkyNet <span className="text-white/50 text-[10px] font-semibold tracking-widest uppercase ml-1">Admin</span></h2>
          </div>
          <button onClick={onLogout} aria-label="Cerrar sesión" title={userEmail}
            className="flex items-center justify-center w-11 h-11 -mr-2 rounded-xl text-white/70 active:bg-white/10 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Mobile: navegación inferior */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-2">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const active = activePage === page;
            return (
              <button key={page} onClick={() => onPageChange(page)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-semibold transition-colors ${active ? 'text-[#0B1741]' : 'text-gray-400 active:text-gray-600'}`}>
                <span className={`flex items-center justify-center w-14 h-7 rounded-full transition-colors ${active ? 'bg-[#0B1741]/10' : ''}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
