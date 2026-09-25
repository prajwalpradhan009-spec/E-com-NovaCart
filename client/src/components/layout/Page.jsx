import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function PageHeader({ eyebrow, title, subtitle, crumbs = [] }) {
  return (
    <div data-reveal className="border-b border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <div className="shell py-12 sm:py-16">
        <nav className="mb-4 flex items-center gap-1.5 text-[13px] text-ink-soft dark:text-ink-darkSoft" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronRight size={13} />
              {c.to ? (
                <Link to={c.to} className="transition-colors hover:text-primary">
                  {c.label}
                </Link>
              ) : (
                <span className="font-medium text-ink dark:text-ink-dark">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="max-w-2xl text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">{subtitle}</p>}
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="shell py-20">
      <div className="space-y-6">
        <div className="skeleton h-10 w-64" />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-square w-full rounded-none" />
              <div className="space-y-3 p-4">
                <div className="skeleton h-3.5 w-1/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}