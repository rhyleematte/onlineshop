import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, UtensilsCrossed, Home, BookOpen, Receipt, Heart, LogIn, LogOut, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/menu", label: "Menu", icon: BookOpen },
    { path: "/favorites", label: "Favorites", icon: Heart },
    { path: "/orders", label: "Orders", icon: Receipt },
    { path: "/cart", label: "Cart", icon: ShoppingCart, badge: totalItems },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
            <UtensilsCrossed className="h-5 w-5 text-secondary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Gastronome</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon, badge }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                {badge ? (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          {user ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === "/auth"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
