import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { CartItem } from "@/types/food";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Order {
  id: string;
  items: { food_id: string; food_name: string; food_image: string; food_price: number; quantity: number; special_instructions: string | null }[];
  total: number;
  date: string;
  status: "preparing" | "on-the-way" | "delivered";
  payment_method: string;
  delivery_address: string | null;
  delivery_phone: string | null;
}

interface OrderHistoryContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number, paymentMethod: string, address: string, phone: string) => Promise<string | null>;
  loading: boolean;
}

const OrderHistoryContext = createContext<OrderHistoryContextType | undefined>(undefined);

export const OrderHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch orders from DB
  useEffect(() => {
    if (!user) { setOrders([]); return; }
    setLoading(true);
    supabase
      .from("orders")
      .select("id, total, status, created_at, payment_method, delivery_address, delivery_phone")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(async ({ data: ordersData }) => {
        if (!ordersData) { setLoading(false); return; }
        const fullOrders: Order[] = await Promise.all(
          ordersData.map(async (o: any) => {
            const { data: items } = await supabase
              .from("order_items")
              .select("food_id, food_name, food_image, food_price, quantity, special_instructions")
              .eq("order_id", o.id);
            return {
              id: o.id,
              total: o.total,
              status: o.status as Order["status"],
              date: o.created_at,
              payment_method: o.payment_method || "cod",
              delivery_address: o.delivery_address,
              delivery_phone: o.delivery_phone,
              items: items || [],
            };
          })
        );
        setOrders(fullOrders);
        setLoading(false);
      });
  }, [user]);

  // Realtime subscription for order status updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('order-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setOrders(prev =>
            prev.map(o =>
              o.id === updated.id ? { ...o, status: updated.status as Order["status"] } : o
            )
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  const addOrder = useCallback(async (items: CartItem[], total: number, paymentMethod: string, address: string, phone: string): Promise<string | null> => {
    if (!user) return null;
    const { data: order } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total, status: "preparing", payment_method: paymentMethod, delivery_address: address, delivery_phone: phone })
      .select("id, created_at")
      .single();

    if (!order) return null;

    const orderItems = items.map(i => ({
      order_id: order.id,
      food_id: i.id,
      food_name: i.name,
      food_image: i.image,
      food_price: i.price,
      quantity: i.quantity,
      special_instructions: i.specialInstructions || null,
    }));
    await supabase.from("order_items").insert(orderItems);

    const newOrder: Order = {
      id: order.id,
      total,
      status: "preparing",
      date: order.created_at,
      payment_method: paymentMethod,
      delivery_address: address,
      delivery_phone: phone,
      items: orderItems.map(i => ({ food_id: i.food_id, food_name: i.food_name, food_image: i.food_image, food_price: i.food_price, quantity: i.quantity, special_instructions: i.special_instructions })),
    };
    setOrders(prev => [newOrder, ...prev]);

    // Auto-simulate status progression
    setTimeout(async () => {
      await supabase.from("orders").update({ status: "on-the-way" }).eq("id", order.id);
    }, 30000); // 30 seconds

    setTimeout(async () => {
      await supabase.from("orders").update({ status: "delivered" }).eq("id", order.id);
    }, 90000); // 90 seconds

    return order.id;
  }, [user]);

  return (
    <OrderHistoryContext.Provider value={{ orders, addOrder, loading }}>
      {children}
    </OrderHistoryContext.Provider>
  );
};

export const useOrderHistory = () => {
  const ctx = useContext(OrderHistoryContext);
  if (!ctx) throw new Error("useOrderHistory must be used within OrderHistoryProvider");
  return ctx;
};
