import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import ProductArt from "./ProductArt";
import { Rating, SaleBadge, Price } from "./ui";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";

export default function ProductCard({ product, className = "" }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const { toast } = useToast();
  const wished = inWishlist(product.id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product, toast);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, toast);
  };

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className={`card group flex flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift ${className}`}
    >
      {/* Image area */}
      <div className="relative aspect-square w-full overflow-hidden border-b border-line dark:border-line-dark">
        <ProductArt
          image={product.image || product.images?.[0]?.path}
          alt={product.name}
          art={product.art}
          accent={product.accent}
          className="h-full w-full scale-100 transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {product.badge && (
            <span className="inline-flex items-center rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur">
              {product.badge}
            </span>
          )}
          <SaleBadge price={product.price} originalPrice={product.originalPrice} />
        </div>
        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border bg-surface/90 backdrop-blur transition-all duration-200 hover:scale-110 active:scale-95 dark:bg-surface-dark/90 ${
            wished
              ? "border-danger/30 text-danger"
              : "border-line text-ink-soft hover:border-danger/40 hover:text-danger dark:border-line-dark dark:text-ink-darkSoft"
          }`}
        >
          <Heart size={17} className={wished ? "fill-danger" : ""} />
        </button>
        {product.stock <= 10 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-50/95 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <Rating value={product.rating} count={product.reviewCount} />
        <h3 className="mt-2 line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-primary dark:text-ink-dark dark:group-hover:text-blue-300">
          {product.name}
        </h3>
        <Price
          className="mt-2.5"
          price={product.price}
          originalPrice={product.originalPrice}
          size="md"
        />
        <button
          onClick={handleAdd}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-soft border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white active:scale-[0.98] dark:border-line-dark dark:text-ink-darkSoft dark:group-hover:border-primary dark:group-hover:bg-primary dark:group-hover:text-white"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}