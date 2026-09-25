import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, Flame } from "lucide-react";
import { api } from "../lib/api";
import { inr } from "../lib/format";
import { PageHeader, PageLoader } from "../components/layout/Page";
import ProductCard from "../components/ProductCard";
import ProductArt from "../components/ProductArt";
import CountdownTimer from "../components/CountdownTimer";

export default function Deals() {
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState([]);
  const [headliner, setHeadliner] = useState(null);
  const [endsAt, setEndsAt] = useState(null);

  useEffect(() => {
    api.get("/deals").then((d) => {
      const sorted = [...d.deals].sort((a, b) => {
        const ap = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const bp = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return bp - ap;
      });
      setDeals(d.deals);
      setHeadliner(sorted[0] || null);
      setEndsAt(d.endsAt);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Deals" title="Mega Deals" subtitle="Limited-time discounts on our most-loved products." crumbs={[{ label: "Deals" }]} />
        <PageLoader />
      </>
    );
  }

  const pct = headliner?.originalPrice ? Math.round(((headliner.originalPrice - headliner.price) / headliner.originalPrice) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Limited time"
        title="Mega Deals"
        subtitle="Big discounts on the products people love most — while stock and time last."
        crumbs={[{ label: "Deals" }]}
      />

      <div data-reveal className="shell py-10">
        {/* Headliner */}
        {headliner && (
          <Link
            to={`/product/${headliner.slug || headliner.id}`}
            className="group relative mb-10 block overflow-hidden rounded-[24px] border border-line bg-[#0B1120] text-white shadow-pop dark:border-line-dark"
          >
            <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 right-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
            <div className="relative grid items-center gap-8 p-7 sm:p-10 md:grid-cols-2 lg:p-14">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3.5 py-1.5 text-xs font-bold text-red-300">
                  <Flame size={14} /> Deal of the day
                </span>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">{headliner.name}</h2>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-300">{headliner.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-extrabold">{inr(headliner.price)}</span>
                  <span className="text-lg font-medium text-slate-400 line-through">{inr(headliner.originalPrice)}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#0B1120]">{pct}% OFF</span>
                </div>
                <div className="mt-7 flex items-center gap-4">
                  <CountdownTimer endsAt={endsAt} />
                </div>
                <span className="mt-8 inline-flex items-center gap-2 rounded-soft bg-white px-6 py-3 text-sm font-bold text-ink transition-transform group-hover:-translate-y-0.5">
                  Grab this deal <ArrowRight size={16} />
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 -z-10 scale-90 rounded-full bg-primary/25 blur-3xl" />
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                  <ProductArt image={headliner.image || headliner.images?.[0]?.path} alt={headliner.name} art={headliner.art} accent={headliner.accent} className="aspect-[4/3]" />
                </div>
                <span className="absolute -top-3 right-4 animate-float rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  Save {inr(headliner.originalPrice - headliner.price)}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* All deals */}
        <div className="mb-6 flex items-center gap-2">
          <Zap size={20} className="text-primary" />
          <h2 className="text-xl font-bold text-ink dark:text-ink-dark">All discounted products</h2>
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {deals.length} live
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}