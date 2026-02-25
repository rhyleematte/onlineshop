import { useState, useMemo } from "react";
import { foodItems } from "@/data/foods";
import FoodCard from "@/components/FoodCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";

const Menu = () => {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const filtered = useMemo(() => {
    let result = [...foodItems];
    if (category !== "All") result = result.filter(f => f.category === category);
    if (country) result = result.filter(f => f.country === country);
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.country.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "calories": result.sort((a, b) => a.calories - b.calories); break;
      default: result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [category, query, country, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <h1 className="mb-1 font-display text-3xl font-bold">Our Menu</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          {filtered.length} dish{filtered.length !== 1 ? "es" : ""} available
        </p>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          country={country}
          onCountryChange={setCountry}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <div className="mt-5">
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((food, i) => (
            <FoodCard key={food.id} food={food} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">No dishes found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
