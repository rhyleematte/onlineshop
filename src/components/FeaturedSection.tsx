import { useMemo } from "react";
import { foodItems } from "@/data/foods";
import FoodCard from "./FoodCard";
import { Sparkles } from "lucide-react";

const FeaturedSection = () => {
  const featured = useMemo(
    () => foodItems.filter(f => f.rating >= 4.8).slice(0, 4),
    []
  );

  return (
    <section className="mb-8 rounded-2xl border border-secondary/20 bg-secondary/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Sparkles className="h-4 w-4 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Chef's Picks</h2>
          <p className="text-xs text-muted-foreground">Our most loved dishes, hand-selected by our chef</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((food, i) => (
          <FoodCard key={food.id} food={food} index={i} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
