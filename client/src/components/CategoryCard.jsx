import { Link } from "react-router-dom";
import { Cpu, Shirt, Gamepad2, Smartphone, Laptop, Coffee, Dumbbell, Watch, ArrowUpRight } from "lucide-react";
import { formatNumber } from "../lib/format";

const ICONS = {
  chip: Cpu,
  shirt: Shirt,
  gamepad: Gamepad2,
  smartphone: Smartphone,
  laptop: Laptop,
  coffee: Coffee,
  dumbbell: Dumbbell,
  watch: Watch
};

export default function CategoryCard({ category, index = 0 }) {
  const Icon = ICONS[category.art] || Cpu;
  return (
    <Link
      to={`/shop?category=${encodeURIComponent(category.slug)}`}
      className="card card-hover group flex items-center gap-4 p-5 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-soft transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${category.accent}14`, color: category.accent }}
      >
        <Icon size={26} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold text-ink transition-colors group-hover:text-primary dark:text-ink-dark">
          {category.name}
        </h3>
        <p className="mt-0.5 text-[13px] text-ink-soft dark:text-ink-darkSoft">
          {formatNumber(category.productCount || 0)} products
        </p>
      </div>
      <ArrowUpRight
        size={17}
        className="shrink-0 text-ink-soft/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
      />
    </Link>
  );
}