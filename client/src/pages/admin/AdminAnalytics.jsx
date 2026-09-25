import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { PageTitle } from "./shared";
import { AreaChart, BarChart, Donut, CHART_COLORS } from "./Charts";
import { Skeleton } from "../../components/ui";

export default function AdminAnalytics() {
  const [series, setSeries] = useState(null);

  useEffect(() => {
    api.get("/analytics/sales").then((d) => setSeries(d.series)).catch(() => {});
  }, []);

  if (!series) return <Skeleton className="h-[70vh] w-full" />;

  const revenueSeries = series.map((s) => ({ label: s.month, value: s.revenue }));
  const orderSeries = series.map((s) => ({ label: s.month, value: s.orders }));
  const customersSeries = series.map((s) => ({ label: s.month, value: s.customers }));

  const topMonths = [...revenueSeries].sort((a, b) => b.value - a.value);
  const peakMonth = topMonths[0];

  const channels = [
    { label: "Direct", value: 34, color: CHART_COLORS[0] },
    { label: "Organic search", value: 28, color: CHART_COLORS[1] },
    { label: "Social", value: 18, color: CHART_COLORS[2] },
    { label: "Referral", value: 12, color: CHART_COLORS[3] },
    { label: "Email", value: 8, color: CHART_COLORS[4] }
  ];

  const devices = [
    { label: "Mobile", value: 58, color: CHART_COLORS[0] },
    { label: "Desktop", value: 34, color: CHART_COLORS[1] },
    { label: "Tablet", value: 8, color: CHART_COLORS[5] }
  ];

  return (
    <div>
      <PageTitle title="Analytics" subtitle="Growth, acquisition and channel performance across the store." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-1 text-base font-bold text-ink dark:text-ink-dark">Monthly revenue</h3>
          <p className="mb-4 text-[13px] text-ink-soft dark:text-ink-darkSoft">
            Peak month: <span className="font-semibold text-ink dark:text-ink-dark">{peakMonth.label} ({peakMonth.value.toLocaleString("en-IN")})</span>
          </p>
          <div className="text-ink dark:text-ink-dark">
            <AreaChart data={revenueSeries} height={240} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-1 text-base font-bold text-ink dark:text-ink-dark">Orders per month</h3>
          <p className="mb-4 text-[13px] text-ink-soft dark:text-ink-darkSoft">Completed orders by month</p>
          <div className="text-ink dark:text-ink-dark">
            <BarChart data={orderSeries} height={240} color="#0EA5E9" />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-base font-bold text-ink dark:text-ink-dark">Acquisition channels</h3>
          <div className="text-ink dark:text-ink-dark">
            <Donut data={channels} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-base font-bold text-ink dark:text-ink-dark">Device split</h3>
          <div className="text-ink dark:text-ink-dark">
            <Donut data={devices} />
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h3 className="mb-1 text-base font-bold text-ink dark:text-ink-dark">New customers per month</h3>
        <p className="mb-4 text-[13px] text-ink-soft dark:text-ink-darkSoft">Estimated sign-ups, growing steadily</p>
        <div className="text-ink dark:text-ink-dark">
          <AreaChart data={customersSeries} height={200} color="#10B981" id="cust" />
        </div>
      </div>
    </div>
  );
}