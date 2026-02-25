import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, updateQuantity, removeItem, updateInstructions, clearCart, totalPrice } = useCart();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCheckout = () => {
    toast({
      title: "Order Placed Successfully!",
      description: `Your order of $${totalPrice.toFixed(2)} is being prepared. Estimated delivery: 30 minutes.`,
    });
    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-sm text-muted-foreground">Explore our menu and add some delicious dishes</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            Browse Menu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold">Your Order</h1>
            <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-destructive hover:underline"
          >
            Clear All
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-card"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base font-semibold">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.country} • {item.category}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Special Instructions */}
                    {editingId === item.id ? (
                      <div className="mt-2">
                        <textarea
                          value={item.specialInstructions || ""}
                          onChange={(e) => updateInstructions(item.id, e.target.value)}
                          placeholder="Special instructions..."
                          className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                          rows={2}
                          autoFocus
                          onBlur={() => setEditingId(null)}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare className="h-3 w-3" />
                        {item.specialInstructions || "Add instructions"}
                      </button>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-secondary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-4 font-display text-lg font-bold">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-success font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <div className="my-3 border-t border-border" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${(totalPrice * 1.08).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-5 w-full rounded-xl bg-secondary py-3 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Place Order — ${(totalPrice * 1.08).toFixed(2)}
              </button>

              <Link
                to="/menu"
                className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
