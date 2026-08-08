export type NutritionInfo = {
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  ingredients: string[];
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  images: string[];
  nutrition: NutritionInfo;
  highlights: string[];
  badges: string[];
  reviews: Review[];
};
