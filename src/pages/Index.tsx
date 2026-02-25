import { useState, useMemo } from "react";
import { foodItems } from "@/data/foods";
import FoodCard from "@/components/FoodCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import { UtensilsCrossed, ChefHat, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const featured = useMemo(() => foodItems.filter(f => f.rating >= 4.8).slice(0, 4), []);
  const [category, setCategory] = useState("All");

  const popularByCategory = useMemo(() => {
    if (category === "All") return foodItems.slice(0, 8);
    return foodItems.filter(f => f.category === category).slice(0, 8);
  }, [category]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 py-16 text-primary-foreground sm:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-secondary" />
        </div>
        <div className="container relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="mb-4 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Exquisite Dining,<br />Delivered to You
            </h1>
            <p className="mx-auto mb-8 max-w-lg text-base opacity-80 sm:text-lg">
              Discover world-class cuisine from top restaurants. Fresh ingredients, masterful preparation, at your doorstep.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-8 py-3.5 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-105 active:scale-95"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Explore Menu
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-3 divide-x divide-border py-6">
          {[
            { icon: ChefHat, label: "Expert Chefs", value: "28+" },
            { icon: Clock, label: "Fast Delivery", value: "30 min" },
            { icon: Star, label: "Avg. Rating", value: "4.7★" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-2 text-center">
              <Icon className="h-5 w-5 text-secondary" />
              <span className="text-lg font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container py-10">
        <h2 className="mb-1 font-display text-2xl font-bold">Chef's Selection</h2>
        <p className="mb-6 text-sm text-muted-foreground">Our highest rated dishes, curated by our executive chef</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((food, i) => (
            <FoodCard key={food.id} food={food} index={i} />
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="container pb-16">
        <h2 className="mb-1 font-display text-2xl font-bold">Browse by Category</h2>
        <p className="mb-4 text-sm text-muted-foreground">Find your perfect dish</p>
        <CategoryFilter selected={category} onSelect={setCategory} />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularByCategory.map((food, i) => (
            <FoodCard key={food.id} food={food} index={i} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            View Full Menu
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
