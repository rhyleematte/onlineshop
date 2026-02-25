import { categories } from "@/data/foods";
import { motion } from "framer-motion";

interface CategoryFilterProps {
  selected: string;
  onSelect: (cat: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selected === cat
              ? "text-secondary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {selected === cat && (
            <motion.div
              layoutId="category-bg"
              className="absolute inset-0 rounded-full bg-secondary"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10">{cat}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
