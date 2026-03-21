import Header from "@/components/Header";
import { useOrderHistory } from "@/context/OrderHistoryContext";
import { Clock, Package, CheckCircle, Receipt, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const statusSteps = [
  { key: "preparing", icon: Clock, label: "Preparing" },
  { key: "on-the-way", icon: Truck, label: "On the Way" },
  { key: "delivered", icon: CheckCircle, label: "Delivered" },
];

const statusConfig: Record<string, { className: string }> = {
  preparing: { className: "text-secondary" },
  "on-the-way": { className: "text-blue-500" },
  delivered: { className: "text-success" },
};

function getStepIndex(status: string) {
  return statusSteps.findIndex(s => s.key === status);
}

const OrderTracker = ({ status }: { status: string }) => {
  const currentIdx = getStepIndex(status);
  return (
    <div className="flex items-center justify-between gap-1 py-3">
      {statusSteps.map((step, i) => {
        const StepIcon = step.icon;
        const isCompleted = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? isCurrent
                      ? "border-secondary bg-secondary/10 text-secondary animate-pulse"
                      : "border-success bg-success/10 text-success"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                <StepIcon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] font-medium ${isCompleted ? (isCurrent ? "text-secondary" : "text-success") : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {i < statusSteps.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 rounded ${i < currentIdx ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const OrderHistory = () => {
  const { user } = useAuth();
  const { orders, loading } = useOrderHistory();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold">Sign in to view orders</h2>
          <p className="mb-6 text-sm text-muted-foreground">Your order history will be saved to your account</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex items-center justify-center py-32">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold">No orders yet</h2>
          <p className="mb-6 text-sm text-muted-foreground">Once you place an order, it will appear here</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-6">
      <Header />
      <div className="container py-6">
        <h1 className="mb-1 font-display text-3xl font-bold">Order History</h1>
        <p className="mb-6 text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>

        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order, i) => {
              const cfg = statusConfig[order.status] || statusConfig.preparing;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-display text-sm font-semibold">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}</span>
                  </div>

                  {/* Real-time order tracker */}
                  <OrderTracker status={order.status} />

                  <div className="space-y-2 mt-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img src={item.food_image} alt={item.food_name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.food_name}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-secondary">${(item.food_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                    <span className="font-display text-base font-bold">Total: ${order.total.toFixed(2)}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
