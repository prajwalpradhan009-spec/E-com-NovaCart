import { Link } from "react-router-dom";
import { Star, StarHalf } from "lucide-react";
import { inr, discountPct } from "../lib/format";

export function Button({ variant = "primary", size = "md", className = "", as, to, ...props }) {
  const cls = `btn--${size} ${
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
      ? "btn-secondary"
      : variant === "danger"
      ? "btn-danger"
      : "btn-ghost"
  } ${className}`.trim();
  const Tag = to ? Link : "button";
  return <Tag to={to} className={cls} {...props} />;
}

export function Rating({ value = 4.5, count, size = 15, showValue = true, className = "" }) {
  const stars = [];
  const full = Math.floor(value);
  const half = value - full >= 0.4;
  for (let i = 0; i < full; i += 1) stars.push(<Star key={i} size={size} className="fill-amber-400 text-amber-400" />);
  if (half) stars.push(<StarHalf key="half" size={size} className="fill-amber-400 text-amber-400" />);
  for (let i = stars.length; i < 5; i += 1) stars.push(<Star key={`e-${i}`} size={size} className="text-slate-300 dark:text-slate-600" />);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-0.5">{stars}</span>
      {showValue && <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-[13px] text-ink-soft dark:text-ink-darkSoft">({count})</span>}
    </span>
  );
}

export function Badge({ children, color = "blue", className = "" }) {
  const map = { blue: "chip-blue", green: "chip-green", amber: "chip-amber", red: "chip-red", gray: "chip-gray" };
  return <span className={`${map[color]} ${className}`}>{children}</span>;
}

export function SaleBadge({ price, originalPrice, className = "" }) {
  const pct = discountPct(price, originalPrice);
  if (!pct) return null;
  return (
    <span className={`inline-flex items-center rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold text-white shadow-sm ${className}`}>
      {pct}% OFF
    </span>
  );
}

export function Price({ price, originalPrice, size = "md", className = "" }) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl"
  };
  const lines = originalPrice && price < originalPrice;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={`${sizes[size]} font-bold text-ink dark:text-ink-dark`}>{inr(price)}</span>
      {lines && (
        <span className={`${size === "sm" ? "text-xs" : "text-[13px]"} font-medium text-ink-soft/70 line-through`}>
          {inr(originalPrice)}
        </span>
      )}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, action, className = "" }) {
  return (
    <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-bold text-ink sm:text-3xl dark:text-ink-dark">{title}</h2>
        {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center dark:border-line-dark dark:bg-surface-dark">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink dark:text-ink-dark">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function QtyStepper({ value, onChange, min = 1, max = 99, size = "md" }) {
  const scale = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="inline-flex items-center overflow-hidden rounded-soft border border-line bg-white dark:border-line-dark dark:bg-surface-dark">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`${scale} flex items-center justify-center text-ink-soft transition-colors hover:bg-slate-50 hover:text-primary dark:text-ink-darkSoft dark:hover:bg-white/5`}
      >
        −
      </button>
      <span className="w-12 select-none text-center text-sm font-semibold text-ink dark:text-ink-dark">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`${scale} flex items-center justify-center text-ink-soft transition-colors hover:bg-slate-50 hover:text-primary dark:text-ink-darkSoft dark:hover:bg-white/5`}
      >
        +
      </button>
    </div>
  );
}