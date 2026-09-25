import { useEffect, useMemo, useState } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

function defaultTarget() {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 1, 7, 23, 59, 59);
  return target.toISOString();
}

export default function CountdownTimer({ endsAt, className = "" }) {
  const target = useMemo(() => new Date(endsAt || defaultTarget()).getTime(), [endsAt]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const cells = [
    { label: "Days", value: pad(days) },
    { label: "Hours", value: pad(hours) },
    { label: "Min", value: pad(minutes) },
    { label: "Sec", value: pad(seconds) }
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {cells.map((c, i) => (
        <div key={c.label} className="flex items-center gap-2">
          <div className="flex min-w-[62px] flex-col items-center rounded-soft border border-white/10 bg-white/[0.06] px-3 py-2.5 backdrop-blur">
            <span className="text-2xl font-extrabold tabular-nums tracking-tight">{c.value}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{c.label}</span>
          </div>
          {i < cells.length - 1 && <span className="text-xl font-bold text-slate-500">:</span>}
        </div>
      ))}
    </div>
  );
}