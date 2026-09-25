import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load("nc-cart", []));
  const [wishlist, setWishlist] = useState(() => load("nc-wishlist", []));

  useEffect(() => localStorage.setItem("nc-cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("nc-wishlist", JSON.stringify(wishlist)), [wishlist]);

  const addToCart = (product, qty = 1, toast) => {
    setCart((items) => {
      const existing = items.find((i) => i.productId === product.id);
      if (existing) {
        return items.map((i) =>
          i.productId === product.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i
        );
      }
      return [
        ...items,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0]?.path || "",
          art: product.art,
          accent: product.accent,
          categoryId: product.categoryId,
          qty
        }
      ];
    });
    if (toast) toast("Added to cart", `${product.name} is now in your cart.`);
  };

  const updateQty = (productId, qty) => {
    setCart((items) =>
      qty <= 0
        ? items.filter((i) => i.productId !== productId)
        : items.map((i) => (i.productId === productId ? { ...i, qty: Math.min(qty, 99) } : i))
    );
  };

  const removeFromCart = (productId) =>
    setCart((items) => items.filter((i) => i.productId !== productId));

  const clearCart = () => setCart([]);

  const toggleWishlist = (product, toast) => {
    const inList = wishlist.some((i) => i.productId === product.id);
    if (inList) {
      setWishlist((w) => w.filter((i) => i.productId !== product.id));
      if (toast) toast("Removed from wishlist", `${product.name} was removed.`, "info");
    } else {
      setWishlist((w) => [
        ...w,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.mrp,
          image: product.image || product.images?.[0]?.path || "",
          art: product.art,
          accent: product.accent,
          rating: product.rating,
          reviewCount: product.reviewCount,
          badge: product.badge
        }
      ]);
      if (toast) toast("Saved to wishlist", `${product.name} has been saved for later.`);
    }
  };

  const inWishlist = (id) => wishlist.some((i) => i.productId === id);

  const count = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);

  const value = {
    cart,
    count,
    subtotal,
    wishlist,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    inWishlist
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}