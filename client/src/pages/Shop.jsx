import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Search, X, Check, ChevronDown, Inbox } from "lucide-react";
import { api } from "../lib/api";
import { PageLoader } from "../components/layout/Page";
import { PageHeader } from "../components/layout/Page";
import ProductCard from "../components/ProductCard";
import { EmptyState } from "../components/ui";

const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "popular", label: "Most popular" },
  { key: "rating", label: "Top rated" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" }
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const deal = params.get("deal") === "true";
  const sort = params.get("sort") || "featured";

  const [localQ, setLocalQ] = useState(q);

  useEffect(() => setLocalQ(q), [q]);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (q) sp.set("search", q);
    if (category) sp.set("category", category);
    if (deal) sp.set("deal", "true");
    if (sort !== "featured") sp.set("sort", sort);
    api.get(`/products?${sp.toString()}`).then((d) => {
      setProducts(d.products);
      setTotal(d.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [q, category, deal, sort]);

  useEffect(() => {
    api.get("/categories").then((d) => setCategories(d));
  }, []);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const activeFilters = [category, deal, q].filter(Boolean).length;

  const filterBody = (
    <div className="space-y-7">
      <FilterGroup title="Category">
        <div className="flex flex-col gap-1">
          <FilterRadio
            active={!category}
            onClick={() => update("category", "")}
            label="All categories"
          />
          {categories.map((c) => (
            <FilterRadio
              key={c.id}
              active={category === c.slug}
              onClick={() => update("category", c.slug)}
              label={c.name}
              count={c.productCount}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Offer">
        <div className="flex flex-col gap-1">
          <FilterRadio active={!deal} onClick={() => update("deal", "")} label="All products" />
          <FilterRadio active={deal} onClick={() => update("deal", deal ? "" : "true")} label="On deals" />
        </div>
      </FilterGroup>

      <div className="rounded-soft border border-primary/20 bg-primary-soft p-4 dark:bg-blue-500/10">
        <p className="text-sm font-semibold text-primary-dark dark:text-blue-300">Member pricing</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">
          Sign in to unlock an extra 5% off at checkout on every order.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Shop all products"
        subtitle="Every product in the NovaCart catalogue, filterable and sortable."
        crumbs={[{ label: "Shop" }]}
      />

      <div data-reveal className="shell grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-[110px] max-h-[calc(100vh-140px)] overflow-y-auto pr-1 hide-scrollbar">
            {filterBody}
          </div>
        </aside>

        <div>
          {/* Control bar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <form
              className="relative min-w-[220px] flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                update("q", localQ.trim());
              }}
            >
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
                placeholder="Search products…"
                className="field pl-10 pr-20"
              />
              {localQ && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalQ("");
                    update("q", "");
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-soft hover:text-ink"
                >
                  <X size={15} />
                </button>
              )}
            </form>

            <button
              onClick={() => setMobileFilters(true)}
              className="btn-secondary btn--md lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
            </button>

            <div className="relative">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="btn-secondary btn--md min-w-[180px] justify-between"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={15} />
                  {SORTS.find((s) => s.key === sort)?.label || "Featured"}
                </span>
                <ChevronDown size={15} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 animate-scale-in rounded-soft border border-line bg-surface p-1.5 shadow-lift dark:border-line-dark dark:bg-surface-dark">
                    {SORTS.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => {
                          update("sort", s.key === "featured" ? "" : s.key);
                          setSortOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-soft px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-slate-50 hover:text-primary dark:text-ink-dark dark:hover:bg-white/5"
                      >
                        {s.label}
                        {sort === s.key && <Check size={16} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="mb-5 text-[13px] text-ink-soft dark:text-ink-darkSoft">
            Showing <span className="font-semibold text-ink dark:text-ink-dark">{total}</span> products
            {category && <> in <span className="font-semibold text-primary">{category}</span></>}
            {q && <> matching “<span className="font-semibold text-primary">{q}</span>”</>}
          </p>

          {loading ? (
            <PageLoader />
          ) : products.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox size={28} />}
              title="No products found"
              message="Try a different search term or clear the filters to see everything we have."
              action={
                <button onClick={() => setParams({}, { replace: true })} className="btn-secondary btn--md">
                  Clear all filters
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileFilters ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${mobileFilters ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileFilters(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-surface p-5 shadow-pop transition-transform duration-300 dark:bg-surface-dark ${
            mobileFilters ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base font-bold text-ink dark:text-ink-dark">Filters</h3>
            <button
              onClick={() => setMobileFilters(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-soft text-ink-soft hover:bg-slate-100 hover:text-ink"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>
          {filterBody}
          <button onClick={() => setMobileFilters(false)} className="btn-primary btn--md mt-7 w-full">
            Show results
          </button>
        </div>
      </div>
    </>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">{title}</h4>
      {children}
    </div>
  );
}

function FilterRadio({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center justify-between gap-2 rounded-soft px-2.5 py-2 text-left text-sm transition-colors ${
        active ? "bg-primary-soft font-semibold text-primary-dark dark:bg-blue-500/10 dark:text-blue-300" : "text-ink-soft hover:bg-slate-50 hover:text-ink dark:text-ink-darkSoft dark:hover:bg-white/5"
      }`}
    >
      <span className="flex items-center gap-2">
        {active && <Check size={14} />}
        {label}
      </span>
      {count !== undefined && <span className="text-xs text-ink-soft/70">{count}</span>}
    </button>
  );
}