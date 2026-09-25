import { X } from "lucide-react";

export function StatCard({ label, value, delta, icon, trend, accent = "#2563EB" }) {
  const up = trend && trend >= 0;
  return (
    <div className="card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-ink-soft dark:text-ink-darkSoft">{label}</p>
          <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink dark:text-ink-dark">{value}</p>
        </div>
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-soft"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          {icon}
        </span>
      </div>
      {delta !== undefined && (
        <p className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${delta === 0 ? "bg-slate-100 text-ink-soft dark:bg-white/5 dark:text-ink-darkSoft" : up ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"}`}>
          {delta === 0 ? "— steady" : `${up ? "▲" : "▼"} ${Math.abs(delta)}%`} <span className="font-medium opacity-70">vs last month</span>
        </p>
      )}
    </div>
  );
}

export function PageTitle({ title, subtitle, action }) {
  return (
    <div data-reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl dark:text-ink-dark">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft dark:text-ink-darkSoft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    Processing: "chip-blue",
    Shipped: "chip-amber",
    Delivered: "chip-green",
    Cancelled: "chip-red",
    Active: "chip-green",
    New: "chip-blue",
    Pending: "chip-amber"
  };
  return <span className={map[status] || "chip-gray"}>{status}</span>;
}

export function Modal({ open, title, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto px-4 py-10">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${wide ? "max-w-2xl" : "max-w-md"} animate-scale-in rounded-card border border-line bg-surface shadow-pop dark:border-line-dark dark:bg-surface-dark`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-line-dark">
          <h2 className="text-base font-bold text-ink dark:text-ink-dark">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="inline-flex h-9 w-9 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onClose, loading }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary btn--sm">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger btn--sm">
          {loading ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Toolbar({ children }) {
  return <div className="mb-5 flex flex-wrap items-center gap-3">{children}</div>;
}

export function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center text-sm text-ink-soft">{message}</td>
    </tr>
  );
}