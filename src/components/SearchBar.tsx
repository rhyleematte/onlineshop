import { Search, SlidersHorizontal } from "lucide-react";
import { countries } from "@/data/foods";
import { useState } from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  country: string;
  onCountryChange: (c: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
}

const SearchBar = ({ query, onQueryChange, country, onCountryChange, sortBy, onSortChange }: SearchBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search dishes, cuisines..."
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-xl border px-4 text-sm font-medium transition-colors ${
            showFilters ? "border-secondary bg-gold-light text-secondary" : "border-input hover:bg-muted"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-3 animate-fade-in">
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Country</label>
            <select
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="calories">Lowest Calories</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
