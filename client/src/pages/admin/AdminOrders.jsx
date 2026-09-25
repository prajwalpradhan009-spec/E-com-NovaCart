import { Fragment, useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { api } from "../../lib/api";
import { inr, formatDate } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import { PageTitle, StatusPill, Toolbar, EmptyRow } from "./shared";
import ProductArt from "../../components/ProductArt";
import { Skeleton } from "../../components/ui";

const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = () => api.get("/orders").then((d) => setOrders(d.orders));
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const q = search.toLowerCase();
        const match = !search || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q);
        return match && (!statusFilter || o.status === statusFilter);
      }),
    [orders, search, statusFilter]
  );

  const setStatus = async (o, status) => {
    await api.patch(`/orders/${o.id}`, { status });
    load();
  };

  return (
    <div>
      <PageTitle title="Orders" subtitle="Track and update the status of every order placed." />
      <Toolbar>
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID, customer…" className="field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="field w-auto">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Toolbar>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-line bg-slate-50/60 dark:border-line-dark dark:bg-white/[0.03]">
              <tr>
                <th className="th">Order</th>
                <th className="th">Customer</th>
                <th className="th">Items</th>
                <th className="th">Total</th>
                <th className="th">Payment</th>
                <th className="th">Status</th>
                <th className="th">Placed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i} className="table-row"><td colSpan={7} className="td"><Skeleton className="h-12 w-full" /></td></tr>)
              ) : filtered.length ? (
                filtered.map((o) => {
                  const qty = o.items.reduce((s, i) => s + i.qty, 0);
                  const isOpen = expanded === o.id;
                  return (
                    <Fragment key={o.id}>
                      <tr className="table-row cursor-pointer" onClick={() => setExpanded(isOpen ? null : o.id)}>
                        <td className="td font-bold text-primary">{o.id}</td>
                        <td className="td">
                          <p className="font-semibold text-ink dark:text-ink-dark">{o.customer.name}</p>
                          <p className="text-xs text-ink-soft">{o.customer.email}</p>
                        </td>
                        <td className="td">{qty} item{qty === 1 ? "" : "s"}</td>
                        <td className="td font-bold">{inr(o.total)}</td>
                        <td className="td text-ink-soft">{o.payment.method}</td>
                        <td className="td" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            onChange={(e) => {
                              setStatus(o, e.target.value);
                              toast("Status updated", `Order ${o.id} is now ${e.target.value}.`);
                            }}
                            className={`rounded-full border-0 bg-transparent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 ${o.status === "Delivered" ? "text-emerald-600" : o.status === "Shipped" ? "text-amber-600" : o.status === "Cancelled" ? "text-red-600" : "text-blue-600"}`}
                          >
                            {STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="td text-ink-soft">{formatDate(o.createdAt)}</td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                          <td colSpan={7}>
                            <div className="grid animate-fade-in gap-6 p-6 sm:grid-cols-3">
                              <div>
                                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-soft">Products</p>
                                <div className="space-y-2">
                                  {o.items.map((it) => (
                                    <div key={it.productId} className="flex items-center gap-2.5">
                                      <div className="h-10 w-10 overflow-hidden rounded-soft border border-line dark:border-line-dark">
                                        <ProductArt image={it.image} alt={it.name} art={it.art} accent={it.accent} className="h-full w-full" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="truncate text-[13px] font-medium text-ink dark:text-ink-dark">{it.name}</p>
                                        <p className="text-xs text-ink-soft">{it.qty} × {inr(it.price)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-soft">Shipping address</p>
                                <p className="text-sm leading-relaxed text-ink dark:text-ink-dark">
                                  {o.customer.name}<br />{o.address.line}, {o.address.city}<br />{o.address.state} — {o.address.pincode}<br />
                                  <span className="text-ink-soft">{o.customer.phone}</span>
                                </p>
                              </div>
                              <div>
                                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-soft">Summary</p>
                                <dl className="space-y-1 text-sm">
                                  <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="font-semibold">{inr(o.subtotal)}</dd></div>
                                  <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd className="font-semibold">{o.shipping ? inr(o.shipping) : "FREE"}</dd></div>
                                  {o.discount > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd className="font-bold">−{inr(o.discount)}</dd></div>}
                                  <div className="flex justify-between border-t border-line pt-1.5 dark:border-line-dark"><dt className="font-semibold">Total</dt><dd className="font-extrabold">{inr(o.total)}</dd></div>
                                </dl>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <EmptyRow colSpan={7} message="No orders match your filters." />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && orders.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-card border border-dashed border-line py-16 dark:border-line-dark">
          <ShoppingCart size={30} className="text-ink-soft" />
          <p className="mt-3 text-sm font-semibold text-ink dark:text-ink-dark">No orders yet</p>
        </div>
      )}
    </div>
  );
}