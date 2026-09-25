import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp } from "lucide-react";
import { api } from "../../lib/api";
import { inr } from "../../lib/format";
import ProductArt from "../ProductArt";
import { Skeleton } from "../ui";

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popular, setPopular] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const timer = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      api.get("/products?sort=popular").then((d) => setPopular(d.products.slice(0, 5))).catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    clearTimeout(timer.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const d = await api.get(`/products?search=${encodeURIComponent(query)}`);
        setResults(d.products);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer.current);
  }, [query, open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const go = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-20 sm:pt-28">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-card border border-line bg-surface shadow-pop dark:border-line-dark dark:bg-surface-dark">
        <form
          className="flex items-center gap-3 border-b border-line px-5 py-4 dark:border-line-dark"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              onClose();
              navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
            }
          }}
        >
          <Search size={20} className="shrink-0 text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories, brands…"
            className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-soft/60 focus:outline-none dark:text-ink-dark"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="text-ink-soft hover:text-ink">
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hidden rounded border border-line px-2.5 py-1 text-xs font-medium text-ink-soft sm:block dark:border-line-dark"
          >
            ESC
          </button>
        </form>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            results.length ? (
              results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => go(p.id)}
                  className="flex w-full items-center gap-3 rounded-soft p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-soft border border-line dark:border-line-dark">
                    <ProductArt image={p.image || p.images?.[0]?.path} alt={p.name} art={p.art} accent={p.accent} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink dark:text-ink-dark">{p.name}</p>
                    <p className="text-xs text-ink-soft dark:text-ink-darkSoft">
                      ★ {p.rating.toFixed(1)} · {inr(p.price)}
                    </p>
                  </div>
                  <Search size={16} className="shrink-0 text-ink-soft/50" />
                </button>
              ))
            ) : (
              <p className="px-4 py-10 text-center text-sm text-ink-soft dark:text-ink-darkSoft">
                No products found for “{query}”.
              </p>
            )
          ) : (
            <div className="p-2">
              <p className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">
                <TrendingUp size={14} /> Popular right now
              </p>
              <div className="space-y-0.5">
                {popular.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => go(p.id)}
                    className="flex w-full items-center justify-between rounded-soft px-2 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <span className="truncate text-sm font-medium text-ink dark:text-ink-dark">{p.name}</span>
                    <span className="ml-3 shrink-0 text-xs font-semibold text-ink-soft dark:text-ink-darkSoft">{inr(p.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}