import { useEffect } from "react";
import { useLocation, NavLink, Outlet } from "react-router-dom";
import { Home, ShoppingCart, Heart, LayoutGrid, User } from "lucide-react";
import Navbar from "../nav/Navbar";
import Footer from "../nav/Footer";
import { useStore } from "../../context/StoreContext";
import { initScrollReveal } from "../../lib/reveal";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

const MOBILE_NAV = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/shop", icon: LayoutGrid, label: "Shop" },
  { to: "/cart", icon: ShoppingCart, label: "Cart", badge: true },
  { to: "/wishlist", icon: Heart, label: "Saved", badgeWish: true },
  { to: "/account", icon: User, label: "Account" }
];

function MobileBottomNav() {
  const { count, wishlist } = useStore();
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden dark:border-line-dark dark:bg-surface-dark/95"
    >
      <div className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-ink-soft dark:text-ink-darkSoft"
              }`
            }
          >
            <span className="relative">
              <item.icon size={20} />
              {item.badge && count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
              {item.badgeWish && wishlist.length > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const distractionFree = pathname === "/checkout";
  useEffect(() => initScrollReveal(), []);
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      {!distractionFree && <Navbar />}
      <main className={`flex-1 ${distractionFree ? "" : "pb-20 lg:pb-0"}`}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
      {!distractionFree && <Footer />}
      {!distractionFree && <MobileBottomNav />}
    </div>
  );
}