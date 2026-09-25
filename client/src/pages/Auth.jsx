import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ArrowRight, LogIn, UserPlus,
  Loader2, ShieldCheck, Truck, RotateCcw, Star
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const DEMO_ACCOUNTS = [
  { label: "Customer", email: "aarav@example.com", password: "Customer123!", role: "customer" },
  { label: "Admin", email: "admin@novacart.local", password: "Admin123!", role: "admin" }
];

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "signin");
  const redirect = params.get("redirect") || "/account";

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", location: "" });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(params.get("mode") === "signup" ? "signup" : "signin");
  }, [params]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const fill = (account) => {
    setForm((f) => ({ ...f, email: account.email, password: account.password }));
    if (mode === "signup") setForm((f) => ({ ...f, name: account.role === "admin" ? "Aryan Verma" : "Riya Sharma" }));
  };

  const switchMode = (next) => {
    setMode(next);
    navigate({ pathname: "/auth", search: `mode=${next}&redirect=${redirect}` }, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast("Invalid email", "Please enter a valid email address.", "warn");
      return;
    }
    if (form.password.length < 6) {
      toast("Weak password", "Password must be at least 6 characters.", "warn");
      return;
    }
    if (mode === "signup" && !form.name.trim()) {
      toast("Name required", "Please enter your full name.", "warn");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim(), location: form.location.trim() || "India" });
        toast("Account created 🎉", "Welcome to NovaCart — happy shopping!");
      } else {
        await signIn(form.email.trim(), form.password);
        toast("Welcome back", "You are signed in.");
      }
      navigate(redirect, { replace: true });
    } catch (err) {
      toast(mode === "signup" ? "Sign up failed" : "Sign in failed", err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-0 px-4 py-10 lg:grid-cols-2 lg:px-6">
        {/* Brand panel */}
        <div className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden rounded-card bg-[#0B1120] p-10 text-white lg:flex">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="relative">
            <Logo variant="light" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
              Your cart is the only
              <br />
              thing that should be <span className="text-blue-400">heavy.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-300">
              Sign in to track orders, save wishlists, unlock faster checkout and get
              personalised deals across 20+ products.
            </p>
            <div className="mt-8 space-y-3.5">
              {[
                { icon: <Truck size={17} />, text: "Track deliveries in real time" },
                { icon: <RotateCcw size={17} />, text: "Easy 7-day hassle-free returns" },
                { icon: <ShieldCheck size={17} />, text: "Secure checkout — UPI, cards & COD" },
                { icon: <Star size={17} />, text: "Members-only flash deals" }
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-[14px] font-medium text-slate-200">
                  <span className="flex h-9 w-9 items-center justify-center rounded-soft bg-white/10 text-blue-300">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex items-center gap-6 text-slate-400">
            <div><p className="text-xl font-extrabold text-white">20+</p><p className="text-xs">Products</p></div>
            <div><p className="text-xl font-extrabold text-white">78</p><p className="text-xs">Reviews</p></div>
            <div><p className="text-xl font-extrabold text-white">4.7★</p><p className="text-xs">Avg rating</p></div>
          </div>
        </div>

        {/* Form panel */}
        <div className="card mx-auto w-full max-w-md p-6 sm:p-9">
          <div className="mb-7 lg:hidden"><Logo /></div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-soft bg-slate-100 p-1 dark:bg-white/5">
            {([
              { id: "signin", label: "Sign In", icon: <LogIn size={14} /> },
              { id: "signup", label: "Sign Up", icon: <UserPlus size={14} /> }
            ]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchMode(t.id)}
                className={`flex items-center justify-center gap-1.5 rounded-soft py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === t.id
                    ? "bg-surface text-primary shadow-sm dark:bg-surface-dark dark:text-blue-300"
                    : "text-ink-soft hover:text-ink dark:text-ink-darkSoft"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft dark:text-ink-darkSoft">
              {mode === "signin"
                ? "Sign in to continue to your shopping experience."
                : "Join NovaCart in seconds — no credit card needed."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <>
                <Input
                  icon={<User size={16} />}
                  id="signup-name"
                  label="Full name"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(v) => set("name", v)}
                  autoComplete="name"
                />
                <Input
                  icon={<Phone size={16} />}
                  id="signup-phone"
                  label="Mobile number (optional)"
                  name="phone"
                  placeholder="Enter your mobile number"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  type="tel"
                  autoComplete="tel"
                />
                <Input
                  icon={<MapPin size={16} />}
                  id="signup-location"
                  label="City (optional)"
                  name="location"
                  placeholder="Enter your city"
                  value={form.location}
                  onChange={(v) => set("location", v)}
                  autoComplete="address-level2"
                />
              </>
            )}
            <Input
              icon={<Mail size={16} />}
              id={mode === "signin" ? "signin-email" : "signup-email"}
              label="Email address"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(v) => set("email", v)}
              type="email"
              autoComplete="email"
            />
            <Input
              icon={<Lock size={16} />}
              id={mode === "signin" ? "signin-password" : "signup-password"}
              label="Password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(v) => set("password", v)}
              type={showPw ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              endAdornment={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="text-ink-soft transition-colors hover:text-ink dark:text-ink-darkSoft dark:hover:text-white"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />

            <button type="submit" disabled={busy} className="btn-primary btn--lg w-full">
              {busy ? <Loader2 size={17} className="animate-spin" /> : mode === "signin" ? <LogIn size={16} /> : <UserPlus size={16} />}
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">
            <span className="h-px flex-1 bg-line dark:bg-line-dark" /> Quick demo login <span className="h-px flex-1 bg-line dark:bg-line-dark" />
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => fill(a)}
                className="flex w-full items-center justify-between rounded-soft border border-line bg-canvas px-4 py-3 text-left transition-colors hover:border-primary/40 dark:border-line-dark dark:bg-canvas-dark"
              >
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-ink-dark">{a.label}</p>
                  <p className="text-xs text-ink-soft dark:text-ink-darkSoft">{a.email} · {a.password}</p>
                </div>
                <span className="text-xs font-semibold text-primary">Use →</span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-[13px] text-ink-soft dark:text-ink-darkSoft">
            {mode === "signin" ? (
              <>New to NovaCart? <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-primary hover:underline">Create an account</button></>
            ) : (
              <>Already registered? <button type="button" onClick={() => switchMode("signin")} className="font-semibold text-primary hover:underline">Sign in</button></>
            )}
          </p>

          <div className="mt-4 flex items-center justify-center gap-5 border-t border-line pt-5 text-[13px] font-medium text-ink-soft dark:border-line-dark dark:text-ink-darkSoft">
            <Link to="/" className="transition-colors hover:text-primary">Home</Link>
            <Link to="/shop" className="transition-colors hover:text-primary">Shop</Link>
            <Link to="/deals" className="transition-colors hover:text-primary">Deals</Link>
            <Link to={`/shop${redirect && redirect !== "/account" ? "" : ""}`} className="inline-flex items-center gap-1 text-primary">
              Browse <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ icon, label, id, endAdornment, onChange, className = "", ...props }) {
  return (
    <div>
      {label && <label htmlFor={id} className="field-label">{label}</label>}
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft">{icon}</span>
        <input
          {...props}
          id={id}
          onChange={(event) => onChange?.(event.target.value)}
          className={`field pl-10 ${endAdornment ? "pr-10" : ""} ${className}`.trim()}
        />
        {endAdornment && <div className="absolute right-3 top-1/2 -translate-y-1/2">{endAdornment}</div>}
      </div>
    </div>
  );
}