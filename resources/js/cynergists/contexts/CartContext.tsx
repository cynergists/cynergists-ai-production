import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export type CartItemType =
    | 'role'
    | 'plan'
    | 'ai-agent'
    | 'software'
    | 'product';

export interface CartItem {
    id: string;
    type: CartItemType;
    name: string;
    description: string;
    price: number;
    billingPeriod?: 'monthly' | 'annual';
    billingType?: 'monthly' | 'one_time';
    quantity: number;
    metadata?: {
        hoursPerMonth?: number;
        commitment?: 'part-time' | 'full-time';
        [key: string]: unknown;
    };
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cynergists-cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
        setItems((current) => {
            const existingIndex = current.findIndex(
                (item) => item.id === newItem.id,
            );

            if (existingIndex > -1) {
                const updated = [...current];
                updated[existingIndex].quantity += 1;
                return updated;
            }

            return [
                ...current,
                {
                    ...newItem,
                    billingPeriod: newItem.billingPeriod ?? 'monthly',
                    quantity: 1,
                },
            ];
        });
    };

    const removeItem = (id: string) => {
        setItems((current) => current.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, quantity } : item,
            ),
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const toggleCart = () => setIsOpen((prev) => !prev);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                isOpen,
                openCart,
                closeCart,
                toggleCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
