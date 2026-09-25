import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

let seed = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(({ title, message, type = "success", icon, duration = 3200 }) => {
    const id = ++seed;
    setToasts((t) => [...t, { id, title, message, type, icon }]);
    if (duration) setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const toast = useCallback(
    (title, message, type = "success") => push({ title, message, type }),
    [push]
  );

  const value = { toast, push, dismiss };

  const icons = {
    success: <CheckCircle2 size={18} className="text-success" />,
    info: <Info size={18} className="text-primary" />,
    warn: <AlertTriangle size={18} className="text-warn" />,
    error: <AlertTriangle size={18} className="text-danger" />
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-soft border border-line bg-surface p-4 shadow-lift animate-toast-in dark:border-line-dark dark:bg-surface-dark"
          >
            <span className="mt-0.5 shrink-0">{t.icon || icons[t.type]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink dark:text-ink-dark">{t.title}</p>
              {t.message && <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">{t.message}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded p-1 text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}