import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ArrowRight, ShieldCheck, Truck, RefreshCw, BadgeCheck } from "lucide-react";
import { FaXTwitter, FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";
import Logo from "../Logo";

const SHOP_LINKS = [
  { label: "All Products", to: "/shop" },
  { label: "Electronics", to: "/shop?category=electronics" },
  { label: "Gaming", to: "/shop?category=gaming" },
  { label: "Laptops", to: "/shop?category=laptops" },
  { label: "Deals", to: "/deals" }
];

const COMPANY_LINKS = [
  { label: "About NovaCart", to: "/about" },
  { label: "Categories", to: "/categories" },
  { label: "Contact", to: "/contact" },
  { label: "Admin Dashboard", to: "/admin" },
  { label: "Wishlist", to: "/wishlist" }
];

const SUPPORT_LINKS = [
  { label: "Help Centre", to: "/contact" },
  { label: "Order Status", to: "/account/orders" },
  { label: "Shipping & Returns", to: "/contact" },
  { label: "Privacy Policy", to: "/about" },
  { label: "Terms of Service", to: "/about" }
];

function Column({ title, links }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink dark:text-ink-dark">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-[14px] text-ink-soft transition-colors hover:text-primary dark:text-ink-darkSoft dark:hover:text-blue-300">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      {/* Trust strip */}
      <div className="border-b border-line dark:border-line-dark">
        <div className="shell grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {[
            { icon: <Truck size={22} />, title: "Fast Delivery", text: "2–4 business days" },
            { icon: <RefreshCw size={22} />, title: "Easy Returns", text: "7-day hassle-free" },
            { icon: <BadgeCheck size={22} />, title: "Genuine Products", text: "100% authentic" },
            { icon: <ShieldCheck size={22} />, title: "Secure Payments", text: "UPI, cards & more" }
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
                {f.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink dark:text-ink-dark">{f.title}</p>
                <p className="text-xs text-ink-soft dark:text-ink-darkSoft">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo size="lg" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">
            Premium products, seamless shopping, and reliable delivery — all in one place. Shop smarter with NovaCart.
          </p>
          <div className="mt-6 space-y-3">
            <p className="flex items-center gap-2.5 text-sm text-ink-soft dark:text-ink-darkSoft">
              <MapPin size={16} className="shrink-0 text-primary" /> 100 MG Road, Indiranagar, Bengaluru 560038
            </p>
            <p className="flex items-center gap-2.5 text-sm text-ink-soft dark:text-ink-darkSoft">
              <Phone size={16} className="shrink-0 text-primary" /> +91 98765 43210
            </p>
            <p className="flex items-center gap-2.5 text-sm text-ink-soft dark:text-ink-darkSoft">
              <Mail size={16} className="shrink-0 text-primary" /> hello@novacart.in
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {[
              { icon: <FaXTwitter size={16} />, label: "Twitter" },
              { icon: <FaInstagram size={17} />, label: "Instagram" },
              { icon: <FaFacebookF size={17} />, label: "Facebook" },
              { icon: <FaYoutube size={17} />, label: "YouTube" }
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                onClick={(e) => e.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-soft border border-line text-ink-soft transition-all duration-200 hover:border-primary/40 hover:bg-primary-soft hover:text-primary dark:border-line-dark dark:text-ink-darkSoft dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <Column title="Shop" links={SHOP_LINKS} />
        <Column title="Company" links={COMPANY_LINKS} />
        <Column title="Support" links={SUPPORT_LINKS} />
      </div>

      {/* Newsletter */}
      <div className="border-t border-line dark:border-line-dark">
        <div className="shell flex flex-col items-center justify-between gap-6 py-10 lg:flex-row">
          <div className="max-w-md text-center lg:text-left">
            <h4 className="text-lg font-bold text-ink dark:text-ink-dark">Get member-only deals</h4>
            <p className="mt-1 text-sm text-ink-soft dark:text-ink-darkSoft">
              Subscribe and be first to know about drops, discounts and restocks.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md items-center gap-2 rounded-soft border border-line bg-canvas p-1.5 dark:border-line-dark dark:bg-canvas-dark"
          >
            <Mail size={17} className="ml-2 shrink-0 text-ink-soft dark:text-ink-darkSoft" />
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full bg-transparent px-1 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none dark:text-ink-dark"
            />
            <button type="submit" className="btn-primary shrink-0 px-4 py-2.5 text-sm">
              Subscribe <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-line dark:border-line-dark">
        <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-[13px] text-ink-soft dark:text-ink-darkSoft">
            © {new Date().getFullYear()} NovaCart Technologies. All rights reserved.
          </p>
          <p className="text-[13px] text-ink-soft dark:text-ink-darkSoft">
            Built with <span className="font-semibold text-primary">React</span> · <span className="font-semibold text-primary">Express</span> ·{" "}
            <span className="font-semibold text-primary">MongoDB-ready</span>
          </p>
        </div>
      </div>
    </footer>
  );
}