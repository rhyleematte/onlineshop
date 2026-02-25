import { FoodItem } from "@/types/food";
import { useCart } from "@/context/CartContext";
import { Star, Clock, Flame, MapPin, X, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FoodDetailModalProps {
  food: FoodItem;
  onClose: () => void;
}

const FoodDetailModal = ({ food, onClose }: FoodDetailModalProps) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  const handleAdd = () => {
    addItem(food, quantity, instructions);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden rounded-t-2xl bg-card sm:rounded-2xl sm:shadow-elegant"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative aspect-video overflow-hidden">
            <img src={food.image} alt={food.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
            <button
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-secondary" />
              {food.country}
              <span className="rounded-full bg-muted px-2 py-0.5">{food.category}</span>
            </div>
            <h2 className="mb-1 font-display text-2xl font-bold">{food.name}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{food.description}</p>

            <div className="mb-5 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-secondary text-secondary" />
                {food.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {food.prepTime}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                {food.calories} cal
              </span>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Special Instructions (optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. No onions, extra sauce, allergies..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Add — ${(food.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FoodDetailModal;
