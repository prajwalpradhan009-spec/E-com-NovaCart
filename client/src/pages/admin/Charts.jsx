export function AreaChart({ data, height = 220, color = "#2563EB", id = "ac" }) {
  const w = 600;
  const h = height;
  const pad = { top: 16, right: 8, bottom: 28, left: 40 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;

  const x = (i) => pad.left + (i * (w - pad.left - pad.right)) / (data.length - 1);
  const y = (v) => pad.top + (1 - (v - min) / range) * (h - pad.top - pad.bottom);

  const points = data.map((d, i) => [x(i), y(d.value)]);
  const line = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${h - pad.bottom} L${x(0).toFixed(1)},${h - pad.bottom} Z`;

  const ticks = 4;
  const gid = `${id}-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Area chart">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[...Array(ticks + 1)].map((_, i) => {
        const gy = pad.top + (i * (h - pad.top - pad.bottom)) / ticks;
        const val = max - (i * range) / ticks;
        return (
          <g key={i}>
            <line x1={pad.left} x2={w - pad.right} y1={gy} y2={gy} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 4" />
            <text x={pad.left - 8} y={gy + 3} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.5">
              {Math.round(val).toLocaleString("en-IN")}
            </text>
          </g>
        );
      })}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />
      ))}
      {data.map((d, i) => (
        <text key={`l-${i}`} x={x(i)} y={h - 8} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.55">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

export function BarChart({ data, height = 220, color = "#2563EB" }) {
  const w = 600;
  const h = height;
  const pad = { top: 16, right: 8, bottom: 28, left: 40 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const bw = Math.min(46, ((w - pad.left - pad.right) / data.length) * 0.62);

  const x = (i) => pad.left + (i + 0.5) * ((w - pad.left - pad.right) / data.length) - bw / 2;
  const y = (v) => pad.top + (1 - v / max) * (h - pad.top - pad.bottom);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Bar chart">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const gy = pad.top + f * (h - pad.top - pad.bottom);
        return <line key={f} x1={pad.left} x2={w - pad.right} y1={gy} y2={gy} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 4" />;
      })}
      {data.map((d, i) => (
        <g key={i}>
          <rect x={x(i)} y={y(d.value)} width={bw} height={h - pad.bottom - y(d.value)} rx="6" fill={color} fillOpacity="0.85">
            <title>{`${d.label}: ${d.value}`}</title>
          </rect>
          <text x={x(i) + bw / 2} y={h - 8} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.55">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Donut({ data, size = 180, thickness = 22 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
          offset += dash;
          return el;
        })}
        <text x="50%" y="48%" textAnchor="middle" fontSize="26" fontWeight="800" fill="currentColor">
          {Math.round((data[0]?.value / total) * 100)}%
        </text>
        <text x="50%" y="62%" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.55">
          {data[0]?.label || "Top"}
        </text>
      </svg>
      <ul className="space-y-2.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-ink-soft dark:text-ink-darkSoft">{d.label}</span>
            <span className="ml-auto font-bold text-ink dark:text-ink-dark">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const CHART_COLORS = ["#2563EB", "#0EA5E9", "#8B5CF6", "#F59E0B", "#10B981", "#F43F5E", "#64748B"];