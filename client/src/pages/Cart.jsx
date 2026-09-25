import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, ArrowRight, Tag, Truck, ShieldCheck } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import ProductArt from "../components/ProductArt";
import { PageHeader } from "../components/layout/Page";
import { QtyStepper, EmptyState } from "../components/ui";
import { inr } from "../lib/format";

const FREE_SHIP_LIMIT = 999;
const SHIP_FEE = 149;

export default function Cart() {
  const { cart, subtotal, updateQty, removeFromCart, clearCart } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIP_LIMIT ? 0 : SHIP_FEE;
  const discount = subtotal >= 10000 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;
  const savings = cart.reduce((s, i) => s + (i.originalPrice ? (i.originalPrice - i.price) * i.qty : 0), 0);

  const fill = useMemo(() => Math.min(100, Math.round((subtotal / FREE_SHIP_LIMIT) * 100)), [subtotal]);

  return (
    <>
      <PageHeader
        eyebrow="Your selection"
        title="Shopping Cart"
        subtitle="Review your items, adjust quantities and head to checkout when ready."
        crumbs={[{ label: "Cart" }]}
      />

      {cart.length === 0 ? (
        <div data-reveal className="shell py-10">
          <EmptyState
            icon={<ShoppingCart size={28} />}
            title="Your cart is empty"
            message="Looks like you haven't added anything yet. Explore the catalogue to find something you'll love."
            action={
              <Link to="/shop" className="btn-primary btn--md">
                Start shopping <ArrowRight size={16} />
              </Link>
            }
          />
        </div>
      ) : (
        <div data-reveal className="shell grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <div>
            {/* Free shipping progress */}
            <div className="mb-6 rounded-soft border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark">
              {fill >= 100 ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-success">
                  <Truck size={17} /> You've unlocked free delivery on this order! 🎉
                </p>
              ) : (
                <p className="text-sm text-ink-soft dark:text-ink-darkSoft">
                  Add <span className="font-bold text-ink dark:text-ink-dark">{inr(FREE_SHIP_LIMIT - subtotal)}</span> more to unlock{" "}
                  <span className="font-semibold text-success">free delivery</span>
                </p>
              )}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500" style={{ width: `${fill}%` }} />
              </div>
            </div>

            <div className="overflow-hidden rounded-card border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
              <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-line px-6 py-4 sm:grid dark:border-line-dark">
                <span className="th">Product</span>
                <span className="th">Price</span>
                <span className="th">Quantity</span>
                <span className="th text-right">Subtotal</span>
                <span />
              </div>
              <div className="divide-y divide-line dark:divide-line-dark">
                {cart.map((item) => (
                  <div key={item.productId} className="grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-5 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:px-6">
                    <div className="flex items-center gap-4 sm:col-span-1">
                      <Link
                        to={`/product/${item.productId}`}
                        className="shrink-0 overflow-hidden rounded-soft border border-line dark:border-line-dark"
                      >
                        <div className="h-20 w-20">
                          <ProductArt image={item.image} alt={item.name} art={item.art} accent={item.accent} className="h-full w-full" />
                        </div>
                      </Link>
                      <div>
                        <Link to={`/product/${item.productId}`} className="line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-primary dark:text-ink-dark">
                          {item.name}
                        </Link>
                        <p className="mt-1 text-[13px] text-ink-soft dark:text-ink-darkSoft">{inr(item.price)} each</p>
                        <button
                          onClick={() => {
                            removeFromCart(item.productId);
                            toast("Removed", `${item.name} was removed from your cart.`, "info");
                          }}
                          className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium text-danger/80 hover:text-danger"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>

                    <span className="hidden font-medium text-ink-soft dark:text-ink-darkSoft sm:block sm:text-center">{inr(item.price)}</span>

                    <div className="hidden justify-center sm:flex">
                      <QtyStepper size="sm" value={item.qty} onChange={(v) => updateQty(item.productId, v)} />
                    </div>

                    <span className="hidden text-right text-[15px] font-bold text-ink sm:block dark:text-ink-dark">{inr(item.price * item.qty)}</span>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      aria-label="Remove item"
                      className="hidden h-9 w-9 items-center justify-center justify-self-end rounded-soft text-ink-soft transition-colors hover:bg-red-50 hover:text-danger sm:flex"
                    >
                      <Trash2 size={17} />
                    </button>

                    {/* Mobile row extras */}
                    <div className="col-span-2 flex items-center justify-between border-t border-line pt-3 sm:hidden dark:border-line-dark">
                      <QtyStepper size="sm" value={item.qty} onChange={(v) => updateQty(item.productId, v)} />
                      <span className="text-[15px] font-bold text-ink dark:text-ink-dark">{inr(item.price * item.qty)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark">
                ← Continue shopping
              </Link>
              <button
                onClick={() => {
                  clearCart();
                  toast("Cart cleared", "All items were removed.", "info");
                }}
                className="text-[13px] font-medium text-ink-soft hover:text-danger"
              >
                Clear cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside>
            <div className="sticky top-[118px]">
              <div className="rounded-card border border-line bg-surface p-6 shadow-soft dark:border-line-dark dark:bg-surface-dark">
                <h2 className="mb-5 text-base font-bold text-ink dark:text-ink-dark">Order Summary</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between text-ink-soft dark:text-ink-darkSoft">
                    <dt>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</dt>
                    <dd className="font-semibold text-ink dark:text-ink-dark">{inr(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-soft dark:text-ink-darkSoft">
                    <dt>Shipping</dt>
                    <dd className="font-semibold">{shipping === 0 ? <span className="text-success">FREE</span> : inr(shipping)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-soft dark:text-ink-darkSoft">
                    <dt>Tax (GST)</dt>
                    <dd className="font-semibold text-ink dark:text-ink-dark">Included</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <dt className="flex items-center gap-1.5 font-medium"><Tag size={14} /> Member discount (10%)</dt>
                      <dd className="font-bold">−{inr(discount)}</dd>
                    </div>
                  )}
                  {savings > 0 && (
                    <div className="flex justify-between text-success">
                      <dt className="font-medium">Deal savings</dt>
                      <dd className="font-bold">−{inr(savings)}</dd>
                    </div>
                  )}
                </dl>
                <div className="my-5 h-px bg-line dark:bg-line-dark" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink dark:text-ink-dark">Total</span>
                  <span className="text-2xl font-extrabold tracking-tight text-ink dark:text-ink-dark">{inr(total)}</span>
                </div>
                <button onClick={() => navigate("/checkout")} className="btn-primary btn--lg mt-6 w-full">
                  Proceed to Checkout <ArrowRight size={17} />
                </button>
                <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-ink-soft dark:text-ink-darkSoft">
                  <ShieldCheck size={14} className="text-success" /> 100% secure checkout · UPI · Cards · COD
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}