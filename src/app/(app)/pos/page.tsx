
"use client";
import { useState, type ReactNode, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { UI_TEXT } from '@/lib/constants';
import type { Product, CartItem } from '@/types';
import Image from 'next/image';
import { PlusCircle, MinusCircle, XCircle, ShoppingCart, Cookie, CakeSlice, Coffee, CheckCircle, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';

const mockProducts: Product[] = [
  { id: '1', name: 'Concha de Vainilla', price: 1500, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, aiHint: 'sweet bread' },
  { id: '2', name: 'Bolillo', price: 500, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_SALADO, aiHint: 'bread roll' },
  { id: '3', name: 'Oreja', price: 1800, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, aiHint: 'palmier pastry' },
  { id: '4', name: 'Empanada de Piña', price: 2000, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, aiHint: 'empanada pastry' },
  { id: '5', name: 'Pastel de Chocolate (Rebanada)', price: 4500, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PASTELES, aiHint: 'chocolate cake' },
  { id: '6', name: 'Café Americano', price: 2500, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.BEBIDAS, aiHint: 'coffee cup' },
  { id: '7', name: 'Croissant', price: 2200, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, aiHint: 'croissant pastry' },
  { id: '8', name: 'Baguette', price: 3000, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_SALADO, aiHint: 'baguette bread' },
];

const categoryIcons: Record<string, ReactNode> = {
  [UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE]: <Cookie className="h-5 w-5 mr-2 text-accent" />,
  [UI_TEXT.PRODUCT_CATEGORIES.PAN_SALADO]: <Image src="/icons/bread_icon.svg" alt="Pan Salado" width={20} height={20} className="mr-2 text-accent" data-ai-hint="bread loaf"/>, // Using custom SVG if needed
  [UI_TEXT.PRODUCT_CATEGORIES.PASTELES]: <CakeSlice className="h-5 w-5 mr-2 text-accent" />,
  [UI_TEXT.PRODUCT_CATEGORIES.BEBIDAS]: <Coffee className="h-5 w-5 mr-2 text-accent" />,
};


function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0 relative">
        <Image src={product.imageUrl} alt={product.name} width={200} height={200} className="w-full h-40 object-cover" data-ai-hint={product.aiHint}/>
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold">
          ₡{product.price.toFixed(0)}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-semibold mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground flex items-center">
          {categoryIcons[product.category] || null}
          {product.category}
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button onClick={() => onAddToCart(product)} className="w-full" variant="default">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {UI_TEXT.ADD_TO_CART}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart(prevCart =>
      prevCart
        .map(item =>
          item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    // In a real app, this would process payment and update inventory
    toast({
      title: "Éxito",
      description: UI_TEXT.TRANSACTION_SUCCESS,
      action: <CheckCircle className="text-green-500" />,
    });
    setCart([]); // Clear cart after checkout
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return mockProducts;
    return mockProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      (acc[product.category] = acc[product.category] || []).push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts]);


  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      <div className="flex-grow md:w-2/3 h-full">
        <Card className="h-full flex flex-col shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">{UI_TEXT.POS_TITLE}</CardTitle>
            <CardDescription>Seleccione productos para agregar al carrito.</CardDescription>
             <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-2/3 lg:w-1/2"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0">
            <ScrollArea className="h-full p-6">
              {Object.entries(groupedProducts).map(([category, products]) => (
                <div key={category} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
                    {categoryIcons[category] || null}
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                  </div>
                </div>
              ))}
               {filteredProducts.length === 0 && searchTerm && (
                <p className="text-center text-muted-foreground py-10">No se encontraron productos para "{searchTerm}".</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="md:w-1/3 h-full">
        <Card className="h-full flex flex-col shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-primary">{UI_TEXT.CART_TITLE}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-3">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">{UI_TEXT.NO_ITEMS_IN_CART}</p>
              ) : (
                <ul className="space-y-3">
                  {cart.map(item => (
                    <li key={item.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={item.aiHint} />
                        <div>
                          <p className="font-medium truncate max-w-[120px] sm:max-w-none">{item.name}</p>
                          <p className="text-sm text-muted-foreground">₡{item.price.toFixed(0)} x {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7">
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)} className="h-7 w-7">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -item.quantity)} className="h-7 w-7 text-destructive hover:text-destructive">
                           <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
          {cart.length > 0 && (
            <CardFooter className="flex flex-col gap-3 border-t pt-4">
              <div className="flex justify-between w-full text-lg font-semibold">
                <span>{UI_TEXT.TOTAL}:</span>
                <span>₡{total.toFixed(0)}</span>
              </div>
              <div className="flex gap-2 w-full">
                <Button onClick={handleCheckout} className="flex-1" size="lg">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {UI_TEXT.CHECKOUT} (₡{total.toFixed(0)})
                </Button>
                <Button onClick={() => setCart([])} variant="outline" className="flex-1" size="lg">
                  <XCircle className="mr-2 h-5 w-5" />
                  {UI_TEXT.CLEAR_CART}
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

    