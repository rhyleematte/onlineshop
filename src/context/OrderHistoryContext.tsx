import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CartItem } from "@/types/food";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Order {
  id: string;
  items: { food_id: string; food_name: string; food_image: string; food_price: number; quantity: number; special_instructions: string | null }[];
  total: number;
  date: string;
  status: "preparing" | "on-the-way" | "delivered";
}

interface OrderHistoryContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number) => Promise<void>;
  loading: boolean;
}

const OrderHistoryContext = createContext<OrderHistoryContextType | undefined>(undefined);

export const OrderHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch orders from DB
  useEffect(() => {
    if (!user) { setOrders([]); return; }
    setLoading(true);
    supabase
      .from("orders")
      .select("id, total, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(async ({ data: ordersData }) => {
        if (!ordersData) { setLoading(false); return; }
        const fullOrders: Order[] = await Promise.all(
          ordersData.map(async (o) => {
            const { data: items } = await supabase
              .from("order_items")
              .select("food_id, food_name, food_image, food_price, quantity, special_instructions")
              .eq("order_id", o.id);
            return {
              id: o.id,
              total: o.total,
              status: o.status as Order["status"],
              date: o.created_at,
              items: items || [],
            };
          })
        );
        setOrders(fullOrders);
        setLoading(false);
      });
  }, [user]);

  const addOrder = useCallback(async (items: CartItem[], total: number) => {
    if (!user) return;
    const { data: order } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total, status: "preparing" })
      .select("id, created_at")
      .single();

    if (!order) return;

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
      items: orderItems.map(i => ({ ...i, order_id: undefined } as any)),
    };
    setOrders(prev => [newOrder, ...prev]);
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
