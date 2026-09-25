import { useEffect, useMemo, useState } from "react";
import { Search, Users, Mail, Phone } from "lucide-react";
import { api } from "../../lib/api";
import { inr, formatDate } from "../../lib/format";
import { PageTitle, StatusPill, Toolbar, EmptyRow } from "./shared";
import { Skeleton } from "../../components/ui";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([api.get("/customers"), api.get("/orders")]).then(([c, o]) => {
      setCustomers(c.customers);
      setOrders(o.orders);
      setLoading(false);
    });
  }, []);

  const enriched = useMemo(
    () =>
      customers
        .map((c) => ({
          ...c,
          _orders: orders.filter((o) => o.customer.email.toLowerCase() === c.email.toLowerCase()).length || c.orders,
          _spent: orders.filter((o) => o.customer.email.toLowerCase() === c.email.toLowerCase()).reduce((s, o) => s + o.total, 0) || c.spent
        }))
        .filter(
          (c) =>
            !search.trim() ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
        ),
    [customers, orders, search]
  );

  return (
    <div>
      <PageTitle title="Customers" subtitle="Everyone shopping at NovaCart, with order and spend insights." />
      <Toolbar>
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…" className="field pl-10" />
        </div>
      </Toolbar>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-line bg-slate-50/60 dark:border-line-dark dark:bg-white/[0.03]">
              <tr>
                <th className="th">Customer</th>
                <th className="th">Contact</th>
                <th className="th">Orders</th>
                <th className="th">Lifetime spend</th>
                <th className="th">Joined</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i} className="table-row"><td colSpan={6} className="td"><Skeleton className="h-12 w-full" /></td></tr>)
              ) : enriched.length ? (
                enriched.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark dark:bg-blue-500/10 dark:text-blue-300">
                          {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </span>
                        <div>
                          <p className="font-semibold text-ink dark:text-ink-dark">{c.name}</p>
                          <p className="text-xs text-ink-soft">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <p className="flex items-center gap-1.5 text-[13px] text-ink-soft"><Mail size={13} /> {c.email}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-soft"><Phone size={13} /> {c.phone}</p>
                    </td>
                    <td className="td font-semibold">{c._orders}</td>
                    <td className="td font-bold text-ink dark:text-ink-dark">{inr(c._spent)}</td>
                    <td className="td text-ink-soft">{formatDate(c.joinedAt)}</td>
                    <td className="td"><StatusPill status={c.status} /></td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={6} message="No customers found." />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && customers.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-card border border-dashed border-line py-16 dark:border-line-dark">
          <Users size={30} className="text-ink-soft" />
          <p className="mt-3 text-sm font-semibold text-ink dark:text-ink-dark">No customers yet</p>
        </div>
      )}
    </div>
  );
}