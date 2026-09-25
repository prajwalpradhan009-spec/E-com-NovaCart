import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";
import { PageHeader } from "../components/layout/Page";
import { EmptyState } from "../components/ui";

export default function Wishlist() {
  const { wishlist, cart, addToCart, removeFromCart } = useStore();
  const { toast } = useToast();

  const addAll = () => {
    wishlist.forEach((w) => addToCart(w));
    toast("Added to cart", `${wishlist.length} item(s) from your wishlist were added.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Saved for later"
        title="Your Wishlist"
        subtitle={`${wishlist.length} ${wishlist.length === 1 ? "product saved" : "products saved"} — add them to your cart before they sell out.`}
        crumbs={[{ label: "Wishlist" }]}
      />

      <div data-reveal className="shell py-10">
        {wishlist.length === 0 ? (
          <EmptyState
            icon={<Heart size={28} />}
            title="Your wishlist is empty"
            message="Tap the heart on any product to save it here for later."
            action={
              <Link to="/shop" className="btn-primary btn--md">
                Discover products <ArrowRight size={16} />
              </Link>
            }
          />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-soft dark:text-ink-darkSoft">
                {wishlist.filter((w) => cart.some((c) => c.productId === w.productId)).length} already in your cart
              </p>
              <button onClick={addAll} className="btn-primary btn--sm">
                <ShoppingBag size={16} /> Add all to cart
              </button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlist.map((p) => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}