import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, SquarePlus, X } from 'lucide-react';

interface Props {
  appName: string;
  /** Clases de posición en móvil, para quedar por encima de la barra de navegación inferior. */
  mobileBottomClass: string;
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 2500;

// El evento puede dispararse antes de que el banner se monte (p. ej. durante el login),
// por eso se captura a nivel de módulo y los componentes se suscriben.
let deferredPrompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const wasDismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

export default function InstallBanner({ appName, mobileBottomClass }: Props) {
  const [, rerender] = useState(0);
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(wasDismissedRecently);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    const l = () => rerender((n) => n + 1);
    listeners.add(l);
    const t = setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => {
      listeners.delete(l);
      clearTimeout(t);
    };
  }, []);

  const ios = isIOS();
  const visible = ready && !dismissed && !isStandalone() && (deferredPrompt !== null || ios);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* sin almacenamiento: se oculta solo en esta sesión */
    }
    setDismissed(true);
  };

  const install = async () => {
    if (!deferredPrompt) {
      if (showIosSteps) dismiss();
      else setShowIosSteps(true);
      return;
    }
    const evt = deferredPrompt;
    deferredPrompt = null;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === 'dismissed') dismiss();
    notify();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label={`Instalar ${appName}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className={`fixed inset-x-4 ${mobileBottomClass} md:inset-x-auto md:bottom-6 md:right-6 md:w-96 z-40 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4`}
        >
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <img src="/icon-192.png" alt="" className="w-12 h-12 rounded-xl shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-[#0F172A] leading-tight">Instala {appName}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Entra más rápido desde tu pantalla de inicio, como una app, sin abrir el navegador.
              </p>
            </div>
          </div>

          {showIosSteps && ios && (
            <ol className="mt-3 space-y-2 text-sm text-[#0F172A] bg-[#F8FAFC] rounded-xl p-3">
              <li className="flex items-center gap-2">
                <span className="font-semibold">1.</span> Toca <Share size={16} className="text-[#0B1741] shrink-0" aria-label="Compartir" /> en la barra de Safari
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">2.</span> Elige <SquarePlus size={16} className="text-[#0B1741] shrink-0" aria-hidden />
                <span className="font-medium">Añadir a pantalla de inicio</span>
              </li>
            </ol>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={install}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0B1741] text-white font-semibold rounded-xl py-3 px-4 active:scale-[0.98] transition-transform"
            >
              {deferredPrompt ? (
                <>
                  <Download size={18} aria-hidden /> Instalar
                </>
              ) : showIosSteps ? (
                'Entendido'
              ) : (
                'Cómo instalar'
              )}
            </button>
            <button onClick={dismiss} className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
              Ahora no
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
