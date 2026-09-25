import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, ShieldCheck, RefreshCw, Star, Clock, BadgeCheck, Zap } from "lucide-react";
import { api } from "../lib/api";
import { inr, formatNumber } from "../lib/format";
import { PageLoader } from "../components/layout/Page";
import { SectionHeading, Rating } from "../components/ui";
import ProductCard from "../components/ProductCard";
import ProductArt from "../components/ProductArt";
import CategoryCard from "../components/CategoryCard";
import CountdownTimer from "../components/CountdownTimer";

function Hero() {
  return (
    <section data-reveal className="relative overflow-hidden border-b border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35] dark:opacity-[0.15]" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div className="pointer-events-none absolute -bottom-52 -left-32 h-[400px] w-[400px] rounded-full bg-sky-400/10 blur-3xl" />

      <div className="shell relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-8 lg:py-20">
        {/* Copy */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary-dark dark:bg-blue-500/10 dark:text-blue-300">
            <Sparkles size={14} /> New season · Mega Deals live now
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Discover Products{" "}
            <span className="relative whitespace-nowrap text-primary">
              You'll Love
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 220 12" fill="none" preserveAspectRatio="none" height="10">
                <path d="M3 8c40-6 140-8 214-3" stroke="#2563EB" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft dark:text-ink-darkSoft">
            Premium products, seamless shopping, and reliable delivery — all in one place. Hand-picked tech, fashion and home essentials at honest prices.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/shop" className="btn-primary btn--lg">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/deals" className="btn-secondary btn--lg">
              Explore Deals
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-1.5 text-[13px] text-ink-soft dark:text-ink-darkSoft">
                <span className="font-semibold text-ink">4.8/5</span> from 12,000+ shoppers
              </p>
            </div>
            <div className="h-9 w-px bg-line dark:bg-line-dark" />
            <div>
              <p className="text-lg font-bold">10L+</p>
              <p className="text-[13px] text-ink-soft dark:text-ink-darkSoft">Products delivered</p>
            </div>
            <div className="h-9 w-px bg-line dark:bg-line-dark" />
            <div>
              <p className="text-lg font-bold">99.2%</p>
              <p className="text-[13px] text-ink-soft dark:text-ink-darkSoft">Order satisfaction</p>
            </div>
          </div>
        </div>

        {/* Composition */}
        <div className="relative mx-auto w-full max-w-lg animate-scale-in lg:max-w-none">
          <div className="relative">
            <div className="absolute inset-0 -z-10 scale-90 rounded-full bg-primary/15 blur-2xl dark:bg-primary/20" />
            <div className="overflow-hidden rounded-[28px] border border-line bg-gradient-to-br from-primary-soft/60 via-surface to-surface shadow-soft dark:border-line-dark dark:from-blue-500/[0.08] dark:via-surface-dark dark:to-surface-dark">
              <ProductArt
                image="https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85"
                alt="ProSound Wireless Headphones"
                art="headphones"
                accent="#2563EB"
                className="aspect-[4/3]"
              />
            </div>

            {/* Floating card: price */}
            <div className="absolute -left-3 top-8 hidden animate-float rounded-soft border border-line bg-surface/95 p-3.5 shadow-lift backdrop-blur sm:block dark:border-line-dark dark:bg-surface-dark/95" style={{ animationDelay: "0.3s" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">Wireless Headphones</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-ink dark:text-ink-dark">₹4,999</span>
                <span className="text-xs font-medium text-ink-soft line-through dark:text-ink-darkSoft">₹7,999</span>
              </div>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">
                38% OFF
              </span>
            </div>

            {/* Floating card: free shipping */}
            <div className="absolute -right-3 top-24 hidden animate-float rounded-soft border border-line bg-surface/95 p-3 shadow-lift backdrop-blur sm:block dark:border-line-dark dark:bg-surface-dark/95" style={{ animationDelay: "1.1s" }}>
              <span className="flex items-center gap-2 text-[13px] font-semibold text-ink dark:text-ink-dark">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Truck size={14} />
                </span>
                Free & fast delivery
              </span>
            </div>

            {/* Floating card: rating */}
            <div className="absolute -bottom-5 left-8 flex items-center gap-3 rounded-soft border border-line bg-surface/95 px-4 py-3 shadow-lift backdrop-blur dark:border-line-dark dark:bg-surface-dark/95">
              <Rating value={4.8} size={15} showValue />
              <span className="h-6 w-px bg-line dark:bg-line-dark" />
              <p className="text-[13px] font-medium text-ink-soft dark:text-ink-darkSoft">
                1,284 reviews <span className="block text-[11px]">verified buyers</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureStrip() {
  const features = [
    { icon: <Truck size={20} />, title: "Free & Fast Delivery", text: "On orders above ₹999, in 2–4 days" },
    { icon: <ShieldCheck size={20} />, title: "Secure Payments", text: "UPI, cards, net banking & COD" },
    { icon: <RefreshCw size={20} />, title: "Easy 7-Day Returns", text: "No-questions-asked returns" },
    { icon: <BadgeCheck size={20} />, title: "100% Genuine", text: "Authentic products, sealed pack" }
  ];
  return (
    <section data-reveal className="border-b border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <div className="shell grid grid-cols-1 gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <div key={f.title} className="flex items-start gap-3.5 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
              {f.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink dark:text-ink-dark">{f.title}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft dark:text-ink-darkSoft">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DealsBanner() {
  return (
    <section data-reveal className="shell py-14">
      <div className="relative overflow-hidden rounded-[24px] bg-[#0B1120] px-6 py-12 text-white shadow-pop sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-blue-100">
              <Zap size={14} /> Limited Time
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Mega Deals</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-300">
              Save more on products you love. Up to <span className="font-bold text-white">50% off</span> across electronics, fashion, gaming and more.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <CountdownTimer />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/deals" className="btn bg-white text-ink hover:bg-slate-100">
                Shop Mega Deals <ArrowRight size={16} />
              </Link>
              <Link to="/shop?deal=true" className="btn border border-white/20 bg-transparent text-white hover:bg-white/10">
                All Discounts
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <DealStats />
          </div>
        </div>
      </div>
    </section>
  );
}

function DealStats() {
  const [deals, setDeals] = useState(null);
  useEffect(() => {
    api
      .get("/deals")
      .then((d) => setDeals(Array.isArray(d.deals) ? d.deals.slice(0, 3) : []))
      .catch(() => setDeals([]));
  }, []);
  if (deals === null) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}</div>;
  }
  if (!deals.length) return null;
  return (
    <div className="grid gap-3">
      {deals.map((d, i) => {
        const pct = Math.round(((d.originalPrice - d.price) / d.originalPrice) * 100);
        return (
          <Link
            key={d.id}
            to={`/product/${d.slug || d.id}`}
            className="flex animate-fade-up items-center gap-4 rounded-soft border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur transition-all duration-200 hover:bg-white/[0.12]"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-soft border border-white/10">
              <ProductArt image={d.image || d.images?.[0]?.path} alt={d.name} art={d.art} accent={d.accent} className="h-full w-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{d.name}</p>
              <div className="mt-0.5 flex items-center gap-2 text-[13px]">
                <span className="font-bold">{inr(d.price)}</span>
                <span className="text-slate-400 line-through">{inr(d.originalPrice)}</span>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] font-bold text-red-300">-{pct}%</span>
              </div>
            </div>
            <ArrowRight size={16} className="shrink-0 text-slate-400" />
          </Link>
        );
      })}
    </div>
  );
}

function ReviewsBand() {
  const reviews = useMemo(
    () => [
      { name: "Ananya P.", role: "Verified buyer · Smart Watch", text: "Ordered on Monday, delivered Tuesday. Packaging was immaculate and the watch is even better in person. This is how e-commerce should feel." },
      { name: "Rohan K.", role: "Verified buyer · Headphones", text: "Genuinely impressed by the quality at this price. The noise cancellation rivals far pricier options. Support answered in minutes." },
      { name: "Meera N.", role: "Verified buyer · Laptop", text: "Smooth checkout, transparent pricing and the best deal I found anywhere. The NovaBook Pro is my daily driver now." }
    ],
    []
  );
  return (
    <section data-reveal className="border-t border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <div className="shell py-16">
        <SectionHeading eyebrow="Wall of love" title="Shoppers rate NovaCart highly" />
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={r.name} className="card card-hover p-6 animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-ink dark:text-ink-dark">“{r.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4 dark:border-line-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark dark:bg-blue-500/10 dark:text-blue-300">
                  {r.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-ink-dark">{r.name}</p>
                  <p className="text-xs text-ink-soft dark:text-ink-darkSoft">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.get("/products?sort=rating"),
      api.get("/categories"),
      api.get("/deals")
    ]).then(([p, c, d]) => {
      if (p.status === "fulfilled") setProducts(p.value.products.slice(0, 8));
      if (c.status === "fulfilled") setCategories(c.value);
      if (d.status === "fulfilled") setDeals(d.value.deals);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <>
        <div className="border-b border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
          <div className="shell grid items-center gap-10 py-16 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="skeleton h-6 w-52" />
              <div className="skeleton h-14 w-full" />
              <div className="skeleton h-14 w-3/4" />
              <div className="skeleton h-5 w-2/3" />
              <div className="flex gap-3 pt-2">
                <div className="skeleton h-12 w-32" />
                <div className="skeleton h-12 w-36" />
              </div>
            </div>
            <div className="skeleton h-96 w-full rounded-[28px]" />
          </div>
        </div>
        <PageLoader />
      </>
    );
  }

  const featured = products.slice(0, 4);
  const trending = products.slice(4, 8);

  return (
    <>
      <Hero />
      <FeatureStrip />

      {/* Featured — prominent, right after the hero */}
      <section data-reveal className="border-b border-line bg-surface py-16 dark:border-line-dark dark:bg-surface-dark">
        <div className="shell">
          <SectionHeading
            eyebrow="Best sellers"
            title="Featured products"
            subtitle="Our top-rated favourites — the products customers keep coming back to."
            action={
              <Link to="/shop" className="btn-secondary btn--sm">
                View all <ArrowRight size={15} />
              </Link>
            }
          />
          {products.length ? <ProductGrid products={featured} /> : <SectionFallback />}
        </div>
      </section>

      {/* Categories */}
      <section data-reveal className="shell py-16">
        <SectionHeading
          eyebrow="Browse by"
          title="Shop by category"
          subtitle="Eight curated departments, one premium experience."
          action={
            <Link to="/categories" className="btn-secondary btn--sm">
              All categories <ArrowRight size={15} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} />
          ))}
        </div>
      </section>

      {/* Deals */}
      <DealsBanner />

      {/* Trending */}
      <section data-reveal className="shell py-16">
        <SectionHeading
          eyebrow="Just dropped"
          title="Trending now"
          subtitle="Fresh arrivals moving fast — grab them while stock lasts."
        />
        {trending.length ? <ProductGrid products={trending} /> : <SectionFallback />}
      </section>

      <ReviewsBand />
    </>
  );
}

function SectionFallback() {
  return (
    <div className="rounded-soft border border-dashed border-line bg-surface px-6 py-12 text-center dark:border-line-dark">
      <p className="text-sm font-medium text-ink-soft dark:text-ink-darkSoft">
        Products couldn't be loaded right now. Please refresh to try again.
      </p>
      <Link to="/shop" className="btn-secondary btn--sm mt-4">
        Go to shop <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}