

"use client";
import { useState, type ReactNode, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UI_TEXT, DOCUMENT_STATUS_OPTIONS, mockBranches, mockRecipesForPOS, ALL_UNITS } from '@/lib/constants';
import type { Product, CartItem, SalesOrder, SalesOrderItem, Recipe, RecipeIngredient } from '@/types';
import Image from 'next/image';
import { PlusCircle, MinusCircle, XCircle, ShoppingCart, Cookie, CakeSlice, Coffee, CheckCircle, Search, Receipt, BookOpen, ListOrdered, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
// Note: Popover and Calendar imports were here but not directly used by POS for checkout date, orderDate defaults to now.
// If orderDate needs to be selectable for a POS sale (uncommon), they could be re-added.

// Communicate with SalesOrdersPage state (conceptual, not actual cross-page state update here)
// In a real app, this would be a global state manager or API call.
let salesOrdersFromPOS: SalesOrder[] = [];
export const addSalesOrderFromPOS = (order: SalesOrder) => {
  salesOrdersFromPOS.push(order);
};
export const getSalesOrdersFromPOS = () => {
    const orders = [...salesOrdersFromPOS];
    salesOrdersFromPOS = []; // Clear after fetching if they are meant to be transient
    return orders;
};


const mockProducts: Product[] = [
  { id: '1', name: 'Concha de Vainilla', price: 1500, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, aiHint: 'sweet bread', recipeId: 'r1' },
  { id: '2', name: 'Bolillo', price: 500, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_SALADO, aiHint: 'bread roll' },
  { id: '3', name: 'Oreja', price: 1800, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, aiHint: 'palmier pastry' },
  { id: '4', name: 'Empanada de Piña', price: 2000, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, aiHint: 'empanada pastry', recipeId: 'r_empanada' },
  { id: '5', name: 'Pastel de Chocolate (Rebanada)', price: 4500, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PASTELES, aiHint: 'chocolate cake' },
  { id: '6', name: 'Café Americano', price: 2500, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.BEBIDAS, aiHint: 'coffee cup' },
  { id: '7', name: 'Croissant', price: 2200, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, aiHint: 'croissant pastry' },
  { id: '8', name: 'Baguette', price: 3000, imageUrl: 'https://placehold.co/150x150.png', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_SALADO, aiHint: 'baguette bread' },
];

const categoryIcons: Record<string, ReactNode> = {
  [UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE]: <Cookie className="h-5 w-5 mr-2 text-accent" />,
  [UI_TEXT.PRODUCT_CATEGORIES.PAN_SALADO]: <Image src="/icons/bread_icon.svg" alt="Pan Salado" width={20} height={20} className="mr-2 text-accent" data-ai-hint="bread loaf"/>,
  [UI_TEXT.PRODUCT_CATEGORIES.PASTELES]: <CakeSlice className="h-5 w-5 mr-2 text-accent" />,
  [UI_TEXT.PRODUCT_CATEGORIES.BEBIDAS]: <Coffee className="h-5 w-5 mr-2 text-accent" />,
};


function ProductCard({ product, onAddToCart, onViewRecipe }: { product: Product; onAddToCart: (product: Product) => void; onViewRecipe: (product: Product) => void; }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0 relative">
        <Image src={product.imageUrl} alt={product.name} width={200} height={200} className="w-full h-40 object-cover" data-ai-hint={product.aiHint}/>
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold">
          ₡{product.price.toFixed(0)}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</h3>
        <p className="text-sm text-muted-foreground flex items-center">
          {categoryIcons[product.category] || null}
          {product.category}
        </p>
      </CardContent>
      <CardFooter className="p-3 border-t flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => onAddToCart(product)} className="w-full" variant="default" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {UI_TEXT.ADD_TO_CART}
        </Button>
         {product.recipeId && (
          <Button onClick={() => onViewRecipe(product)} className="w-full" variant="outline" size="sm">
            <BookOpen className="mr-2 h-4 w-4" />
            {UI_TEXT.VIEW_RECIPE}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [currentSaleDetails, setCurrentSaleDetails] = useState<Partial<SalesOrder>>({});
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);


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

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const handleOpenCheckoutModal = () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrito Vacío",
        description: "Agregue productos al carrito antes de cobrar.",
      });
      return;
    }
    setCurrentSaleDetails({
      documentNumber: `SALE-${Date.now().toString().slice(-6)}`,
      branchId: mockBranches[0]?.id || '', 
      orderDate: new Date().toISOString(),
      items: cart.map(cartItem => ({
        id: cartItem.id, 
        productId: cartItem.id,
        productName: cartItem.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.price,
      })),
      status: 'completed',
      totalAmount: total,
      customerName: '',
      paymentMethod: '',
      notes: '',
      requiresOpenCashRegister: true,
    });
    setIsCheckoutModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    setCurrentSaleDetails({});
  }

  const handleSaleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentSaleDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaleSelectChange = (name: keyof SalesOrder, value: string) => {
    setCurrentSaleDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmCheckout = () => {    
    if (!currentSaleDetails.branchId || !currentSaleDetails.paymentMethod) {
        toast({ variant: 'destructive', title: 'Error', description: 'Sucursal y método de pago son requeridos.' });
        return;
    }

    const newSale: SalesOrder = {
      id: `so-pos-${Date.now()}`, // Unique ID for POS sales
      documentNumber: currentSaleDetails.documentNumber || `SALE-${Date.now().toString().slice(-6)}`,
      branchId: currentSaleDetails.branchId!,
      orderDate: currentSaleDetails.orderDate || new Date().toISOString(),
      items: currentSaleDetails.items!,
      status: 'completed',
      totalAmount: currentSaleDetails.totalAmount!,
      customerName: currentSaleDetails.customerName,
      paymentMethod: currentSaleDetails.paymentMethod!,
      notes: currentSaleDetails.notes,
      aiHint: 'sales receipt',
      requiresOpenCashRegister: true,
    };
    
    addSalesOrderFromPOS(newSale); // Add to the list for SalesOrdersPage

    toast({
      title: "Éxito",
      description: UI_TEXT.TRANSACTION_SUCCESS,
      action: <CheckCircle className="text-green-500" />,
    });
    setCart([]); 
    handleCloseCheckoutModal();
  };

  const handleViewRecipe = (product: Product) => {
    if (product.recipeId) {
      const recipe = mockRecipesForPOS.find(r => r.id === product.recipeId);
      if (recipe) {
        // @ts-ignore // RecipeIngredient has temp id in full Recipe type, not needed here.
        setSelectedRecipe(recipe);
        setIsRecipeModalOpen(true);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Receta no encontrada." });
      }
    }
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
    <>
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
                      <ProductCard key={product.id} product={product} onAddToCart={addToCart} onViewRecipe={handleViewRecipe} />
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
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button onClick={handleOpenCheckoutModal} className="flex-1" size="lg">
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

    {/* Checkout Dialog */}
    <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center"><Receipt className="mr-2 h-5 w-5"/>Confirmar Venta</DialogTitle>
            <DialogDescription>
              Revise los detalles de la venta y complete la información del cliente.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1">
            <div className="grid gap-4 py-4 pr-2">
                <div className="space-y-1">
                    <Label htmlFor="checkout-docNo">{UI_TEXT.DOCUMENT_NUMBER}</Label>
                    <Input id="checkout-docNo" value={currentSaleDetails.documentNumber || ''} readOnly disabled />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="checkout-branch">{UI_TEXT.BRANCH_LABEL}</Label>
                    <Select name="branchId" value={currentSaleDetails.branchId || ''} onValueChange={(value) => handleSaleSelectChange('branchId', value)}>
                        <SelectTrigger id="checkout-branch"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                        {mockBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="checkout-customerName">{UI_TEXT.CUSTOMER_NAME} (Opcional)</Label>
                    <Input id="checkout-customerName" name="customerName" value={currentSaleDetails.customerName || ''} onChange={handleSaleDetailChange} placeholder="Cliente Contado"/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="checkout-paymentMethod">{UI_TEXT.PAYMENT_METHOD}</Label>
                    <Input id="checkout-paymentMethod" name="paymentMethod" value={currentSaleDetails.paymentMethod || ''} onChange={handleSaleDetailChange} placeholder="Ej: Efectivo, Tarjeta, SINPE"/>
                </div>

                <Card className="mt-2">
                    <CardHeader className="p-3">
                        <CardTitle className="text-md">Resumen del Carrito</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 text-sm">
                        <ul className="space-y-1">
                        {cart.map(item => (
                            <li key={item.id} className="flex justify-between">
                            <span>{item.name} (x{item.quantity})</span>
                            <span>₡{(item.price * item.quantity).toFixed(0)}</span>
                            </li>
                        ))}
                        </ul>
                        <hr className="my-2"/>
                        <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₡{total.toFixed(0)}</span>
                        </div>
                    </CardContent>
                </Card>
                 <div className="space-y-1">
                    <Label htmlFor="checkout-notes">{UI_TEXT.NOTES} (Opcional)</Label>
                    <Textarea id="checkout-notes" name="notes" value={currentSaleDetails.notes || ''} onChange={handleSaleDetailChange} rows={2}/>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="checkout-requiresOpenCashRegister" checked={currentSaleDetails?.requiresOpenCashRegister || false} disabled />
                    <Label htmlFor="checkout-requiresOpenCashRegister" className="text-xs text-muted-foreground">{UI_TEXT.CASH_REGISTER_OPEN_REQUIRED}</Label>
                </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={handleCloseCheckoutModal}>{UI_TEXT.CANCEL}</Button>
            <Button onClick={handleConfirmCheckout}><CheckCircle className="mr-2 h-4 w-4"/>Confirmar y Cobrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* Recipe View Dialog */}
    {selectedRecipe && (
        <Dialog open={isRecipeModalOpen} onOpenChange={setIsRecipeModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                {UI_TEXT.RECIPE_DETAILS}: {selectedRecipe.name}
              </DialogTitle>
              <DialogDescription>
                Rendimiento: {selectedRecipe.yieldQuantity} {selectedRecipe.yieldUnit}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-1">
              <div className="space-y-4 py-4 pr-2">
                <div>
                  <h4 className="font-semibold text-md mb-1 flex items-center">
                    <ListOrdered className="mr-2 h-4 w-4 text-muted-foreground"/>{UI_TEXT.INGREDIENTS}
                  </h4>
                  <ul className="list-disc list-inside pl-4 space-y-1 text-sm bg-secondary/30 p-3 rounded-md">
                    {selectedRecipe.ingredients.map((ing, index) => (
                      <li key={index}>
                        {ing.name}: {ing.quantity} {ing.unit}
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedRecipe.instructions && (
                  <div>
                    <h4 className="font-semibold text-md mb-1 flex items-center">
                        <ListOrdered className="mr-2 h-4 w-4 text-muted-foreground"/>{UI_TEXT.INSTRUCTIONS}
                    </h4>
                    <Textarea value={selectedRecipe.instructions} readOnly rows={Math.min(10, selectedRecipe.instructions.split('\n').length + 1)} className="text-sm bg-secondary/30"/>
                  </div>
                )}
                 {(selectedRecipe.preparationTime || selectedRecipe.cookingTime) && (
                    <div className="text-sm text-muted-foreground space-y-1">
                        {selectedRecipe.preparationTime && <p className="flex items-center"><Clock className="mr-2 h-4 w-4"/> {UI_TEXT.PREPARATION_TIME}: {selectedRecipe.preparationTime} min.</p>}
                        {selectedRecipe.cookingTime && <p className="flex items-center"><Clock className="mr-2 h-4 w-4"/> {UI_TEXT.COOKING_TIME}: {selectedRecipe.cookingTime} min.</p>}
                    </div>
                 )}
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => setIsRecipeModalOpen(false)}>{UI_TEXT.CANCEL}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

