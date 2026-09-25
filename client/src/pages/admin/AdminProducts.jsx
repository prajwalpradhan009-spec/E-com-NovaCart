import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Package, Star } from "lucide-react";
import { api } from "../../lib/api";
import { inr } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import { PageTitle, Modal, ConfirmDialog, Toolbar, EmptyRow } from "./shared";
import ProductArt from "../../components/ProductArt";
import { Skeleton } from "../../components/ui";

const EMPTY = {
  name: "", categoryId: "electronics", description: "", price: "", originalPrice: "",
  stock: 25, badge: "", deal: false, art: "box", accent: "#2563EB"
};

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/products?sort=featured"), api.get("/categories")]).then(([p, c]) => {
      setProducts(p.products);
      setCategories(c);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (!catFilter || p.categoryId === catFilter) &&
          (!search.trim() || p.name.toLowerCase().includes(search.toLowerCase()))
      ),
    [products, catFilter, search]
  );

  const openNew = () => {
    setForm({ ...EMPTY });
    setEditing("new");
  };
  const openEdit = (p) => {
    setForm({ ...p, price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : "" });
    setEditing(p.id);
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock),
      badge: form.badge || null,
      deal: Boolean(form.deal),
      art: form.art,
      accent: form.accent
    };
    if (!body.name || !body.price) {
      toast("Missing fields", "Name and price are required.", "warn");
      return;
    }
    setSaving(true);
    try {
      if (editing === "new") {
        await api.post("/products", body);
        toast("Product created", `${body.name} was added to the catalogue.`);
      } else {
        await api.put(`/products/${editing}`, body);
        toast("Product updated", `${body.name} was saved.`);
      }
      setEditing(null);
      load();
    } catch (err) {
      toast("Save failed", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/products/${deleting.id}`);
      toast("Product deleted", `${deleting.name} was removed.`);
      setDeleting(null);
      load();
    } catch (err) {
      toast("Delete failed", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Products"
        subtitle="Manage your catalogue — stock, pricing, badges and availability."
        action={
          <button onClick={openNew} className="btn-primary btn--md">
            <Plus size={16} /> Add product
          </button>
        }
      />

      <Toolbar>
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="field pl-10" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="field w-auto">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Toolbar>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-line bg-slate-50/60 dark:border-line-dark dark:bg-white/[0.03]">
              <tr>
                <th className="th">Product</th>
                <th className="th">Category</th>
                <th className="th">Price</th>
                <th className="th">Stock</th>
                <th className="th">Rating</th>
                <th className="th">Badge</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="table-row"><td colSpan={7} className="td"><Skeleton className="h-12 w-full" /></td></tr>
                ))
              ) : filtered.length ? (
                filtered.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-soft border border-line dark:border-line-dark">
                          <ProductArt image={p.image || p.images?.[0]?.path} alt={p.name} art={p.art} accent={p.accent} className="h-full w-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate text-sm font-semibold text-ink dark:text-ink-dark">{p.name}</p>
                          <p className="text-xs text-ink-soft dark:text-ink-darkSoft">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td text-ink-soft capitalize">{p.categoryId.replace("-", " ")}</td>
                    <td className="td">
                      <p className="font-bold text-ink dark:text-ink-dark">{inr(p.price)}</p>
                      {p.originalPrice && <p className="text-xs text-ink-soft line-through">{inr(p.originalPrice)}</p>}
                    </td>
                    <td className="td">
                      <span className={`text-sm font-semibold ${p.stock <= 10 ? "text-warn" : "text-success"}`}>{p.stock}</span>
                    </td>
                    <td className="td">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink dark:text-ink-dark">
                        <Star size={13} className="fill-amber-400 text-amber-400" /> {p.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="td">
                      {p.badge ? <span className="chip-gray">{p.badge}</span> : <span className="text-ink-soft/50">—</span>}
                      {p.deal && <span className="chip-red ml-1">Deal</span>}
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} aria-label="Edit" className="inline-flex h-9 w-9 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-primary-soft hover:text-primary">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleting(p)} aria-label="Delete" className="inline-flex h-9 w-9 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-red-50 hover:text-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={7} message="No products match your filters." />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filtered.length === 0 && products.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-card border border-dashed border-line py-16 text-center dark:border-line-dark">
          <Package size={30} className="text-ink-soft" />
          <p className="mt-3 text-sm font-semibold text-ink dark:text-ink-dark">No products yet</p>
          <button onClick={openNew} className="btn-primary btn--md mt-4">Add your first product</button>
        </div>
      )}

      {/* Edit / create modal */}
      <Modal open={!!editing} title={editing === "new" ? "Add product" : "Edit product"} onClose={() => setEditing(null)} wide>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="field-label">Product name *</span>
            <input className="field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Wireless Headphones Pro" required />
          </label>
          <label className="block">
            <span className="field-label">Category</span>
            <select className="field" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Illustration</span>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-soft border border-line dark:border-line-dark">
                <ProductArt art={form.art || "box"} accent={form.accent} className="h-full w-full" />
              </div>
              <input className="field" value={form.art} onChange={(e) => setForm((f) => ({ ...f, art: e.target.value }))} list="art-list" />
              <datalist id="art-list">
                {["headphones", "speaker", "camera", "tshirt", "sneaker", "sunglasses", "controller", "keyboard", "smartphone", "powerbank", "laptop", "blender", "coffee", "toaster", "yogamat", "dumbbell", "watch", "backpack", "earbuds", "box"].map((a) => <option key={a} value={a} />)}
              </datalist>
            </div>
          </label>
          <label className="block">
            <span className="field-label">Accent colour</span>
            <input type="color" className="field h-10 cursor-pointer p-1.5" value={form.accent} onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="field-label">Price (₹) *</span>
              <input type="number" min="0" className="field" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
            </label>
            <label className="block">
              <span className="field-label">Original price</span>
              <input type="number" min="0" className="field" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))} placeholder="Optional" />
            </label>
          </div>
          <label className="block">
            <span className="field-label">Stock</span>
            <input type="number" min="0" className="field" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
          </label>
          <label className="block">
            <span className="field-label">Badge</span>
            <input className="field" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} placeholder="New / Best Seller / Premium" />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">Short description</span>
            <textarea rows={2} className="field resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="flex items-center gap-2.5 text-sm font-medium text-ink sm:col-span-2 dark:text-ink-dark">
            <input
              type="checkbox"
              checked={form.deal}
              onChange={(e) => setForm((f) => ({ ...f, deal: e.target.checked }))}
              className="h-4 w-4 rounded border-line accent-primary"
            />
            Feature on the Deals pages
          </label>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary btn--md">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary btn--md">{saving ? "Saving…" : editing === "new" ? "Create product" : "Save changes"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete product"
        message={`Are you sure you want to delete "${deleting?.name}"? This can't be undone.`}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
        loading={saving}
      />
    </div>
  );
}