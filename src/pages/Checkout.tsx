import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrderHistory } from "@/context/OrderHistoryContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Banknote, ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PaymentMethod = "online" | "cod";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrderHistory();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + tax;

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (items.length === 0 && !orderId) {
    navigate("/cart");
    return null;
  }

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      await addOrder(items, grandTotal);
      // Get latest order id from context is tricky, use a simple id
      const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
      setOrderId(id);
      toast({ title: "Order placed!", description: `Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}` });
      clearCart();
    } catch {
      toast({ title: "Error", description: "Failed to place order.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  // Receipt view
  if (orderId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-lg py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-border bg-card p-6 shadow-elegant"
            id="receipt"
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h1 className="font-display text-2xl font-bold">Order Confirmed!</h1>
              <p className="mt-1 text-sm text-muted-foreground">Thank you for your order</p>
            </div>

            <div className="mb-4 rounded-lg bg-muted/50 p-3 text-center text-xs">
              <span className="text-muted-foreground">Order ID: </span>
              <span className="font-mono font-semibold">{orderId}</span>
            </div>

            <div className="mb-4 border-b border-dashed border-border pb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</h3>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">Items saved to your order history</p>
              ) : null}
            </div>

            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-bold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              {paymentMethod === "cod"
                ? "Please prepare the exact amount for the delivery rider."
                : "Payment has been processed successfully."}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold transition-transform hover:bg-muted active:scale-[0.98]"
              >
                Print Receipt
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="flex-1 rounded-xl bg-secondary py-3 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                View Orders
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-lg py-6">
        <button
          onClick={() => navigate("/cart")}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>

        <h1 className="mb-6 font-display text-3xl font-bold">Checkout</h1>

        {/* Order summary */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order Summary</h3>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("online")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-[0.97] ${
                paymentMethod === "online"
                  ? "border-secondary bg-secondary/5 shadow-md"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <CreditCard className={`h-6 w-6 ${paymentMethod === "online" ? "text-secondary" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold">Online Payment</span>
              <span className="text-[10px] text-muted-foreground">Card / Digital Wallet</span>
            </button>
            <button
              onClick={() => setPaymentMethod("cod")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-[0.97] ${
                paymentMethod === "cod"
                  ? "border-secondary bg-secondary/5 shadow-md"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <Banknote className={`h-6 w-6 ${paymentMethod === "cod" ? "text-secondary" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold">Cash on Delivery</span>
              <span className="text-[10px] text-muted-foreground">Pay when delivered</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {paymentMethod === "online" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <h3 className="mb-3 text-sm font-semibold">Card Details</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handlePlaceOrder}
          disabled={processing}
          className="w-full rounded-xl bg-secondary py-3.5 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : `Pay $${grandTotal.toFixed(2)} — ${paymentMethod === "cod" ? "Cash on Delivery" : "Online"}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
