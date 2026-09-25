import { useState, useEffect } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Shapes, Star, BarChart3, Settings,
  Search, Bell, Menu, X, Home, LogOut
} from "lucide-react";
import Logo from "../../components/Logo";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { initScrollReveal } from "../../lib/reveal";

const NAV = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/customers", icon: Users, label: "Customers" },
  { to: "/admin/categories", icon: Shapes, label: "Categories" },
  { to: "/admin/reviews", icon: Star, label: "Reviews" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/settings", icon: Settings, label: "Settings" }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  useEffect(() => initScrollReveal(), []);

  const sidebar = (
    <div className="flex h-full w-72 flex-col border-r border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <div className="flex h-20 items-center justify-between gap-3 border-b border-line px-4 dark:border-line-dark">
        <Logo />
        <button onClick={() => setSidebarOpen(false)} className="shrink-0 text-ink-soft lg:hidden" aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft/70">Menu</p>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary-soft text-primary-dark dark:bg-blue-500/10 dark:text-blue-300"
                  : "text-ink-soft hover:bg-slate-50 hover:text-ink dark:text-ink-darkSoft dark:hover:bg-white/5 dark:hover:text-white"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line p-3 dark:border-line-dark">
        <Link to="/" className="flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-slate-50 hover:text-ink dark:text-ink-darkSoft dark:hover:bg-white/5">
          <Home size={18} /> Back to store
        </Link>
        <button
          onClick={() => {
            signOut();
            navigate("/");
            toast("Signed out", "You've been signed out of the admin console.", "info");
          }}
          className="flex w-full items-center gap-3 rounded-soft px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-red-50 hover:text-danger dark:text-ink-darkSoft dark:hover:bg-red-500/10"
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark lg:pl-72">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`absolute inset-y-0 left-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {sidebar}
        </div>
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface/90 px-4 backdrop-blur-md sm:px-6 dark:border-line-dark dark:bg-surface-dark/90">
        <div className="flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="inline-flex h-10 w-10 items-center justify-center rounded-soft text-ink-soft hover:bg-slate-100">
            <Menu size={22} />
          </button>
          <Logo />
        </div>
        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            placeholder="Search products, orders, customers…"
            className="field pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toast("Search", "Admin search is a demo — try the Products page filters.", "info");
              }
            }}
          />
        </div>
        <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="inline-flex h-10 w-10 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-slate-100 hover:text-primary dark:text-ink-darkSoft dark:hover:bg-white/5"
          >
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
            )}
          </button>
          <button aria-label="Notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-slate-100 hover:text-primary dark:hover:bg-white/5">
            <Bell size={19} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger" />
          </button>
          <div className="ml-1 flex items-center gap-2.5 rounded-soft border border-line py-1 pl-1 pr-3 dark:border-line-dark">
            {user?.picture ? (
              <img src={user.picture} alt={user?.name || "User"} className="h-8 w-8 rounded-full border border-line object-cover dark:border-line-dark" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {user?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("") || "A"}
              </span>
            )}
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold leading-tight text-ink dark:text-ink-dark">{user?.name || "Admin"}</p>
              <p className="text-[11px] leading-tight text-ink-soft dark:text-ink-darkSoft">{user?.role || "Administrator"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="page-enter mx-auto max-w-[1320px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}