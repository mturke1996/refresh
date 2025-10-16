import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item: MenuItem, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.item.id === item.id);
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.item.id === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          
          return {
            items: [...state.items, { item, quantity }],
          };
        });
      },
      
      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.item.id !== itemId),
        }));
      },
      
      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        
        set((state) => ({
          items: state.items.map((i) =>
            i.item.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, { item, quantity }) => {
          const price = item.discountPercent
            ? item.price * (1 - item.discountPercent / 100)
            : item.price;
          return total + price * quantity;
        }, 0);
      },
      
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, { quantity }) => count + quantity, 0);
      },
    }),
    {
      name: 'refresh-cart-storage',
    }
  )
);

