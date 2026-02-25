import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem } from "@/types/food";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: "preparing" | "on-the-way" | "delivered";
}

interface OrderHistoryContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number) => void;
}

const OrderHistoryContext = createContext<OrderHistoryContextType | undefined>(undefined);

export const OrderHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = useCallback((items: CartItem[], total: number) => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      items: [...items],
      total,
      date: new Date().toISOString(),
      status: "preparing",
    };
    setOrders(prev => [newOrder, ...prev]);

    // Simulate status updates
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: "on-the-way" } : o));
    }, 15000);
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: "delivered" } : o));
    }, 30000);
  }, []);

  return (
    <OrderHistoryContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderHistoryContext.Provider>
  );
};

export const useOrderHistory = () => {
  const ctx = useContext(OrderHistoryContext);
  if (!ctx) throw new Error("useOrderHistory must be used within OrderHistoryProvider");
  return ctx;
};
