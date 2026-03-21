import { forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Heart, Receipt, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/menu", label: "Menu", icon: BookOpen },
  { path: "/favorites", label: "Favorites", icon: Heart },
  { path: "/orders", label: "Orders", icon: Receipt },
  { path: "/cart", label: "Cart", icon: ShoppingCart },
];

const BottomNav = forwardRef<HTMLElement>((_, ref) => {
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md sm:hidden">
      <div className="flex items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          const isBadged = path === "/cart" && totalItems > 0;
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-secondary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {isBadged && (
                <span className="absolute -top-0.5 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-secondary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
