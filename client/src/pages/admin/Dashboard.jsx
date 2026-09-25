import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, ShoppingCart, Users, Package, ArrowRight, Star } from "lucide-react";
import { api } from "../../lib/api";
import { inr, formatNumber, compactNumber, timeAgo } from "../../lib/format";
import { StatCard, PageTitle, StatusPill } from "./shared";
import { AreaChart, BarChart, Donut, CHART_COLORS } from "./Charts";
import ProductArt from "../../components/ProductArt";
import { Skeleton } from "../../components/ui";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then(setData).catch(() => {});
  }, []);

  if (!data) return <Skeleton className="h-[70vh] w-full" />;

  const { stats, topProducts, categoryBreakdown, recentOrders, revenueSeries = [], trends = { revenue: 0, orders: 0, customers: 0, products: 0 } } = data;
  const catColors = categoryBreakdown.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
  const revenueChart = revenueSeries.length
    ? revenueSeries
    : [
      { label: "Jan", value: 320000 }, { label: "Feb", value: 412000 }, { label: "Mar", value: 380000 },
      { label: "Apr", value: 468000 }, { label: "May", value: 522000 }, { label: "Jun", value: 495000 },
      { label: "Jul", value: 580000 }, { label: "Aug", value: 644000 }, { label: "Sep", value: 720000 }
    ];

  return (
    <div>
      <PageTitle
        title="Dashboard"
        subtitle="Welcome back — here's how NovaCart is performing."
        action={
          <button className="btn-secondary btn--sm" onClick={() => window.location.reload()}>
            Refresh data
          </button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={inr(stats.totalRevenue)} delta={trends.revenue} trend={trends.revenue} icon={<IndianRupee size={20} />} accent="#2563EB" />
        <StatCard label="Orders" value={formatNumber(stats.totalOrders)} delta={trends.orders} trend={trends.orders} icon={<ShoppingCart size={20} />} accent="#0EA5E9" />
        <StatCard label="Customers" value={formatNumber(stats.customers)} delta={trends.customers} trend={trends.customers} icon={<Users size={20} />} accent="#8B5CF6" />
        <StatCard label="Products" value={formatNumber(stats.products)} delta={trends.products} trend={trends.products} icon={<Package size={20} />} accent="#10B981" />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink dark:text-ink-dark">Revenue overview</h3>
              <p className="text-[13px] text-ink-soft dark:text-ink-darkSoft">Monthly revenue, current year</p>
            </div>
            <span className="chip-blue">YTD</span>
          </div>
          <div className="text-ink dark:text-ink-dark">
            <AreaChart
              data={revenueChart.map((p) => ({ label: p.label, value: p.value }))}
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-base font-bold text-ink dark:text-ink-dark">Catalog by category</h3>
          <div className="text-ink dark:text-ink-dark">
            <Donut
              data={categoryBreakdown.map((c, i) => ({ label: c.name, value: c.value, color: catColors[i] }))}
            />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-ink dark:text-ink-dark">Top products</h3>
            <Link to="/admin/products" className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-dark">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-soft border border-line p-3 dark:border-line-dark">
                <span className="w-5 text-center text-sm font-extrabold text-ink-soft">{i + 1}</span>
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-soft border border-line dark:border-line-dark">
                  <ProductArt image={p.image || p.images?.[0]?.path} alt={p.name} art={p.art} accent={p.accent} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink dark:text-ink-dark">{p.name}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-soft dark:text-ink-darkSoft">
                    <Star size={12} className="fill-amber-400 text-amber-400" /> {p.rating.toFixed(1)} · {compactNumber(p.reviewCount)} reviews
                  </p>
                </div>
                <span className="text-sm font-bold text-ink dark:text-ink-dark">{inr(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-ink dark:text-ink-dark">Recent orders</h3>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-dark">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line dark:border-line-dark">
                  <th className="th">Order</th>
                  <th className="th">Customer</th>
                  <th className="th">Total</th>
                  <th className="th">Status</th>
                  <th className="th">Placed</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="table-row">
                    <td className="td font-semibold text-primary">{o.id}</td>
                    <td className="td">{o.customer.name}</td>
                    <td className="td font-bold">{inr(o.total)}</td>
                    <td className="td"><StatusPill status={o.status} /></td>
                    <td className="td text-ink-soft">{timeAgo(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}