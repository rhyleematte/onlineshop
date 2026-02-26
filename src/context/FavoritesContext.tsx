import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (foodId: string) => void;
  isFavorite: (foodId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    supabase.from("favorites").select("food_id").eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setFavorites(data.map(f => f.food_id));
      });
  }, [user]);

  const toggleFavorite = useCallback(async (foodId: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save favorites." });
      return;
    }
    const isFav = favorites.includes(foodId);
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== foodId));
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("food_id", foodId);
    } else {
      setFavorites(prev => [...prev, foodId]);
      await supabase.from("favorites").insert({ user_id: user.id, food_id: foodId });
    }
  }, [user, favorites]);

  const isFavorite = useCallback((foodId: string) => favorites.includes(foodId), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};
