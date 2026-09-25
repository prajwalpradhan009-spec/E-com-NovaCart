import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart, ShoppingCart, Zap, Truck, ShieldCheck, RefreshCw, Check, Minus, Plus,
  PackageCheck, Send, ChevronDown, Star, BadgeCheck, MessageSquare
} from "lucide-react";
import { api } from "../lib/api";
import { inr, formatDate } from "../lib/format";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import ProductArt from "../components/ProductArt";
import ProductCard from "../components/ProductCard";
import { Rating, SaleBadge, Badge } from "../components/ui";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("description");

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setQty(1);
    setTab("description");
    api.get(`/products/${id}`).then((d) => {
      setProduct(d.product);
      setRelated(d.related || []);
      setLoading(false);
      return api.get(`/products/${id}/reviews`);
    }).then((r) => {
      setReviews(r.reviews || []);
    }).catch(() => {
      setLoading(false);
      setNotFound(true);
    });
  }, [id]);

  const wished = product ? inWishlist(product.id) : false;
  const savings = product?.originalPrice ? product.originalPrice - product.price : 0;
  const pct = product?.originalPrice ? Math.round((savings / product.originalPrice) * 100) : 0;

  const thumbnails = useMemo(() => {
    if (!product) return [];
    const productImages = (product.images || [])
      .filter((item) => item.path)
      .map((item, index) => ({ image: item.path, label: item.alt || `View ${index + 1}` }));
    if (productImages.length) return productImages;
    if (product.image) return [{ image: product.image, label: product.name }];
    return [
      { art: product.art, accent: product.accent, label: "Front" },
      { art: product.art, accent: product.accent, label: "Detail", scale: 1.6, offset: "15% 30%" },
      { art: product.art, accent: product.accent, label: "Side", scale: 1.3, offset: "30% 50%" }
    ];
  }, [product]);

  if (loading) {
    return (
      <div data-reveal className="shell grid gap-10 py-12 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="skeleton aspect-square w-full rounded-card" />
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 w-24" />)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-12 w-56" />
          <div className="skeleton h-24 w-full" />
          <div className="flex gap-3">
            <div className="skeleton h-14 w-40" />
            <div className="skeleton h-14 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="shell flex flex-col items-center py-24 text-center">
        <PackageCheck size={40} className="text-ink-soft" />
        <h1 className="mt-4 text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-sm text-ink-soft">The product you're looking for isn't available.</p>
        <Link to="/shop" className="btn-primary btn--md mt-6">Back to shop</Link>
      </div>
    );
  }

  const handleAdd = () => addToCart(product, qty, toast);
  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate("/checkout");
  };

  const reviewScore = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : product.rating;

  return (
    <div data-reveal className="shell py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-soft dark:text-ink-darkSoft" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronDown size={12} className="-rotate-90" />
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <ChevronDown size={12} className="-rotate-90" />
        <Link to={`/shop?category=${product.categoryId}`} className="hover:text-primary capitalize">{product.categoryId.replace("-", " ")}</Link>
        <ChevronDown size={12} className="-rotate-90" />
        <span className="line-clamp-1 font-medium text-ink dark:text-ink-dark">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-card border border-line shadow-soft dark:border-line-dark">
            <div className="flex items-center gap-2 absolute left-4 top-4 z-10">
              {product.badge && <Badge>{product.badge}</Badge>}
              {pct > 0 && <SaleBadge price={product.price} originalPrice={product.originalPrice} />}
            </div>
            <button
              onClick={() => toggleWishlist(product, toast)}
              aria-label="Toggle wishlist"
              className={`absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-surface/90 backdrop-blur transition-all duration-200 hover:scale-105 active:scale-95 dark:bg-surface-dark/90 ${
                wished ? "border-danger/30 text-danger" : "border-line text-ink-soft hover:text-danger dark:border-line-dark"
              }`}
            >
              <Heart size={20} className={wished ? "fill-danger" : ""} />
            </button>
            <div
              className="aspect-square transition-transform duration-500"
              style={{ transform: `scale(${thumbnails[activeThumb]?.scale || 1})`, transformOrigin: thumbnails[activeThumb]?.offset || "center" }}
            >
              <ProductArt image={thumbnails[activeThumb].image} alt={product.name} art={thumbnails[activeThumb].art} accent={thumbnails[activeThumb].accent} className="h-full w-full" />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            {thumbnails.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActiveThumb(i)}
                aria-label={`View ${t.label} image`}
                className={`h-20 w-24 overflow-hidden rounded-soft border-2 transition-all duration-200 ${
                  activeThumb === i ? "border-primary" : "border-line hover:border-primary/40 dark:border-line-dark"
                }`}
              >
                <div
                  className="h-full w-full"
                  style={{ transform: `scale(${t.scale || 1})`, transformOrigin: t.offset || "center" }}
                >
                  <ProductArt image={t.image} alt={t.label} art={t.art} accent={t.accent} className="h-full w-full" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Rating value={reviewScore} count={product.reviewCount} size={16} />
            <span className="text-[13px] text-ink-soft">·</span>
            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-soft dark:text-ink-darkSoft">
              <BadgeCheck size={14} className="text-success" /> Verified seller
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">{product.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-extrabold tracking-tight">{inr(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg font-medium text-ink-soft line-through dark:text-ink-darkSoft">{inr(product.originalPrice)}</span>
                <span className="rounded-full bg-danger/10 px-3 py-1 text-sm font-bold text-danger">{pct}% OFF</span>
              </>
            )}
          </div>
          {savings > 0 && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-success">
              <Zap size={14} /> You save {inr(savings)} today
            </p>
          )}

          {/* Features */}
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(product.features || []).slice(0, 6).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink dark:text-ink-dark">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
                  <Check size={12} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* Qty + stock */}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <div>
              <p className="field-label mb-2">Quantity</p>
              <div className="inline-flex items-center overflow-hidden rounded-soft border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease" className="h-12 w-12 flex items-center justify-center text-ink-soft transition-colors hover:bg-slate-50 hover:text-primary dark:hover:bg-white/5">
                  <Minus size={16} />
                </button>
                <span className="w-14 text-center text-base font-bold text-ink dark:text-ink-dark">{qty}</span>
                <button onClick={() => setQty(Math.min(Math.max(1, product.stock), qty + 1))} aria-label="Increase" className="h-12 w-12 flex items-center justify-center text-ink-soft transition-colors hover:bg-slate-50 hover:text-primary dark:hover:bg-white/5">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div>
              <p className="field-label mb-2">Availability</p>
              <p className={`text-sm font-semibold ${product.stock > 10 ? "text-success" : "text-warn"}`}>
                {product.stock > 10 ? `In stock (${product.stock} available)` : `Only ${product.stock} left — hurry`}
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button onClick={handleAdd} className="btn-secondary btn--lg w-full border-primary/40 text-primary hover:bg-primary-soft dark:border-primary/50">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} className="btn-primary btn--lg w-full">
              <Zap size={18} /> Buy Now
            </button>
          </div>

          {/* Trust */}
          <div className="mt-7 grid grid-cols-3 gap-3 rounded-soft border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
            {[
              { icon: <Truck size={19} />, text: "Free delivery over ₹999" },
              { icon: <RefreshCw size={19} />, text: "7-day easy returns" },
              { icon: <ShieldCheck size={19} />, text: "Secure payments" }
            ].map((t) => (
              <div key={t.text} className="flex flex-col items-center gap-2 text-center">
                <span className="text-primary">{t.icon}</span>
                <p className="text-[12px] font-medium leading-tight text-ink-soft dark:text-ink-darkSoft">{t.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">{product.shipping}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex flex-wrap gap-1 border-b border-line dark:border-line-dark">
          {[
            { key: "description", label: "Description" },
            { key: "specifications", label: "Specifications" },
            { key: "reviews", label: `Reviews (${reviews.length})` },
            { key: "shipping", label: "Shipping & Returns" }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-5 py-3.5 text-sm font-semibold transition-colors ${
                tab === t.key ? "text-primary" : "text-ink-soft hover:text-ink dark:text-ink-darkSoft"
              }`}
            >
              {t.label}
              {tab === t.key && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === "description" && (
            <div className="max-w-3xl animate-fade-in">
              <p className="text-[15px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">{product.longDescription || product.description}</p>
              {(product.features || []).length > 0 && (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {product.features.map((f) => (
                    <div key={f} className="flex items-center gap-3 rounded-soft border border-line bg-surface px-4 py-3 text-sm font-medium text-ink dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark">
                      <Check size={16} className="shrink-0 text-success" /> {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "specifications" && (
            <div className="max-w-3xl animate-fade-in overflow-hidden rounded-soft border border-line dark:border-line-dark">
              {Object.entries(product.specs || {}).map(([k, v], i) => (
                <div key={k} className={`grid grid-cols-2 gap-3 px-5 py-3.5 text-sm ${i % 2 ? "" : "bg-slate-50/70 dark:bg-white/[0.03]"}`}>
                  <span className="font-medium text-ink-soft dark:text-ink-darkSoft">{k}</span>
                  <span className="font-semibold text-ink dark:text-ink-dark">{v}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "reviews" && <ReviewsTab product={product} reviews={reviews} setReviews={setReviews} />}

          {tab === "shipping" && (
            <div className="max-w-3xl animate-fade-in space-y-4">
              {[
                { icon: <Truck size={21} />, title: "Delivery", text: product.shipping },
                { icon: <RefreshCw size={21} />, title: "Returns", text: "You can return items within 7 days of delivery for a full refund, provided they're unused and in original packaging." },
                { icon: <ShieldCheck size={21} />, title: "Warranty", text: "This product includes a 1-year manufacturer warranty covering defects in materials and workmanship." }
              ].map((s) => (
                <div key={s.title} className="flex gap-4 rounded-soft border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
                    {s.icon}
                  </span>
                  <div>
                    <h4 className="font-semibold text-ink dark:text-ink-dark">{s.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-6 text-xl font-bold text-ink dark:text-ink-dark">You may also like</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsTab({ product, reviews, setReviews }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const distribution = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      d[Math.round(r.rating) - 1] += 1;
    });
    return d;
  }, [reviews]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return;
    setSubmitting(true);
    try {
      const d = await api.post(`/products/${product.id}/reviews`, {
        user: "You",
        rating: form.rating,
        title: form.title,
        comment: form.comment
      });
      setReviews((r) => [d.review, ...r]);
      setForm({ rating: 5, title: "", comment: "" });
      toast("Review posted", "Thanks for sharing your feedback.");
    } catch (err) {
      toast("Couldn't post review", err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid animate-fade-in gap-10 lg:grid-cols-[300px_1fr]">
      {/* Summary */}
      <div>
        <div className="rounded-soft border border-line bg-surface p-6 text-center dark:border-line-dark dark:bg-surface-dark">
          <p className="text-4xl font-extrabold">{avg.toFixed(1)}</p>
          <Rating value={avg} showValue={false} className="mt-2 justify-center" />
          <p className="mt-2 text-[13px] text-ink-soft dark:text-ink-darkSoft">{reviews.length} verified reviews</p>
          <div className="mt-5 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star - 1] || 0;
              const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className="w-3 font-semibold text-ink dark:text-ink-dark">{star}</span>
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* List + form */}
      <div>
        <div className="mb-7 rounded-soft border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark">
          <h4 className="flex items-center gap-2 text-sm font-bold text-ink dark:text-ink-dark">
            <MessageSquare size={16} className="text-primary" /> Write a review
          </h4>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rating: star }))}
                  aria-label={`Rate ${star} star`}
                >
                  <Star size={26} className={`transition-transform hover:scale-110 ${star <= form.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-ink dark:text-ink-dark">{form.rating}/5</span>
            </div>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Review headline (optional)"
              className="field"
            />
            <textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience with this product…"
              rows={3}
              className="field resize-none"
            />
            <button type="submit" disabled={submitting || !form.comment.trim()} className="btn-primary btn--md">
              <Send size={15} /> {submitting ? "Posting…" : "Submit review"}
            </button>
          </form>
        </div>

        <div className="space-y-5">
          {reviews.length ? (
            reviews.map((r) => (
              <article key={r.id} className="rounded-soft border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark dark:bg-blue-500/10 dark:text-blue-300">
                      {r.user.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-ink-dark">
                        {r.user}
                        {r.verified && <BadgeCheck size={14} className="text-success" />}
                      </p>
                      <p className="text-xs text-ink-soft dark:text-ink-darkSoft">{formatDate(r.date)} · {r.location}</p>
                    </div>
                  </div>
                  <Rating value={r.rating} showValue={false} size={14} />
                </div>
                {r.title && <p className="mt-3 text-sm font-semibold text-ink dark:text-ink-dark">{r.title}</p>}
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">{r.comment}</p>
              </article>
            ))
          ) : (
            <p className="rounded-soft border border-dashed border-line p-8 text-center text-sm text-ink-soft dark:border-line-dark">
              No reviews yet for this product — be the first to review it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}