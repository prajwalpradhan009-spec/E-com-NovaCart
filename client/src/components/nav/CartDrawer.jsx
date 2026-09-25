import { useNavigate } from "react-router-dom";
import { X, ShoppingCart, Trash2, ArrowRight, Tag } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import ProductArt from "../ProductArt";
import { QtyStepper } from "../ui";
import { inr } from "../../lib/format";
import { discountPct } from "../../lib/format";

export default function CartDrawer({ open, onClose }) {
  const { cart, subtotal, updateQty, removeFromCart } = useStore();
  const navigate = useNavigate();
  if (!open) return null;

  const savings = cart.reduce((s, i) => s + (i.originalPrice ? (i.originalPrice - i.price) * i.qty : 0), 0);

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-pop transition-transform duration-300 ease-out dark:bg-surface-dark ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 dark:border-line-dark">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink dark:text-ink-dark">
            <ShoppingCart size={19} className="text-primary" /> Your Cart
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-dark dark:bg-blue-500/10 dark:text-blue-300">
              {cart.length}
            </span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="inline-flex h-10 w-10 items-center justify-center rounded-soft text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <X size={22} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-ink-soft dark:bg-white/5">
              <ShoppingCart size={26} />
            </div>
            <p className="text-base font-semibold text-ink dark:text-ink-dark">Your cart is empty</p>
            <p className="text-sm text-ink-soft dark:text-ink-darkSoft">Add a few products and they'll show up here.</p>
            <button
              onClick={() => {
                onClose();
                navigate("/shop");
              }}
              className="btn-primary btn--md mt-2"
            >
              Start Shopping <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3 rounded-soft border border-line p-3 dark:border-line-dark">
                  <button
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-soft border border-line dark:border-line-dark"
                    onClick={() => {
                      onClose();
                      navigate(`/product/${item.productId}`);
                    }}
                  >
                    <ProductArt image={item.image} alt={item.name} art={item.art} accent={item.accent} className="h-full w-full" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ink dark:text-ink-dark">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        aria-label="Remove item"
                        className="shrink-0 rounded p-1 text-ink-soft transition-colors hover:bg-red-50 hover:text-danger"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper size="sm" value={item.qty} onChange={(v) => updateQty(item.productId, v)} />
                      <span className="text-sm font-bold text-ink dark:text-ink-dark">{inr(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line p-5 dark:border-line-dark">
              {savings > 0 && (
                <div className="mb-3 flex items-center gap-2 rounded-soft bg-emerald-50 px-3.5 py-2.5 text-[13px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Tag size={15} /> You're saving {inr(savings)} on this order
                </div>
              )}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-ink-soft dark:text-ink-darkSoft">Subtotal</span>
                <span className="text-xl font-bold text-ink dark:text-ink-dark">{inr(subtotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => { onClose(); navigate("/cart"); }} className="btn-secondary btn--md">
                  View Cart
                </button>
                <button onClick={() => { onClose(); navigate("/checkout"); }} className="btn-primary btn--md">
                  Checkout <ArrowRight size={16} />
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-ink-soft dark:text-ink-darkSoft">
                Free shipping on orders above ₹999
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}