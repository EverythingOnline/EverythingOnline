import { Product } from './product';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};
