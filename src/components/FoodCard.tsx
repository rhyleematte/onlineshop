import { FoodItem } from "@/types/food";
import { useCart } from "@/context/CartContext";
import { Star, Clock, Flame, Plus, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import FoodDetailModal from "./FoodDetailModal";

interface FoodCardProps {
  food: FoodItem;
  index?: number;
}

const FoodCard = ({ food, index = 0 }: FoodCardProps) => {
  const { addItem } = useCart();
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-elegant"
        onClick={() => setShowDetail(true)}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={food.image}
            alt={food.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-secondary" />
            {food.country}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(food);
            }}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold leading-tight">{food.name}</h3>
            <span className="font-body text-base font-bold text-secondary">${food.price.toFixed(2)}</span>
          </div>
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{food.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              {food.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {food.prepTime}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3" />
              {food.calories} cal
            </span>
          </div>
        </div>
      </motion.div>

      {showDetail && (
        <FoodDetailModal food={food} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
};

export default FoodCard;
