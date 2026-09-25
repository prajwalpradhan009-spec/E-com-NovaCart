import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Menu, X, Search, User, LayoutDashboard, LogOut, UserRound, ChevronRight } from "lucide-react";
import Logo from "../Logo";
import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "./CartDrawer";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "Deals", to: "/deals" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" }
];

function IconButton({ label, badge, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-soft text-ink-soft transition-all duration-200 hover:bg-slate-100 hover:text-primary active:scale-95 dark:text-ink-darkSoft dark:hover:bg-white/5 dark:hover:text-white"
    >
      {children}
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-sm">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count, wishlist } = useStore();
  const { user, signedIn, signOut } = useAuth();
  const { toggle, dark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || cartOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, cartOpen, searchOpen]);

  const ThemeToggle = () => (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex h-10 w-10 items-center justify-center rounded-soft text-ink-soft transition-all duration-200 hover:bg-slate-100 hover:text-primary active:scale-95 dark:text-ink-darkSoft dark:hover:bg-white/5 dark:hover:text-white"
    >
      <span
        className="transition-transform duration-300"
        style={{ transform: dark ? "rotate(180deg)" : "none" }}
      >
        {dark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          </svg>
        )}
      </span>
    </button>
  );

  const handleSignOut = () => {
    signOut();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40">
        {/* Announcement bar */}
        <div className="bg-primary-dark text-white">
          <div className="shell flex h-9 items-center justify-center gap-2 px-3 text-center text-[12.5px] font-medium tracking-wide">
            <span className="hidden sm:inline">Free shipping on orders above ₹999</span>
            <span className="sm:hidden">Free shipping above ₹999</span>
            <span className="hidden items-center gap-1 font-semibold text-blue-100 md:inline-flex">
              ·&nbsp;Mega Deals live now <ChevronRight size={14} />
            </span>
          </div>
        </div>

        {/* Main bar */}
        <div
          className={`border-b border-line bg-surface/90 backdrop-blur-md transition-shadow duration-300 dark:border-line-dark dark:bg-surface-dark/90 ${
            scrolled ? "shadow-soft" : ""
          }`}
        >
          <div className="shell flex h-[80px] items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink lg:hidden dark:text-ink-darkSoft dark:hover:bg-white/5"
              >
                <Menu size={22} />
              </button>
              <Logo />
            </div>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas py-2 pl-3.5 pr-2.5 text-sm text-ink-soft transition-all duration-200 hover:border-primary/50 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-line-dark dark:bg-canvas-dark dark:text-ink-darkSoft"
              >
                <Search size={16} />
                <span className="hidden md:block">Search products…</span>
                <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold md:block dark:border-line-dark dark:bg-surface-dark">
                  /
                </kbd>
              </button>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <IconButton label="Wishlist" badge={wishlist.length} onClick={() => navigate("/wishlist")}>
                <Heart size={20} />
              </IconButton>
              <IconButton label="Cart" badge={count} onClick={() => setCartOpen(true)}>
                <ShoppingCart size={20} />
              </IconButton>

              {!signedIn ? (
                <div className="ml-1 flex items-center gap-2">
                  <button
                    onClick={() => navigate("/auth?mode=signin&redirect=/account")}
                    className="hidden h-9 items-center gap-1.5 rounded-soft border border-line bg-canvas px-3.5 text-[13px] font-semibold text-ink transition-all duration-200 hover:border-primary/50 hover:text-primary sm:inline-flex dark:border-line-dark dark:bg-canvas-dark dark:text-ink-dark dark:hover:text-blue-300"
                  >
                    <UserRound size={15} /> Sign In
                  </button>
                  <button
                    onClick={() => navigate("/auth?mode=signup&redirect=/account")}
                    className="inline-flex h-9 items-center gap-1.5 rounded-soft bg-primary px-3.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:scale-95"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    aria-label="Account"
                    className="ml-0.5 flex h-10 w-10 items-center justify-center overflow-hidden rounded-soft border border-line bg-canvas text-ink-soft transition-all duration-200 hover:border-primary/50 hover:text-primary dark:border-line-dark dark:bg-canvas-dark dark:text-ink-darkSoft"
                  >
                    {user ? (
                      user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="h-9 w-9 rounded-full border border-line object-cover dark:border-line-dark"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                          {user.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      )
                    ) : (
                      <User size={20} />
                    )}
                  </button>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-12 z-50 w-60 animate-scale-in rounded-soft border border-line bg-surface p-1.5 shadow-lift dark:border-line-dark dark:bg-surface-dark">
                        <div className="border-b border-line px-3 py-2.5 dark:border-line-dark">
                          <p className="truncate text-sm font-semibold text-ink dark:text-ink-dark">{user?.name || "Guest"}</p>
                          <p className="truncate text-xs text-ink-soft dark:text-ink-darkSoft">{user?.email || ""}</p>
                        </div>
                        <ProfileItem icon={<UserRound size={16} />} label="My Profile" onClick={() => { setProfileOpen(false); navigate("/account"); }} />
                        <ProfileItem icon={<ShoppingCart size={16} />} label="My Orders" onClick={() => { setProfileOpen(false); navigate("/account/orders"); }} />
                        <ProfileItem icon={<LayoutDashboard size={16} />} label="Admin Dashboard" onClick={() => { setProfileOpen(false); navigate("/admin"); }} />
                        <ProfileItem icon={<LogOut size={16} />} label="Sign Out" danger onClick={handleSignOut} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-surface shadow-pop transition-transform duration-300 ease-out dark:bg-surface-dark ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line p-4 dark:border-line-dark">
            <Logo />
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Mobile">
            {NAV_LINKS.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMenuOpen(false)}
                style={{ animationDelay: `${i * 40}ms` }}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-soft px-3.5 py-3 text-[15px] font-medium transition-all duration-200 animate-fade-up ${
                    isActive
                      ? "bg-primary-soft text-primary-dark dark:bg-blue-500/10 dark:text-blue-300"
                      : "text-ink hover:bg-slate-50 hover:text-primary dark:text-ink-dark dark:hover:bg-white/5"
                  }`
                }
              >
                {link.label}
                <ChevronRight size={16} className="opacity-40" />
              </NavLink>
            ))}
            <div className="border-t border-line pt-3 dark:border-line-dark">
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-soft px-3.5 py-3 text-[15px] font-medium text-ink-soft hover:bg-slate-50 hover:text-primary dark:text-ink-darkSoft dark:hover:bg-white/5"
              >
                <LayoutDashboard size={17} /> Admin Dashboard
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setCartOpen(true);
                }}
                className="flex items-center gap-2.5 rounded-soft px-3.5 py-3 text-[15px] font-medium text-ink-soft hover:bg-slate-50 hover:text-primary dark:text-ink-darkSoft dark:hover:bg-white/5"
              >
                <ShoppingCart size={17} /> View Cart
              </button>
            </div>
          </nav>
          <div className="border-t border-line p-4 dark:border-line-dark">
            <button
              onClick={() => {
                setMenuOpen(false);
                signedIn ? handleSignOut() : navigate("/auth?mode=signin&redirect=/account");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-soft border border-line py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:text-primary dark:border-line-dark dark:text-ink-darkSoft"
            >
              {signedIn ? <LogOut size={16} /> : <UserRound size={16} />}
              {signedIn ? "Sign Out" : "Sign In"}
            </button>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function ProfileItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-soft px-3 py-2.5 text-sm font-medium transition-colors ${
        danger
          ? "text-danger hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-ink hover:bg-slate-50 hover:text-primary dark:text-ink-dark dark:hover:bg-white/5 dark:hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}