export const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const discountPct = (price, original) =>
  original && price < original ? Math.round(((original - price) / original) * 100) : 0;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const formatNumber = (n) => new Intl.NumberFormat("en-IN").format(n);

export const compactNumber = (n) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(n);

export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
};

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;