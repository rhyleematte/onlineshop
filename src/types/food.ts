export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  prepTime: string;
  calories: number;
  country: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
  specialInstructions?: string;
}

export type FoodCategory = 
  | "All"
  | "Appetizers"
  | "Main Course"
  | "Pasta"
  | "Seafood"
  | "Burgers"
  | "Pizza"
  | "Salads"
  | "Desserts"
  | "Beverages"
  | "Asian"
  | "Mexican";
