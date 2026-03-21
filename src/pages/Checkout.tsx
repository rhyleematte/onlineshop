import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrderHistory } from "@/context/OrderHistoryContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Banknote, ArrowLeft, CheckCircle2, MapPin, Smartphone, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PaymentMethod = "stripe" | "paypal" | "gcash" | "cod";

const paymentOptions: { id: PaymentMethod; label: string; sub: string; icon: typeof CreditCard }[] = [
  { id: "stripe", label: "Credit / Debit Card", sub: "Visa, Mastercard, etc.", icon: CreditCard },
  { id: "paypal", label: "PayPal", sub: "Pay with PayPal", icon: Wallet },
  { id: "gcash", label: "GCash / PayMaya", sub: "Philippine e-wallets", icon: Smartphone },
  { id: "cod", label: "Cash on Delivery", sub: "Pay when delivered", icon: Banknote },
];

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrderHistory();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [receiptItems, setReceiptItems] = useState(items);

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
    if (!address.trim() || !city.trim() || !phone.trim()) {
      toast({ title: "Missing info", description: "Please fill in your delivery address and phone number.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    setReceiptItems([...items]);
    try {
      const fullAddress = `${address}, ${city}`;
      const id = await addOrder(items, grandTotal, paymentMethod, fullAddress, phone);
      if (id) {
        setOrderId(id);
        toast({ title: "Order placed!", description: `Payment: ${paymentOptions.find(p => p.id === paymentMethod)?.label}` });
        clearCart();
      }
    } catch {
      toast({ title: "Error", description: "Failed to place order.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const paymentLabel = paymentOptions.find(p => p.id === paymentMethod)?.label || paymentMethod;

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
              <span className="font-mono font-semibold">{orderId.slice(-8).toUpperCase()}</span>
            </div>

            <div className="mb-4 border-b border-dashed border-border pb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</h3>
              <div className="space-y-2">
                {receiptItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deliver to</span>
                <span className="text-right font-medium">{address}, {city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{paymentLabel}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(grandTotal / 1.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>${(grandTotal - grandTotal / 1.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              {paymentMethod === "cod"
                ? "Please prepare the exact amount for the delivery rider."
                : `Payment via ${paymentLabel} has been processed successfully.`}
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
                Track Order
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

        {/* Delivery address */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-card">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Delivery Address
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map(({ id, label, sub, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPaymentMethod(id)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-[0.97] ${
                  paymentMethod === id
                    ? "border-secondary bg-secondary/5 shadow-md"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <Icon className={`h-6 w-6 ${paymentMethod === id ? "text-secondary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-[10px] text-muted-foreground">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {paymentMethod === "stripe" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <h3 className="mb-3 text-sm font-semibold">Card Details</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Card Number" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/YY" className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <input type="text" placeholder="CVV" className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <input type="text" placeholder="Cardholder Name" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </motion.div>
          )}
          {paymentMethod === "paypal" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
                <Wallet className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                <p className="text-sm font-medium">You'll be redirected to PayPal after placing your order.</p>
                <p className="mt-1 text-xs text-muted-foreground">Log in to your PayPal account to complete payment.</p>
              </div>
            </motion.div>
          )}
          {paymentMethod === "gcash" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
                <Smartphone className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                <p className="text-sm font-medium">Pay with GCash or PayMaya</p>
                <p className="mt-1 text-xs text-muted-foreground">You'll receive a payment link on your phone after placing the order.</p>
                <input
                  type="tel"
                  placeholder="GCash / PayMaya number"
                  className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handlePlaceOrder}
          disabled={processing}
          className="w-full rounded-xl bg-secondary py-3.5 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : `Pay $${grandTotal.toFixed(2)} — ${paymentLabel}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
