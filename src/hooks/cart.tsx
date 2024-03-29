import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const asyncProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (asyncProducts) {
        setProducts(JSON.parse(asyncProducts));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {}, []);

  const addToCart = useCallback(
    async product => {
      const isRepeatedIndex = products.findIndex(
        productItem => productItem.id === product.id,
      );

      if (isRepeatedIndex === -1) {
        const newProduct: Product = product;

        newProduct.quantity = 1;
        products.push(newProduct);
      } else {
        products[isRepeatedIndex].quantity += 1;
      }

      setProducts([...products]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(
        productItem => productItem.id === id,
      );

      products[productIndex].quantity += 1;

      setProducts([...products]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(
        productItem => productItem.id === id,
      );

      if (products[productIndex].quantity > 1) {
        products[productIndex].quantity -= 1;
      }

      setProducts([...products]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
