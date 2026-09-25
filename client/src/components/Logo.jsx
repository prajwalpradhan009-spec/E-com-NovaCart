import { Link } from "react-router-dom";

function LogoMark({ size = 40, className = "" }) {
  return (
    <span
      className={`relative inline-block overflow-hidden rounded-full border border-line bg-canvas shadow-sm dark:border-line-dark dark:bg-canvas-dark ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/image1.jpeg"
        alt="NovaCart logo"
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function Logo({ variant = "dark", size = "md", className = "", to = "/" }) {
  const dims = size === "sm" ? { mark: 34, text: "text-lg" } : size === "lg" ? { mark: 60, text: "text-[30px]" } : { mark: 52, text: "text-2xl" };
  const textColor = variant === "light" ? "text-white" : "text-ink dark:text-ink-dark";
  return (
    <Link to={to} className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="NovaCart home">
      <LogoMark size={dims.mark} className="transition-transform duration-300 group-hover:scale-105" />
      <span className={`${dims.text} font-bold tracking-tight ${textColor}`}>
        Nova<span className="text-primary">Cart</span>
      </span>
    </Link>
  );
}

export default Logo;