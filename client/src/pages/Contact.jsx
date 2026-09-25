import { useState } from "react";
import { Mail, MapPin, Phone, Clock, Send, MessageSquare, ChevronDown, HelpCircle } from "lucide-react";
import { PageHeader } from "../components/layout/Page";
import { useToast } from "../context/ToastContext";

const FAQS = [
  { q: "How fast is delivery?", a: "Standard delivery takes 3–5 business days and is free on orders above ₹999. Express delivery takes 1–2 business days, and same-day delivery is available in select metro cities." },
  { q: "What is the return policy?", a: "You can raise a return within 7 days of delivery for a full refund. Items must be unused and in their original packaging. Refunds are processed within 3–5 business days." },
  { q: "Which payment methods do you accept?", a: "We accept UPI (GPay, PhonePe, Paytm), all major credit and debit cards, net banking and Cash on Delivery." },
  { q: "Are the products genuine?", a: "Yes. Every product is sourced from authorised brand partners and ships in sealed packaging with a manufacturer warranty." }
];

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "General", message: "" });
  const [openFaq, setOpenFaq] = useState(0);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast("Missing details", "Please fill in your name, email and message.", "warn");
      return;
    }
    setForm({ name: "", email: "", subject: "General", message: "" });
    toast("Message sent", "Our team will get back to you within 24 hours.");
  };

  return (
    <>
      <PageHeader
        eyebrow="We're here to help"
        title="Contact NovaCart"
        subtitle="Questions about an order, a product or a partnership? Reach out — our team replies within a day."
        crumbs={[{ label: "Contact" }]}
      />

      <div data-reveal className="shell grid gap-10 py-14 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <div>
          <form onSubmit={submit} className="card p-6 sm:p-8">
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink dark:text-ink-dark">
              <MessageSquare size={19} className="text-primary" /> Send us a message
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Your name</span>
                <input className="field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Aarav Mehra" />
              </label>
              <label className="block">
                <span className="field-label">Email</span>
                <input type="email" className="field" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
              </label>
              <label className="block sm:col-span-2">
                <span className="field-label">Subject</span>
                <select className="field" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
                  <option>General enquiry</option>
                  <option>Order support</option>
                  <option>Returns & refunds</option>
                  <option>Partnership</option>
                  <option>Feedback</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="field-label">Message</span>
                <textarea rows={5} className="field resize-none" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="How can we help?" />
              </label>
            </div>
            <button type="submit" className="btn-primary btn--lg mt-6 w-full sm:w-auto">
              <Send size={16} /> Send message
            </button>
          </form>

          {/* FAQ */}
          <div className="mt-10">
            <h2 className="mb-5 flex items-center gap-2.5 text-lg font-bold text-ink dark:text-ink-dark">
              <HelpCircle size={19} className="text-primary" /> Frequently asked questions
            </h2>
            <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface dark:divide-line-dark dark:border-line-dark dark:bg-surface-dark">
              {FAQS.map((f, i) => (
                <div key={f.q}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-ink dark:text-ink-dark">{f.q}</span>
                    <ChevronDown size={18} className={`shrink-0 text-ink-soft transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <p className="animate-fade-in px-5 pb-5 text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">{f.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <aside className="space-y-4">
          {[
            { icon: <MapPin size={20} />, title: "Visit us", lines: ["NovaCart HQ, 100 MG Road", "Indiranagar, Bengaluru 560038"] },
            { icon: <Phone size={20} />, title: "Call us", lines: ["+91 98765 43210", "Mon–Sat, 9am–7pm IST"] },
            { icon: <Mail size={20} />, title: "Email", lines: ["hello@novacart.in", "support@novacart.in"] },
            { icon: <Clock size={20} />, title: "Support hours", lines: ["24×7 for order issues", "Typical reply: under 6 hours"] }
          ].map((c) => (
            <div key={c.title} className="card flex gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
                {c.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-ink dark:text-ink-dark">{c.title}</p>
                {c.lines.map((l) => (
                  <p key={l} className="mt-0.5 text-[13px] text-ink-soft dark:text-ink-darkSoft">{l}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-card bg-[#0B1120] p-6 text-white">
            <p className="text-base font-bold">Average response time</p>
            <p className="mt-1 flex items-baseline gap-2 text-3xl font-extrabold">
              &lt; 6<span className="text-lg font-semibold text-slate-300"> hours</span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-primary to-sky-400" />
            </div>
            <p className="mt-2 text-xs text-slate-400">82% of tickets resolved on first reply</p>
          </div>
        </aside>
      </div>
    </>
  );
}