import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, Package, Heart, LayoutDashboard, MapPin, BadgeCheck, Pencil, Save, ShoppingBag, LogOut, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import { PageHeader, PageLoader } from "../components/layout/Page";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";

export default function Account() {
  const { user, update, signOut, loading } = useAuth();
  const { count, wishlist } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", location: user?.location || "", picture: user?.picture || "", gender: user?.gender || "", bio: user?.bio || "" });

  useEffect(() => {
    if (!user) return;
    api.get("/auth/me/orders").then((d) => setOrderCount(d.orders.length)).catch(() => {});
  }, [user]);

  const onPickImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      toast("Image too large", "Please choose an image under 2.5 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        setForm((f) => ({ ...f, picture: canvas.toDataURL("image/jpeg", 0.82) }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="shell py-24"><PageLoader /></div>
    );
  }

  if (!user) {
    return (
      <div className="shell flex flex-col items-center py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft dark:bg-blue-500/10">
          <UserRound size={28} className="text-primary" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink dark:text-ink-dark">Sign in to your account</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">
          Access your profile, track orders, manage your wishlist and enjoy faster checkout.
        </p>
        <div className="mt-7 flex items-center gap-3">
          <Link to="/auth?mode=signin&redirect=/account" className="btn-primary btn--lg">
            <LogOut size={16} className="rotate-180" /> Sign In
          </Link>
          <Link to="/auth?mode=signup&redirect=/account" className="btn-secondary btn--lg">Create account</Link>
        </div>
        <Link to="/shop" className="mt-6 text-sm font-semibold text-primary hover:underline">Browse products →</Link>
      </div>
    );
  }

  const save = async (e) => {
    e.preventDefault();
    try {
      await update({ name: form.name, phone: form.phone, location: form.location, picture: form.picture, gender: form.gender, bio: form.bio });
      setEditing(false);
      toast("Profile updated", "Your details were saved successfully.");
    } catch (err) {
      toast("Update failed", err.message, "error");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title={`Hello, ${user.name.split(" ")[0]} 👋`}
        subtitle="Manage your profile, review orders and track your saved products."
        crumbs={[{ label: "Account" }]}
      />

      <div data-reveal className="shell grid gap-8 py-10 lg:grid-cols-[300px_1fr]">
        {/* Side */}
        <aside className="space-y-4">
          <div className="card p-6 text-center">
            <Avatar picture={user.picture} name={user.name} className="mx-auto h-24 w-24 text-2xl" />
            <h2 className="mt-4 text-lg font-bold text-ink dark:text-ink-dark">{user.name}</h2>
            <p className="mt-1 line-clamp-1 text-sm text-ink-soft dark:text-ink-darkSoft">{user.email}</p>
            <span className="chip-green mt-3"><BadgeCheck size={13} /> {user.role || "Member"}</span>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-ink-soft dark:text-ink-darkSoft">
              <MapPin size={14} /> {user.location || "India"}
            </p>
            <p className="mt-1 text-[13px] text-ink-soft dark:text-ink-darkSoft">Member since {user.memberSince ? formatDate(user.memberSince) : "recently"}</p>
            <button
              onClick={() => { signOut(); }}
              className="btn-secondary btn--sm mt-5 w-full"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Link to="/account/orders" className="card flex flex-col items-center gap-1 p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <Package size={20} className="text-primary" />
              <span className="text-lg font-extrabold">{orderCount}</span>
              <span className="text-[11px] text-ink-soft">Orders</span>
            </Link>
            <Link to="/wishlist" className="card flex flex-col items-center gap-1 p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <Heart size={20} className="text-danger" />
              <span className="text-lg font-extrabold">{wishlist.length}</span>
              <span className="text-[11px] text-ink-soft">Saved</span>
            </Link>
            <Link to="/cart" className="card flex flex-col items-center gap-1 p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <ShoppingBag size={20} className="text-success" />
              <span className="text-lg font-extrabold">{count}</span>
              <span className="text-[11px] text-ink-soft">In cart</span>
            </Link>
          </div>

          <Link to="/admin" className="card flex items-center justify-between gap-3 p-4 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft dark:text-ink-dark">
            <span className="flex items-center gap-2.5"><LayoutDashboard size={18} className="text-primary" /> Admin dashboard</span>
            <Arrow />
          </Link>
        </aside>

        {/* Main */}
        <div className="space-y-6">
          <div className="card p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink dark:text-ink-dark">Personal details</h3>
              <button
                onClick={() => setEditing((e) => !e)}
                className="btn-secondary btn--sm"
              >
                {editing ? "Cancel" : (<><Pencil size={14} /> Edit</>)}
              </button>
            </div>
            {editing ? (
              <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
                <AvatarPicker
                  picture={form.picture}
                  name={form.name || user.name}
                  onChange={onPickImage}
                  onRemove={() => setForm((f) => ({ ...f, picture: "" }))}
                />
                <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                <div>
                  <span className="field-label">Email</span>
                  <input className="field bg-canvas opacity-70 dark:bg-canvas-dark" value={form.email} disabled />
                </div>
                <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                <Field label="Location" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} />
                <FieldSelect label="Gender" value={form.gender} onChange={(v) => setForm((f) => ({ ...f, gender: v }))} options={GENDER_OPTIONS} />
                <FieldArea label="Bio" value={form.bio} onChange={(v) => setForm((f) => ({ ...f, bio: v }))} placeholder="Tell us a little about yourself…" />
                <button type="submit" className="btn-primary btn--md sm:col-span-2 justify-self-start">
                  <Save size={16} /> Save changes
                </button>
              </form>
            ) : (
              <dl className="divide-y divide-line dark:divide-line-dark">
                {[
                  ["Full name", user.name],
                  ["Email", user.email],
                  ["Phone", user.phone || "—"],
                  ["Location", user.location || "—"],
                  ["Gender", user.gender || "—"],
                  ["Bio", user.bio || "—"],
                  ["Member since", user.memberSince ? formatDate(user.memberSince) : "Recently"]
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-2 gap-4 py-3.5 text-sm">
                    <dt className="font-medium text-ink-soft dark:text-ink-darkSoft">{label}</dt>
                    <dd className="font-semibold text-ink dark:text-ink-dark">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="card p-6 sm:p-8">
            <h3 className="mb-4 text-lg font-bold text-ink dark:text-ink-dark">Quick actions</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickLink to="/account/orders" icon={<Package size={18} />} title="Track my orders" text="Check delivery status and history" />
              <QuickLink to="/wishlist" icon={<Heart size={18} />} title="View wishlist" text="Products you've saved for later" />
              <QuickLink to="/cart" icon={<ShoppingBag size={18} />} title="Go to cart" text={`${count} item(s) ready to checkout`} />
              <QuickLink to="/deals" icon={<BadgeCheck size={18} />} title="Browse deals" text="Live discounts on popular products" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const GENDER_OPTIONS = ["", "Male", "Female", "Other", "Prefer not to say"];

function Avatar({ picture, name, className = "h-20 w-20 text-2xl" }) {
  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        className={`shrink-0 rounded-full object-cover ring-4 ring-line dark:ring-line-dark ${className}`}
      />
    );
  }
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-extrabold text-white ring-4 ring-line dark:ring-line-dark ${className}`}
    >
      {initials}
    </span>
  );
}

function AvatarPicker({ picture, name, onChange, onRemove }) {
  const inputRef = useRef(null);
  return (
    <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
      <Avatar picture={picture} name={name} className="h-20 w-20 text-2xl" />
      <div>
        <button type="button" onClick={() => inputRef.current && inputRef.current.click()} className="btn-secondary btn--sm">
          <Camera size={14} /> Change photo
        </button>
        {picture && (
          <button type="button" onClick={onRemove} className="mt-1.5 block text-[13px] font-semibold text-danger hover:underline">
            Remove photo
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onChange} />
        <p className="mt-1.5 text-[11px] text-ink-soft dark:text-ink-darkSoft">JPG or PNG up to 2.5 MB — cropped to a circle.</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o || "placeholder"} value={o}>
            {o || "Select…"}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldArea({ label, value, onChange, rows = 3, placeholder = "" }) {
  return (
    <label className="block sm:col-span-2">
      <span className="field-label">{label}</span>
      <textarea
        className="field resize-none"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Arrow() {
  return <span className="text-primary">→</span>;
}

function QuickLink({ to, icon, title, text }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-soft border border-line bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft dark:border-line-dark dark:bg-surface-dark">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink group-hover:text-primary dark:text-ink-dark">{title}</p>
        <p className="truncate text-[13px] text-ink-soft dark:text-ink-darkSoft">{text}</p>
      </div>
    </Link>
  );
}