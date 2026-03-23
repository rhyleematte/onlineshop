import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { toast } from "@/hooks/use-toast";
import { Shield, Package, Truck, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
  delivery_address: string | null;
  delivery_phone: string | null;
  user_id: string;
  items: { food_name: string; quantity: number; food_price: number }[];
}

const statusOptions = [
  { value: "preparing", label: "Preparing", icon: Clock, color: "text-amber-500" },
  { value: "on-the-way", label: "On the Way", icon: Truck, color: "text-blue-500" },
  { value: "delivered", label: "Delivered", icon: CheckCircle, color: "text-green-500" },
];

const Admin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" } as any)
      .then(({ data }) => {
        setIsAdmin(!!data);
        if (data) fetchOrders();
        else setLoading(false);
      });
  }, [user]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, total, status, created_at, payment_method, delivery_address, delivery_phone, user_id")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!ordersData) { setLoading(false); return; }

    const full: AdminOrder[] = await Promise.all(
      ordersData.map(async (o: any) => {
        const { data: items } = await supabase
          .from("order_items")
          .select("food_name, quantity, food_price")
          .eq("order_id", o.id);
        return { ...o, items: items || [] };
      })
    );
    setOrders(full);
    setLoading(false);
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast({ title: "Updated", description: `Order status changed to ${newStatus}` });
    }
    setUpdating(null);
  };

  if (!user || isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-display text-2xl font-bold">Access Denied</h2>
          <p className="mb-6 text-sm text-muted-foreground">You need admin privileges to access this page.</p>
          <Link to="/" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-6">
      <Header />
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">{orders.length} orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-display font-semibold">Order #{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                  {order.delivery_address && (
                    <p className="mt-1 text-xs text-muted-foreground">📍 {order.delivery_address}</p>
                  )}
                  {order.delivery_phone && (
                    <p className="text-xs text-muted-foreground">📞 {order.delivery_phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold">${order.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{order.payment_method}</p>
                </div>
              </div>

              <div className="mb-3 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.food_name} x{item.quantity}</span>
                    <span className="text-muted-foreground">${(item.food_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {statusOptions.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => updateStatus(order.id, value)}
                    disabled={updating === order.id || order.status === value}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      order.status === value
                        ? `border-current ${color} bg-current/5`
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    } disabled:opacity-50`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
