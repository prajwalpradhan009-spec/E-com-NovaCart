import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, Truck, CreditCard, Check, ChevronRight, ChevronLeft, ShieldCheck, Package, PartyPopper,
  Home, Briefcase, Lock, ArrowRight, BadgeCheck, Tag, Loader2
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { inr, formatDate } from "../lib/format";
import Logo from "../components/Logo";
import ProductArt from "../components/ProductArt";

const STEPS = [
  { key: "address", label: "Address", icon: MapPin },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "done", label: "Confirmation", icon: PartyPopper }
];

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard", eta: "3–5 business days", fee: 0, desc: "Free on orders above ₹999" },
  { id: "express", label: "Express", eta: "1–2 business days", fee: 149, desc: "Priority shipping & tracking" },
  { id: "same-day", label: "Same-day", eta: "Delivered today", fee: 299, desc: "Available in metro cities" }
];

const PAYMENT_OPTIONS = [
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm", methods: ["QR", "VPA"] },
  { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay", methods: ["card"] },
  { id: "netbanking", label: "Net Banking", hint: "All major banks", methods: ["bank"] },
  { id: "cod", label: "Cash on Delivery", hint: "Pay when it arrives", methods: ["cod"] }
];

export default function Checkout() {
  const { cart, subtotal, clearCart } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);

  const [address, setAddress] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    line: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [deliveryId, setDeliveryId] = useState("standard");
  const [paymentId, setPaymentId] = useState("upi");

  useEffect(() => {
    if (!cart.length && !order) navigate("/cart", { replace: true });
  }, [cart, order, navigate]);

  const delivery = DELIVERY_OPTIONS.find((d) => d.id === deliveryId);
  const discount = subtotal >= 10000 ? Math.round(subtotal * 0.1) : 0;
  const fee = subtotal >= 999 ? 0 : delivery.fee;
  const total = subtotal + fee - discount;

  const addressValid = address.name.trim() && address.email.trim() && address.phone.trim() && address.line.trim() && address.city.trim() && address.state.trim() && address.pincode.trim();

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const d = await api.post("/orders", {
        customer: { name: address.name, email: address.email, phone: address.phone },
        address: { line: address.line, city: address.city, state: address.state, pincode: address.pincode },
        delivery: { method: delivery.label, fee: fee > 0 ? delivery.fee : 0 },
        payment: { method: PAYMENT_OPTIONS.find((p) => p.id === paymentId).label, id: `pay_${Date.now()}` },
        items: cart.map((i) => ({ productId: i.productId, qty: i.qty }))
      });
      setOrder(d.order);
      clearCart();
      setStep(3);
    } catch (err) {
      toast("Order failed", err.message, "error");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark">
      {/* Mini header */}
      <header className="border-b border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        <div className="shell flex h-16 items-center justify-between">
          <Logo />
          <Link to="/cart" className="text-sm font-medium text-ink-soft transition-colors hover:text-primary dark:text-ink-darkSoft">
            ← Back to cart
          </Link>
        </div>
      </header>

      <div data-reveal className="shell py-8 sm:py-12">
        {/* Stepper */}
        <ol className="mb-10 grid grid-cols-4 gap-2 sm:gap-4">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={s.key} className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 sm:h-11 sm:w-11 ${
                      done
                        ? "border-primary bg-primary text-white"
                        : active
                        ? "border-primary bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300"
                        : "border-line bg-surface text-ink-soft dark:border-line-dark dark:bg-surface-dark dark:text-ink-darkSoft"
                    }`}
                  >
                    {done ? <Check size={18} /> : <s.icon size={18} />}
                  </span>
                  <div className="hidden sm:block">
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${done || active ? "text-primary" : "text-ink-soft"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className={`text-sm font-bold ${active ? "text-ink dark:text-ink-dark" : done ? "text-ink dark:text-ink-dark" : "text-ink-soft dark:text-ink-darkSoft"}`}>
                      {s.label}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && <span className={`hidden h-px flex-1 sm:block ${done ? "bg-primary" : "bg-line dark:bg-line-dark"}`} />}
              </li>
            );
          })}
        </ol>

        {step === 3 && order ? (
          <Confirmation order={order} subtotal={subtotal} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              {step === 0 && (
                <section>
                  <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink dark:text-ink-dark">
                    <MapPin size={19} className="text-primary" /> Shipping address
                  </h2>
                  <div className="mt-5 rounded-card border border-line bg-surface p-6 shadow-soft dark:border-line-dark dark:bg-surface-dark">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Full name" value={address.name} onChange={(v) => setAddress((a) => ({ ...a, name: v }))} placeholder="Aryan Verma" />
                      <Field label="Phone number" value={address.phone} onChange={(v) => setAddress((a) => ({ ...a, phone: v }))} placeholder="+91 98765 43210" />
                      <div className="sm:col-span-2">
                        <Field label="Email" value={address.email} onChange={(v) => setAddress((a) => ({ ...a, email: v }))} placeholder="you@example.com" />
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Street address" value={address.line} onChange={(v) => setAddress((a) => ({ ...a, line: v }))} placeholder="House / flat, street, area" />
                      </div>
                      <Field label="City" value={address.city} onChange={(v) => setAddress((a) => ({ ...a, city: v }))} placeholder="Bengaluru" />
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="State" value={address.state} onChange={(v) => setAddress((a) => ({ ...a, state: v }))} placeholder="Karnataka" />
                        <Field label="PIN code" value={address.pincode} onChange={(v) => setAddress((a) => ({ ...a, pincode: v }))} placeholder="560038" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button disabled={!addressValid} onClick={() => setStep(1)} className="btn-primary btn--lg">
                      Continue to delivery <ArrowRight size={17} />
                    </button>
                  </div>
                </section>
              )}

              {step === 1 && (
                <section>
                  <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink dark:text-ink-dark">
                    <Truck size={19} className="text-primary" /> Select delivery
                  </h2>
                  <div className="mt-5 space-y-3">
                    {DELIVERY_OPTIONS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDeliveryId(d.id)}
                        className={`flex w-full items-center justify-between gap-4 rounded-soft border-2 bg-surface p-5 text-left transition-all duration-200 dark:bg-surface-dark ${
                          deliveryId === d.id ? "border-primary shadow-glow" : "border-line hover:border-primary/40 dark:border-line-dark"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`flex h-11 w-11 items-center justify-center rounded-soft ${deliveryId === d.id ? "bg-primary text-white" : "bg-slate-100 text-ink-soft dark:bg-white/5"}`}>
                            <Truck size={20} />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-ink dark:text-ink-dark">{d.label}</p>
                            <p className="mt-0.5 text-[13px] text-ink-soft dark:text-ink-darkSoft">{d.eta} · {d.desc}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-ink dark:text-ink-dark">
                            {d.fee === 0 ? "FREE" : inr(d.fee)}
                          </p>
                          {deliveryId === d.id && <Check size={17} className="mt-1 ml-auto text-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <button onClick={() => setStep(0)} className="btn-ghost btn--md"><ChevronLeft size={16} /> Back</button>
                    <button onClick={() => setStep(2)} className="btn-primary btn--lg">
                      Continue to payment <ArrowRight size={17} />
                    </button>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink dark:text-ink-dark">
                    <CreditCard size={19} className="text-primary" /> Payment method
                  </h2>
                  <div className="mt-5 space-y-3">
                    {PAYMENT_OPTIONS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPaymentId(p.id)}
                        className={`flex w-full items-center justify-between gap-4 rounded-soft border-2 bg-surface p-5 text-left transition-all duration-200 dark:bg-surface-dark ${
                          paymentId === p.id ? "border-primary shadow-glow" : "border-line hover:border-primary/40 dark:border-line-dark"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-ink dark:text-ink-dark">{p.label}</p>
                          <p className="mt-0.5 text-[13px] text-ink-soft dark:text-ink-darkSoft">{p.hint}</p>
                        </div>
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${paymentId === p.id ? "border-primary bg-primary" : "border-line dark:border-line-dark"}`}>
                          {paymentId === p.id && <Check size={12} className="text-white" />}
                        </span>
                      </button>
                    ))}
                  </div>
                  {paymentId === "card" && (
                    <div className="mt-4 grid animate-fade-in gap-4 rounded-soft border border-line bg-surface p-5 sm:grid-cols-2 dark:border-line-dark dark:bg-surface-dark">
                      <div className="sm:col-span-2">
                        <Field label="Card number" value="" onChange={() => {}} placeholder="4242 4242 4242 4242" />
                      </div>
                      <Field label="Expiry" value="" onChange={() => {}} placeholder="MM / YY" />
                      <Field label="CVV" value="" onChange={() => {}} placeholder="•••" />
                    </div>
                  )}
                  <div className="mt-4 flex items-start gap-2 rounded-soft bg-primary-soft p-4 text-[13px] leading-relaxed text-primary-dark dark:bg-blue-500/10 dark:text-blue-300">
                    <ShieldCheck size={17} className="mt-0.5 shrink-0" />
                    Payments are encrypted end-to-end. For this demo, no real transaction happens — your order is simulated.
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <button onClick={() => setStep(1)} className="btn-ghost btn--md"><ChevronLeft size={16} /> Back</button>
                    <button onClick={placeOrder} disabled={placing} className="btn-primary btn--lg">
                      {placing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={17} />}
                      {placing ? "Placing order…" : `Pay ${inr(total)}`}
                    </button>
                  </div>
                </section>
              )}
            </div>

            {/* Summary */}
            <aside>
              <div className="sticky top-24 rounded-card border border-line bg-surface p-6 shadow-soft dark:border-line-dark dark:bg-surface-dark">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-ink dark:text-ink-dark">
                  <Package size={17} className="text-primary" /> Your order
                </h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-soft border border-line dark:border-line-dark">
                        <ProductArt image={item.image} alt={item.name} art={item.art} accent={item.accent} className="h-full w-full" />
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white dark:bg-white dark:text-ink">
                          {item.qty}
                        </span>
                      </div>
                      <p className="line-clamp-2 flex-1 text-[13px] font-medium leading-snug text-ink dark:text-ink-dark">{item.name}</p>
                      <span className="text-sm font-bold text-ink dark:text-ink-dark">{inr(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="my-5 h-px bg-line dark:bg-line-dark" />
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-ink-soft dark:text-ink-darkSoft">
                    <dt>Subtotal</dt><dd className="font-semibold">{inr(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-soft dark:text-ink-darkSoft">
                    <dt>Shipping ({delivery?.label})</dt>
                    <dd className="font-semibold">{fee === 0 ? "FREE" : inr(fee)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <dt className="flex items-center gap-1"><Tag size={13} /> Member discount</dt>
                      <dd className="font-bold">−{inr(discount)}</dd>
                    </div>
                  )}
                </dl>
                <div className="my-5 h-px bg-line dark:bg-line-dark" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink dark:text-ink-dark">Total</span>
                  <span className="text-2xl font-extrabold tracking-tight">{inr(total)}</span>
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-center justify-center text-[12px] text-ink-soft dark:text-ink-darkSoft">
                  <BadgeCheck size={14} className="text-success" /> Secure checkout — we never store card details
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Confirmation({ order, subtotal }) {
  const [address, setAddress] = useState(null);
  useEffect(() => {
    setAddress(order.address);
  }, [order]);
  return (
    <div className="mx-auto max-w-xl animate-scale-in text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
        <Check size={34} className="text-success" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Order confirmed! 🎉</h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">
        Thanks, <span className="font-semibold text-ink dark:text-ink-dark">{order.customer.name}</span>! Your order has been placed and a confirmation has been sent to{" "}
        <span className="font-semibold text-ink dark:text-ink-dark">{order.customer.email}</span>.
      </p>

      <div className="mt-8 rounded-card border border-line bg-surface p-6 text-left shadow-soft dark:border-line-dark dark:bg-surface-dark">
        <div className="flex items-center justify-between border-b border-line pb-4 dark:border-line-dark">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-ink-darkSoft">Order number</p>
            <p className="text-lg font-extrabold text-primary">{order.id}</p>
          </div>
          <span className="chip-green">{order.status}</span>
        </div>
        <dl className="mt-4 space-y-2.5 text-sm">
          <Row label="Placed on" value={formatDate(order.createdAt)} />
          <Row label="Payment" value={order.payment.method} />
          <Row label="Delivery" value={order.delivery.method} />
          <Row label="Items" value={order.items.reduce((s, i) => s + i.qty, 0)} />
          <Row label="Amount paid" value={inr(order.total)} strong />
        </dl>
        <div className="mt-4 rounded-soft bg-slate-50 p-4 dark:bg-white/[0.04]">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-ink-dark"><Home size={15} className="text-primary" /> Delivering to</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">
            {address?.line}, {address?.city}, {address?.state} — {address?.pincode}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/shop" className="btn-secondary btn--lg">Continue shopping</Link>
        <Link to="/account/orders" className="btn-primary btn--lg">Track your order</Link>
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft dark:text-ink-darkSoft">{label}</dt>
      <dd className={`${strong ? "text-base font-extrabold text-success" : "font-semibold text-ink dark:text-ink-dark"}`}>{value}</dd>
    </div>
  );
}