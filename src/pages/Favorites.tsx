import { useMemo } from "react";
import { foodItems } from "@/data/foods";
import { useFavorites } from "@/context/FavoritesContext";
import FoodCard from "@/components/FoodCard";
import Header from "@/components/Header";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Favorites = () => {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const favoriteFoods = useMemo(() => foodItems.filter(f => favorites.includes(f.id)), [favorites]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold">Sign in to see favorites</h2>
          <p className="mb-6 text-sm text-muted-foreground">Create an account to save your favorite dishes</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <h1 className="mb-1 font-display text-3xl font-bold">Your Favorites</h1>
        <p className="mb-6 text-sm text-muted-foreground">{favoriteFoods.length} saved dish{favoriteFoods.length !== 1 ? "es" : ""}</p>

        {favoriteFoods.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">No favorites yet</p>
            <p className="text-sm text-muted-foreground">Tap the heart icon on any dish to save it here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteFoods.map((food, i) => (
              <FoodCard key={food.id} food={food} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
