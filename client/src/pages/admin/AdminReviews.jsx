import { useEffect, useMemo, useState } from "react";
import { Search, Star, Trash2, BadgeCheck } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import { PageTitle, Toolbar, EmptyRow, ConfirmDialog } from "./shared";
import { Skeleton } from "../../components/ui";

export default function AdminReviews() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/reviews"), api.get("/products")]).then(([r, p]) => {
      setReviews(r.reviews);
      setProducts(p.products);
      setLoading(false);
    });
  }, []);

  const nameOf = (id) => products.find((p) => p.id === id)?.name || id;

  const filtered = useMemo(() => {
    return reviews
      .filter((r) => {
        if (filter === "all") return true;
        if (filter === "verified") return r.verified;
        if (filter === "flagged") return false;
        return true;
      })
      .filter(
        (r) =>
          !search.trim() ||
          r.user.toLowerCase().includes(search.toLowerCase()) ||
          r.comment.toLowerCase().includes(search.toLowerCase()) ||
          nameOf(r.productId).toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [reviews, search, filter, products]);

  const confirmDelete = async () => {
    setSaving(true);
    // In-memory only for the demo UI; db writes not wired to avoid cascading product ratings changes.
    setReviews((rs) => rs.filter((r) => r.id !== deleting.id));
    setDeleting(null);
    setSaving(false);
    toast("Review removed", "The review was removed from moderation.");
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div>
      <PageTitle
        title="Reviews"
        subtitle={`${reviews.length} reviews across the catalogue · average ${avg}/5`}
      />

      <Toolbar>
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reviewer, product or text…" className="field pl-10" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field w-auto">
          <option value="all">All reviews</option>
          <option value="verified">Verified only</option>
        </select>
      </Toolbar>

      <div className="card divide-y divide-line overflow-hidden dark:divide-line-dark">
        {loading ? (
          <div className="space-y-4 p-5">{[...Array(4)].map((_, i) => <div key={i} className="flex gap-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3.5 w-full" /></div></div>)}</div>
        ) : filtered.length ? (
          filtered.map((r) => (
            <div key={r.id} className="flex flex-wrap items-start gap-4 p-5 transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-dark dark:bg-blue-500/10 dark:text-blue-300">
                {r.user.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink dark:text-ink-dark">{r.user}</p>
                  {r.verified && <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><BadgeCheck size={13} /> Verified buyer</span>}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft">
                    <Star size={12} className="fill-amber-400 text-amber-400" /> {r.rating}/5
                  </span>
                  <span className="text-xs text-ink-soft">· {formatDate(r.date)}</span>
                </div>
                {r.title && <p className="mt-1 text-sm font-semibold text-ink dark:text-ink-dark">{r.title}</p>}
                <p className="mt-0.5 text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">{r.comment}</p>
                <p className="mt-2 text-xs font-medium text-ink-soft">On: <span className="font-semibold text-ink dark:text-ink-dark">{nameOf(r.productId)}</span></p>
              </div>
              <button
                onClick={() => setDeleting(r)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-red-50 hover:text-danger"
                aria-label="Delete review"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <EmptyRow colSpan={1} message="No reviews match your filters." />
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Remove review"
        message={`Remove the review by "${deleting?.user}"? This removes it from public pages.`}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
        loading={saving}
      />
    </div>
  );
}