import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Shapes } from "lucide-react";
import { api } from "../../lib/api";
import { formatNumber } from "../../lib/format";
import { useToast } from "../../context/ToastContext";
import { PageTitle, Modal, ConfirmDialog, EmptyRow } from "./shared";
import { Skeleton } from "../../components/ui";

const CAT_ICON_MAP = {
  chip: "Cpu", shirt: "Shirt", gamepad: "Gamepad2", smartphone: "Smartphone",
  laptop: "Laptop", coffee: "Coffee", dumbbell: "Dumbbell", watch: "Watch"
};

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", accent: "#2563EB", art: "chip" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    api.get("/categories").then((d) => { setCategories(d); setLoading(false); });
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("Name required", "Give the category a name.", "warn");
      return;
    }
    setSaving(true);
    try {
      if (editing === "new") {
        await api.post("/categories", form);
        toast("Category created", `${form.name} was added.`);
      } else {
        await api.put(`/categories/${editing}`, form);
        toast("Category updated", `${form.name} was saved.`);
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
      await api.delete(`/categories/${deleting.id}`);
      toast("Category deleted", `${deleting.name} was removed.`);
      setDeleting(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Categories"
        subtitle="Organise the catalogue into departments."
        action={
          <button onClick={() => { setForm({ name: "", description: "", accent: "#2563EB", art: "chip" }); setEditing("new"); }} className="btn-primary btn--md">
            <Plus size={16} /> Add category
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-line bg-slate-50/60 dark:border-line-dark dark:bg-white/[0.03]">
              <tr>
                <th className="th">Category</th>
                <th className="th">Slug</th>
                <th className="th">Products</th>
                <th className="th">Accent</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => <tr key={i} className="table-row"><td colSpan={5} className="td"><Skeleton className="h-12 w-full" /></td></tr>)
              ) : categories.length ? (
                categories.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft" style={{ backgroundColor: `${c.accent}14`, color: c.accent }}>
                          <span className="text-[10px] font-black uppercase">{CAT_ICON_MAP[c.art]?.slice(0, 2) || c.art.slice(0, 2)}</span>
                        </span>
                        <div>
                          <p className="font-semibold text-ink dark:text-ink-dark">{c.name}</p>
                          <p className="max-w-[260px] truncate text-xs text-ink-soft">{c.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td text-ink-soft">/{c.slug}</td>
                    <td className="td font-semibold">{formatNumber(c.productCount || 0)}</td>
                    <td className="td">
                      <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-soft">
                        <span className="h-5 w-5 rounded-full border border-line" style={{ backgroundColor: c.accent }} /> {c.accent}
                      </span>
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => { setForm({ name: c.name, description: c.description, accent: c.accent, art: c.art }); setEditing(c.id); }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-primary-soft hover:text-primary"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleting(c)} className="inline-flex h-9 w-9 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-red-50 hover:text-danger" aria-label="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={5} message="No categories yet." />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!editing} title={editing === "new" ? "Add category" : "Edit category"} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <span className="field-label">Name *</span>
            <input className="field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Electronics" required />
          </label>
          <label className="block">
            <span className="field-label">Description</span>
            <textarea rows={2} className="field resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="field-label">Accent colour</span>
              <input type="color" className="field h-10 cursor-pointer p-1.5" value={form.accent} onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))} />
            </label>
            <label className="block">
              <span className="field-label">Icon key</span>
              <input className="field" value={form.art} onChange={(e) => setForm((f) => ({ ...f, art: e.target.value }))} list="cat-art" />
              <datalist id="cat-art">
                {Object.keys(CAT_ICON_MAP).map((a) => <option key={a} value={a} />)}
              </datalist>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary btn--md">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary btn--md">{saving ? "Saving…" : editing === "new" ? "Create category" : "Save changes"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete category"
        message={`Delete "${deleting?.name}"? Products will keep their category reference but may become orphaned.`}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
        loading={saving}
      />
    </div>
  );
}