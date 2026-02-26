import Header from "@/components/Header";
import { useOrderHistory } from "@/context/OrderHistoryContext";
import { Clock, Package, CheckCircle, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const statusConfig = {
  preparing: { icon: Clock, label: "Preparing", className: "text-secondary bg-secondary/10" },
  "on-the-way": { icon: Package, label: "On the Way", className: "text-blue-500 bg-blue-500/10" },
  delivered: { icon: CheckCircle, label: "Delivered", className: "text-success bg-success/10" },
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <h1 className="mb-1 font-display text-3xl font-bold">Order History</h1>
        <p className="mb-6 text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>

        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order, i) => {
              const status = statusConfig[order.status] || statusConfig.preparing;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-display text-sm font-semibold">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-2">
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
