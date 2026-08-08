import { createContext, createElement, useContext, useMemo, useReducer } from 'react';
import type { CartState } from '../types/cart';
import type { Product } from '../types/product';

type Action =
    | { type: 'ADD_ITEM'; product: Product }
    | { type: 'REMOVE_ITEM'; productId: string }
    | { type: 'SET_QUANTITY'; productId: string; quantity: number }
    | { type: 'CLEAR_CART' };

const initialState: CartState = {
    items: [],
    subtotal: 0,
    deliveryFee: 4.5,
    total: 0,
};

function cartReducer(state: CartState, action: Action): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.items.find((item) => item.product.id === action.product.id);
            const items = existingItem
                ? state.items.map((item) =>
                    item.product.id === action.product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                )
                : [...state.items, { product: action.product, quantity: 1 }];
            return { ...state, items };
        }
        case 'REMOVE_ITEM': {
            const items = state.items.filter((item) => item.product.id !== action.productId);
            return { ...state, items };
        }
        case 'SET_QUANTITY': {
            const items = state.items
                .map((item) =>
                    item.product.id === action.productId
                        ? { ...item, quantity: Math.max(1, action.quantity) }
                        : item,
                )
                .filter((item) => item.quantity > 0);
            return { ...state, items };
        }
        case 'CLEAR_CART':
            return { ...initialState, deliveryFee: state.deliveryFee };
        default:
            return state;
    }
}

function useCartState() {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    const subtotal = useMemo(
        () => state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        [state.items],
    );

    const total = useMemo(() => subtotal + state.deliveryFee, [subtotal, state.deliveryFee]);

    return {
        cart: { ...state, subtotal, total },
        addItem: (product: Product) => dispatch({ type: 'ADD_ITEM', product }),
        removeItem: (productId: string) => dispatch({ type: 'REMOVE_ITEM', productId }),
        setQuantity: (productId: string, quantity: number) =>
            dispatch({ type: 'SET_QUANTITY', productId, quantity }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    };
}

const CartContext = createContext<ReturnType<typeof useCartState> | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    return createElement(CartContext.Provider, { value: useCartState() }, children);
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
