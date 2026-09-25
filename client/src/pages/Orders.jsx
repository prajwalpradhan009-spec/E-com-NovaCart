import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, MapPin, ChevronDown, ArrowRight, Truck } from "lucide-react";
import { api } from "../lib/api";
import { inr, formatDate } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/layout/Page";
import ProductArt from "../components/ProductArt";

const STATUS_STYLES = {
  Processing: "chip-blue",
  Shipped: "chip-amber",
  Delivered: "chip-green",
  Cancelled: "chip-red"
};

export default function Orders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get("/auth/me/orders").then((d) => {
      setOrders(d.orders);
      setLoadingOrders(false);
    }).catch(() => setLoadingOrders(false));
  }, [user]);

  if (loading) return <div className="shell py-24"><div className="skeleton h-40 w-full" /></div>;

  return (
    <>
      <PageHeader
        eyebrow="Order history"
        title="My Orders"
        subtitle={`Track deliveries, view invoices and see the full history of purchases made by ${user?.name?.split(" ")[0] || "you"}.`}
        crumbs={[{ label: "Account", to: "/account" }, { label: "Orders" }]}
      />

      <div data-reveal className="shell py-10">
        {loadingOrders ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="card p-6"><div className="skeleton h-24 w-full" /></div>)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-surface py-16 text-center dark:border-line-dark dark:bg-surface-dark">
            <Package size={30} className="text-ink-soft" />
            <h3 className="mt-4 text-lg font-bold">No orders yet</h3>
            <p className="mt-1.5 text-sm text-ink-soft">When you place an order it will appear here.</p>
            <Link to="/shop" className="btn-primary btn--md mt-6">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((o) => {
              const qty = o.items.reduce((s, i) => s + i.qty, 0);
              return (
                <div key={o.id} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-slate-50/60 px-5 py-4 sm:px-6 dark:border-line-dark dark:bg-white/[0.03]">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">Order</p>
                        <p className="text-sm font-bold text-primary">{o.id}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">Placed</p>
                        <p className="text-sm font-semibold text-ink dark:text-ink-dark">{formatDate(o.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">Total</p>
                        <p className="text-sm font-bold text-ink dark:text-ink-dark">{inr(o.total)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={STATUS_STYLES[o.status] || "chip-gray"}>{o.status}</span>
                      <button
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        className="btn-secondary btn--sm"
                      >
                        {expanded === o.id ? "Hide" : "Details"} <ChevronDown size={14} className={`transition-transform ${expanded === o.id ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center gap-6">
                      {o.items.slice(0, 3).map((it) => (
                        <div key={it.productId} className="flex items-center gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-soft border border-line dark:border-line-dark">
                            <ProductArt image={it.image} alt={it.name} art={it.art} accent={it.accent} className="h-full w-full" />
                          </div>
                          <div>
                            <p className="max-w-[180px] truncate text-[13px] font-semibold text-ink dark:text-ink-dark">{it.name}</p>
                            <p className="text-xs text-ink-soft dark:text-ink-darkSoft">{it.qty} × {inr(it.price)}</p>
                          </div>
                        </div>
                      ))}
                      {o.items.length > 3 && (
                        <span className="text-[13px] font-medium text-ink-soft">+{o.items.length - 3} more</span>
                      )}
                      <Link to={`/product/${o.items[0].productId}`} className="btn-primary btn--sm ml-auto">
                        Buy again <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {expanded === o.id && (
                    <div className="animate-fade-in grid gap-6 border-t border-line px-5 py-5 sm:grid-cols-3 sm:px-6 dark:border-line-dark">
                      <div>
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">
                          <MapPin size={14} /> Delivery address
                        </p>
                        <p className="text-sm leading-relaxed text-ink dark:text-ink-dark">
                          {o.customer.name}<br />
                          {o.address.line}, {o.address.city}<br />
                          {o.address.state} — {o.address.pincode}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">
                          <Truck size={14} /> Shipping & payment
                        </p>
                        <p className="text-sm leading-relaxed text-ink dark:text-ink-dark">
                          {o.delivery.method}<br />
                          {o.payment.method}<br />
                          {qty} item(s) · {inr(o.subtotal)} subtotal
                        </p>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">Summary</p>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="font-semibold">{inr(o.subtotal)}</dd></div>
                          <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd className="font-semibold">{o.shipping ? inr(o.shipping) : "FREE"}</dd></div>
                          {o.discount > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd className="font-bold">−{inr(o.discount)}</dd></div>}
                          <div className="flex justify-between border-t border-line pt-1.5 dark:border-line-dark"><dt className="font-semibold">Total</dt><dd className="font-extrabold">{inr(o.total)}</dd></div>
                        </dl>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}