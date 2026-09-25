import { Link } from "react-router-dom";
import { SiHtml5, SiCss, SiJavascript, SiPython, SiFastapi, SiNodedotjs, SiExpress, SiMongodb, SiGit, SiGithub } from "react-icons/si";
import { ArrowRight, Target, HeartHandshake, Rocket, Leaf, Award, CheckCircle2, Truck, ShieldCheck, RefreshCw, BadgeCheck, Headphones, Wallet, Smartphone, Laptop, Cpu, Gamepad2, Shirt, Home, Dumbbell, Watch } from "lucide-react";
import { PageHeader } from "../components/layout/Page";
import { SectionHeading } from "../components/ui";

const STATS = [
  { value: "12K+", label: "Happy customers" },
  { value: "10L+", label: "Orders delivered" },
  { value: "8", label: "Product categories" },
  { value: "4.8★", label: "Average rating" }
];

const COLLECTIONS = [
  { icon: <Smartphone size={22} />, name: "Mobile & Tablets", text: "Latest smartphones, accessories and power banks." },
  { icon: <Laptop size={22} />, name: "Laptops & Computers", text: "Reliable laptops for work, study and gaming." },
  { icon: <Cpu size={22} />, name: "Electronics", text: "Audio, cameras and gadgets that level up daily life." },
  { icon: <Gamepad2 size={22} />, name: "Gaming", text: "Controllers, keyboards and setups built to win." },
  { icon: <Shirt size={22} />, name: "Fashion", text: "Premium apparel and footwear for every style." },
  { icon: <Home size={22} />, name: "Home & Kitchen", text: "Smart appliances and kitchen essentials for modern living." },
  { icon: <Dumbbell size={22} />, name: "Sports & Fitness", text: "Gear for the gym, the field and the outdoors." },
  { icon: <Watch size={22} />, name: "Accessories", text: "Watches, bags and daily-carry essentials." }
];

const PERKS = [
  { icon: <Truck size={22} />, title: "Free & fast delivery", text: "2–4 day delivery nationwide, free on orders above ₹999." },
  { icon: <ShieldCheck size={22} />, title: "Secure payments", text: "UPI, cards, net banking and cash on delivery." },
  { icon: <RefreshCw size={22} />, title: "Easy 7-day returns", text: "No-questions-asked returns on eligible items." },
  { icon: <BadgeCheck size={22} />, title: "100% genuine", text: "Authentic, sealed products from trusted brands." },
  { icon: <Headphones size={22} />, title: "24×7 support", text: "Real humans on chat and email, replies in under 6 hours." },
  { icon: <Wallet size={22} />, title: "Flexible COD", text: "Pay on delivery across metro and tier-2 cities." }
];

const GLANCE = [
  "Founded in 2023 · HQ in Bengaluru",
  "8 categories · 40+ curated products",
  "Nationwide delivery in 2–4 days",
  "Secure payments & flexible COD",
  "7-day no-questions-asked returns",
  "24×7 customer support"
];

const VALUES = [
  { icon: <Target size={22} />, title: "Quality first", text: "Every product is vetted and sourced from trusted brands." },
  { icon: <HeartHandshake size={22} />, title: "Customer obsession", text: "Support that actually responds, in minutes not days." },
  { icon: <Rocket size={22} />, title: "Fast by default", text: "Warehouse partners near you mean 2–4 day delivery." },
  { icon: <Leaf size={22} />, title: "Sustainable", text: "Eco-friendly packaging and carbon-conscious deliveries." }
];

const MILESTONES = [
  { year: "2023", title: "Founded in Bengaluru", text: "NovaCart begins with a small catalogue of 40 products." },
  { year: "2024", title: "1st million orders", text: "Crossed our first million delivered orders milestone." },
  { year: "2025", title: "8 categories live", text: "From electronics to home & kitchen — powered by partner warehouses." },
  { year: "2026", title: "4.8★ across 12K reviews", text: "A community of shoppers who rate us, and we listen." }
];

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="Building the most loved way to shop online"
        subtitle="NovaCart started with a simple idea: premium products, honest prices and a checkout that never makes you think twice."
        crumbs={[{ label: "About" }]}
      />

      <div data-reveal className="shell py-14">
        {/* Who we are */}
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title="The all-in-one store for modern India"
            />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink dark:text-ink-dark">
              <p>
                NovaCart is a full-fledged online marketplace built to make shopping effortless. We curate premium
                products across <strong className="font-semibold text-ink dark:text-ink-dark">eight categories</strong> —
                from the latest smartphones and gaming setups to fashion, home essentials and fitness gear — so you
                find everything you need in one trusted place.
              </p>
              <p>
                Beyond products, NovaCart provides a complete shopping experience: lightning-fast 2–4 day delivery,
                secure payments with UPI and cards, flexible cash on delivery, 7-day easy returns and a 24×7 support
                team that talks like humans. Every listing is 100% genuine, sealed and backed by a 1-year warranty.
              </p>
              <p>
                We also give sellers and store managers powerful tools — a live admin dashboard, order and inventory
                tracking, customer insights and analytics — built on a modern React and Node full-stack platform. At
                heart we stay true to our founding promise: <em className="font-medium text-primary not-italic">quality first, honest prices, always.</em>
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="card w-full p-7">
              <div className="flex items-center gap-3 border-b border-line pb-4 dark:border-line-dark">
                <span className="flex h-11 w-11 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
                  <Award size={22} />
                </span>
                <div>
                  <p className="text-base font-extrabold text-ink dark:text-ink-dark">NovaCart at a glance</p>
                  <p className="text-xs text-ink-soft dark:text-ink-darkSoft">The quick version</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                {GLANCE.map((g) => (
                  <li key={g} className="flex items-start gap-2.5 text-sm text-ink-soft dark:text-ink-darkSoft">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* What we provide — categories */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="What we provide"
            title="Shop across our curated collections"
            subtitle="Eight hand-picked categories, every product vetted for quality and authenticity."
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {COLLECTIONS.map((c, i) => (
              <div key={c.name} className="card card-hover p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
                  {c.icon}
                </span>
                <h3 className="mt-3.5 text-[15px] font-bold text-ink dark:text-ink-dark">{c.name}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Link to="/categories" className="btn-primary">
              Browse all categories <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* What we provide — services */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="What we provide"
            title="Shopping services that take care of you"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((p, i) => (
              <div key={p.title} className="card card-hover p-6 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
                  {p.icon}
                </span>
                <h3 className="mt-4 text-base font-bold text-ink dark:text-ink-dark">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats band */}
        <div className="mt-16">
          <SectionHeading eyebrow="By the numbers" title="A track record you can trust" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} className="card p-6 text-center animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <p className="text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-ink-soft dark:text-ink-darkSoft">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mt-16">
          <SectionHeading eyebrow="What we believe" title="Our values" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <div key={v.title} className="card card-hover p-6 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-soft bg-primary-soft text-primary dark:bg-blue-500/10 dark:text-blue-300">
                  {v.icon}
                </span>
                <h3 className="mt-4 text-base font-bold text-ink dark:text-ink-dark">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">{v.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="Under the hood"
            title="Built with a modern full-stack"
            subtitle="NovaCart is engineered with a React + Vite frontend, a Node/Express API, and a MongoDB-ready data layer."
          />
          <div className="card p-8">
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
              {TECH.map((t) => (
                <div key={t.name} className="flex flex-col items-center gap-2.5 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-soft border border-line bg-canvas transition-transform duration-300 hover:scale-110 dark:border-line-dark dark:bg-canvas-dark">
                    <span style={{ color: t.color }}>{t.icon}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">{t.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {["React", "Vite", "Tailwind CSS", "Lucide Icons", "REST API", "JSON data store"].map((t) => (
                <span key={t} className="chip-gray">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-16">
          <SectionHeading eyebrow="Journey" title="Milestones" />
          <div className="relative space-y-8 border-l border-line pl-6 dark:border-line-dark">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="relative animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="absolute -left-[31px] top-1 flex h-3 w-3 rounded-full border-2 border-primary bg-surface dark:bg-surface-dark" />
                <div className="flex flex-wrap items-center gap-3">
                  <span className="chip-blue">{m.year}</span>
                  <h3 className="text-base font-bold text-ink dark:text-ink-dark">{m.title}</h3>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">{m.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-card border border-primary/20 bg-primary-soft p-8 text-center sm:p-10 lg:flex-row lg:text-left dark:bg-blue-500/10">
          <div>
            <h3 className="text-xl font-bold text-ink dark:text-ink-dark">Ready to shop the NovaCart way?</h3>
            <p className="mt-1.5 text-sm text-ink-soft dark:text-ink-darkSoft">Join thousands of happy shoppers getting premium products at honest prices.</p>
          </div>
          <Link to="/shop" className="btn-primary btn--lg shrink-0">
            Start shopping <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </>
  );
}