import { useEffect, useState } from "react";
import { Save, Store, Bell, Truck, CreditCard, Palette } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { PageTitle } from "./shared";
import { useTheme } from "../../context/ThemeContext";

export default function AdminSettings() {
  const { toast } = useToast();
  const { toggle } = useTheme();
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);

  const defaults = {
    storeName: "NovaCart",
    supportEmail: "hello@novacart.in",
    supportPhone: "+91 98765 43210",
    currency: "INR (₹)",
    freeShippingAbove: "999",
    expressFee: "149",
    dealsEndAt: "2026-09-30T23:59",
    taxRate: "0",
    lowStockAlert: "10",
    maintenanceMode: false
  };

  useEffect(() => {
    api.get("/settings").then((d) => {
      setSettings({ ...defaults, ...d.settings });
    });
  }, []);

  const set = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/settings", settings);
      toast("Settings saved", "Store preferences were updated.");
    } catch (err) {
      toast("Save failed", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Settings"
        subtitle="Configure store identity, shipping, notifications and appearance."
        action={
          <button onClick={save} disabled={saving} className="btn-primary btn--md">
            <Save size={16} /> {saving ? "Saving…" : "Save changes"}
          </button>
        }
      />

      <form onSubmit={save}>
        {/* Store */}
        <section className="mb-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-soft">
            <Store size={16} className="text-primary" /> Store identity
          </h3>
          <div className="card grid gap-4 p-6 sm:grid-cols-2">
            <Field label="Store name" value={settings.storeName} onChange={(v) => set("storeName", v)} />
            <Field label="Currency" value={settings.currency} onChange={(v) => set("currency", v)} />
            <Field label="Support email" value={settings.supportEmail} onChange={(v) => set("supportEmail", v)} />
            <Field label="Support phone" value={settings.supportPhone} onChange={(v) => set("supportPhone", v)} />
          </div>
        </section>

        {/* Shipping */}
        <section className="mb-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-soft">
            <Truck size={16} className="text-primary" /> Shipping & checkout
          </h3>
          <div className="card grid gap-4 p-6 sm:grid-cols-3">
            <Field label="Free shipping above (₹)" value={settings.freeShippingAbove} onChange={(v) => set("freeShippingAbove", v)} />
            <Field label="Express delivery fee (₹)" value={settings.expressFee} onChange={(v) => set("expressFee", v)} />
            <Field label="Tax rate (%)" value={settings.taxRate} onChange={(v) => set("taxRate", v)} />
            <Field label="Deals end date/time" value={settings.dealsEndAt} onChange={(v) => set("dealsEndAt", v)} type="datetime-local" />
            <Field label="Low-stock alert threshold" value={settings.lowStockAlert} onChange={(v) => set("lowStockAlert", v)} />
          </div>
        </section>

        {/* Notifications & appearance */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-soft">
              <Bell size={16} className="text-primary" /> Notifications
            </h3>
            <div className="space-y-3">
              <Toggle
                label="New order email alerts"
                checked={settings.orderAlerts !== false}
                onChange={(v) => set("orderAlerts", v)}
              />
              <Toggle
                label="Low stock alerts"
                checked={settings.lowStockAlerts !== false}
                onChange={(v) => set("lowStockAlerts", v)}
              />
              <Toggle
                label="Weekly sales digest"
                checked={settings.digest === true}
                onChange={(v) => set("digest", v)}
              />
              <Toggle
                label="Maintenance mode"
                checked={settings.maintenanceMode === true}
                onChange={(v) => set("maintenanceMode", v)}
              />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-soft">
              <Palette size={16} className="text-primary" /> Appearance
            </h3>
            <div className="flex items-center justify-between rounded-soft border border-line p-4 dark:border-line-dark">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-ink-dark">Default theme</p>
                <p className="text-[13px] text-ink-soft dark:text-ink-darkSoft">Toggle between light and dark mode</p>
              </div>
              <button type="button" onClick={toggle} className="btn-secondary btn--sm">Switch theme</button>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-soft border border-line p-4 dark:border-line-dark">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-ink-dark">Payments</p>
                <p className="text-[13px] text-ink-soft dark:text-ink-darkSoft">UPI, Cards, Net Banking, COD enabled</p>
              </div>
              <CreditCard size={20} className="text-primary" />
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary btn--lg">
            <Save size={16} /> {saving ? "Saving…" : "Save all settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input type={type} className="field" value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-soft border border-line px-4 py-3.5 text-left transition-colors hover:border-primary/40 dark:border-line-dark"
    >
      <span className="text-sm font-medium text-ink dark:text-ink-dark">{label}</span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-600"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}