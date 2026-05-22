import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { ADMIN_EMAIL } from './lib/utils';
import type { Account, PaymentHistory } from './types';
import { fetchAllAccounts } from './services/accountService';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AccountsTable from './components/AccountsTable';
import AccountEditor from './components/AccountEditor';
import PaymentHistoryEditor from './components/PaymentHistoryEditor';
import LinkedUsersPanel from './components/LinkedUsersPanel';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

type Page = 'dashboard' | 'accounts';
type View = 'list' | 'detail';
interface User { id: string; email: string; }

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [view, setView] = useState<View>('list');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    setLoadError('');
    try {
      const data = await fetchAllAccounts();
      setAccounts(data);
    } catch (err: any) {
      setLoadError('No se pudieron cargar las cuentas: ' + (err.message || ''));
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser({ id: session.user.id, email: session.user.email! });
      setLoadingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) setUser({ id: session.user.id, email: session.user.email! });
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) loadAccounts();
  }, [user, loadAccounts]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActivePage('dashboard');
    setView('list');
    setSelectedAccount(null);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B1741]" />
      </div>
    );
  }

  if (!user) return <Login onLogin={(email, id) => setUser({ id, email })} />;

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-4">
        <div className="bg-red-100 p-4 rounded-full"><AlertTriangle className="text-red-600" size={36} /></div>
        <h2 className="text-xl font-bold text-[#0F172A]">Acceso denegado</h2>
        <p className="text-gray-500 text-sm">Tu cuenta no tiene permisos de administración.</p>
        <button onClick={handleLogout} className="text-sm text-[#0B1741] underline font-medium">Cerrar sesión</button>
      </div>
    );
  }

  const handleSelectAccount = (acc: Account) => {
    setSelectedAccount(acc);
    setShowNewForm(false);
    setView('detail');
  };

  const handleNewAccount = () => {
    setSelectedAccount(null);
    setShowNewForm(true);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedAccount(null);
    setShowNewForm(false);
  };

  const handleAccountSaved = async (updated: Partial<Account> & { id?: string }) => {
    await loadAccounts();
    if (updated.id) {
      setSelectedAccount(prev => prev ? { ...prev, ...updated } : null);
    } else {
      setView('list');
    }
  };

  const handleHistoryChange = (updatedHistory: PaymentHistory[]) => {
    if (!selectedAccount) return;
    const updated = { ...selectedAccount, paymentHistory: updatedHistory };
    setSelectedAccount(updated);
    setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const handlePageChange = (p: Page) => {
    setActivePage(p);
    setView('list');
    setSelectedAccount(null);
    setShowNewForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar activePage={activePage} onPageChange={handlePageChange} userEmail={user.email} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        {activePage === 'dashboard' && (
          <Dashboard accounts={accounts} loading={loadingAccounts} />
        )}

        {activePage === 'accounts' && view === 'list' && (
          <>
            {loadError && (
              <div className="m-6 flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100">
                <AlertTriangle size={18} className="shrink-0" />
                <span className="text-sm font-medium">{loadError}</span>
                <button onClick={loadAccounts} className="ml-auto text-sm underline">Reintentar</button>
              </div>
            )}
            <AccountsTable
              accounts={accounts}
              loading={loadingAccounts}
              onSelect={handleSelectAccount}
              onNew={handleNewAccount}
            />
          </>
        )}

        {activePage === 'accounts' && view === 'detail' && (
          <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-6">
              <button onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-[#0B1741] text-sm font-medium transition-colors">
                <ChevronLeft size={18} /> Volver a cuentas
              </button>
            </div>

            <div className="space-y-5">
              {showNewForm && !selectedAccount ? (
                <AccountEditor account={null} onSave={handleAccountSaved} onCancel={handleBack} />
              ) : selectedAccount ? (
                <>
                  <AccountEditor account={selectedAccount} onSave={handleAccountSaved} onCancel={handleBack} onDelete={() => { handleBack(); loadAccounts(); }} />
                  <PaymentHistoryEditor
                    accountId={selectedAccount.id}
                    history={selectedAccount.paymentHistory}
                    onChange={handleHistoryChange}
                  />
                  <LinkedUsersPanel accountId={selectedAccount.id} />
                </>
              ) : null}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
