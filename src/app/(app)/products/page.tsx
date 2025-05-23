
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UI_TEXT, ALL_PRODUCT_CATEGORIES, ALL_UNITS } from '@/lib/constants';
import type { ManagedProduct, ProductType } from '@/types';
import { PRODUCT_TYPE_OPTIONS } from '@/types'; // Ensure this is exported from types
import { Edit3, Trash2, PlusCircle, ClipboardList } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const initialProducts: ManagedProduct[] = [
  { id: 'p1', name: 'Concha de Vainilla', productType: 'produced_item', category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, price: 15, cost: 5, unit: UI_TEXT.UNITS.UNIDADES, stock: 50, minStockLevel: 20, recipeId: 'r1', imageUrl: 'https://placehold.co/40x40.png', aiHint: 'vanilla concha' },
  { id: 'p2', name: 'Bolsa de Café Grano Entero 250g', productType: 'third_party_sale', category: UI_TEXT.PRODUCT_CATEGORIES.BEBIDAS, price: 120, cost: 80, unit: UI_TEXT.UNITS.UNIDADES, stock: 30, minStockLevel: 10, supplierId: 's1', imageUrl: 'https://placehold.co/40x40.png', aiHint: 'coffee bag' },
  { id: 'p3', name: 'Chispas de Chocolate (uso interno)', productType: 'third_party_production', category: UI_TEXT.RAW_MATERIAL_CATEGORIES.INGREDIENTES, cost: 50, unit: UI_TEXT.UNITS.KG, stock: 10, minStockLevel: 2, supplierId: 's2', imageUrl: 'https://placehold.co/40x40.png', aiHint: 'chocolate chips' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ManagedProduct[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<ManagedProduct>>({});
  const [editingProduct, setEditingProduct] = useState<ManagedProduct | null>(null);
  const { toast } = useToast();

  const handleOpenModal = (product?: ManagedProduct) => {
    setEditingProduct(product || null);
    setCurrentProduct(product ? { ...product } : { name: '', productType: 'produced_item', category: ALL_PRODUCT_CATEGORIES[0], unit: ALL_UNITS[0], stock: 0, minStockLevel: 0 });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct({});
    setEditingProduct(null);
  };

  const handleSaveProduct = () => {
    if (!currentProduct.name || !currentProduct.productType || !currentProduct.category || !currentProduct.unit) {
      toast({ variant: 'destructive', title: 'Error', description: 'Nombre, tipo, categoría y unidad son requeridos.' });
      return;
    }

    // Basic validation for price/cost based on type
    if ((currentProduct.productType === 'third_party_sale' || currentProduct.productType === 'produced_item') && (currentProduct.price === undefined || currentProduct.price < 0)) {
       toast({ variant: 'destructive', title: 'Error', description: 'Precio de venta es requerido y debe ser positivo para este tipo de producto.' });
       return;
    }
     if ((currentProduct.productType === 'third_party_sale' || currentProduct.productType === 'third_party_production') && (currentProduct.cost === undefined || currentProduct.cost < 0)) {
       toast({ variant: 'destructive', title: 'Error', description: 'Costo es requerido y debe ser positivo para este tipo de producto.' });
       return;
    }


    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...currentProduct } as ManagedProduct : p));
      toast({ title: UI_TEXT.EDIT_PRODUCT, description: `El producto "${currentProduct.name}" ha sido actualizado.` });
    } else {
      const newProduct: ManagedProduct = {
        id: `p${Date.now()}`, // simple ID
        name: currentProduct.name!,
        productType: currentProduct.productType!,
        category: currentProduct.category!,
        unit: currentProduct.unit!,
        price: currentProduct.price,
        cost: currentProduct.cost,
        supplierId: currentProduct.supplierId,
        recipeId: currentProduct.recipeId,
        description: currentProduct.description,
        imageUrl: currentProduct.imageUrl || `https://placehold.co/40x40.png?text=${currentProduct.name!.substring(0,2)}`,
        aiHint: currentProduct.aiHint || 'product item',
        stock: currentProduct.stock || 0,
        minStockLevel: currentProduct.minStockLevel || 0,
      };
      setProducts([...products, newProduct]);
      toast({ title: UI_TEXT.ADD_PRODUCT, description: `El producto "${newProduct.name}" ha sido agregado.` });
    }
    handleCloseModal();
  };

  const handleDeleteProduct = (productId: string) => {
    const productName = products.find(p => p.id === productId)?.name;
    setProducts(products.filter(p => p.id !== productId));
    toast({ title: 'Producto Eliminado', description: `El producto "${productName}" ha sido eliminado.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumberField = type === 'number' || name === 'price' || name === 'cost' || name === 'stock' || name === 'minStockLevel';
    setCurrentProduct(prev => prev ? { ...prev, [name]: isNumberField ? parseFloat(value) : value } : {});
  };

  const handleSelectChange = (name: keyof ManagedProduct, value: string) => {
    setCurrentProduct(prev => prev ? { ...prev, [name]: value } : {});
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <ClipboardList className="mr-2 h-6 w-6" />
          {UI_TEXT.PRODUCTS_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_PRODUCTS_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => handleOpenModal()} variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_PRODUCT}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] hidden sm:table-cell"></TableHead>
                <TableHead>{UI_TEXT.ITEM_NAME}</TableHead>
                <TableHead>{UI_TEXT.PRODUCT_TYPE}</TableHead>
                <TableHead>{UI_TEXT.CATEGORY}</TableHead>
                <TableHead className="text-right">{UI_TEXT.PRICE}</TableHead>
                <TableHead className="text-right">{UI_TEXT.COST}</TableHead>
                <TableHead className="text-right">{UI_TEXT.STOCK}</TableHead>
                <TableHead>{UI_TEXT.UNIT}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image src={product.imageUrl || `https://placehold.co/40x40.png?text=${product.name.substring(0,1)}`} alt={product.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={product.aiHint || 'product item'} />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{UI_TEXT.PRODUCT_TYPES_LABELS[product.productType]}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">{product.price !== undefined ? `$${product.price.toFixed(2)}` : '-'}</TableCell>
                  <TableCell className="text-right">{product.cost !== undefined ? `$${product.cost.toFixed(2)}` : '-'}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)} className="text-primary hover:text-primary/80">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {products.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? UI_TEXT.EDIT_PRODUCT : UI_TEXT.ADD_PRODUCT}</DialogTitle>
            <DialogDescription>
              {editingProduct ? `Actualice los detalles del producto "${editingProduct.name}".` : "Ingrese los detalles del nuevo producto."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right col-span-1">Nombre</Label>
              <Input id="name" name="name" value={currentProduct?.name || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productType" className="text-right col-span-1">{UI_TEXT.PRODUCT_TYPE}</Label>
              <Select name="productType" value={currentProduct?.productType || ''} onValueChange={(value) => handleSelectChange('productType', value as ProductType)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={`Seleccione ${UI_TEXT.PRODUCT_TYPE.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right col-span-1">{UI_TEXT.CATEGORY}</Label>
              <Select name="category" value={currentProduct?.category || ''} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={`Seleccione ${UI_TEXT.CATEGORY.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PRODUCT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right col-span-1">{UI_TEXT.UNIT}</Label>
              <Select name="unit" value={currentProduct?.unit || ''} onValueChange={(value) => handleSelectChange('unit', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={`Seleccione ${UI_TEXT.UNIT.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_UNITS.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            { (currentProduct.productType === 'third_party_sale' || currentProduct.productType === 'produced_item') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right col-span-1">{UI_TEXT.PRICE}</Label>
                <Input id="price" name="price" type="number" value={currentProduct?.price || ''} onChange={handleChange} className="col-span-3" placeholder="0.00" />
              </div>
            )}

            { (currentProduct.productType === 'third_party_sale' || currentProduct.productType === 'third_party_production') && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cost" className="text-right col-span-1">{UI_TEXT.COST}</Label>
                  <Input id="cost" name="cost" type="number" value={currentProduct?.cost || ''} onChange={handleChange} className="col-span-3" placeholder="0.00" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplierId" className="text-right col-span-1">{UI_TEXT.SUPPLIER}</Label>
                  {/* TODO: Replace with a Select populated by actual suppliers */}
                  <Input id="supplierId" name="supplierId" value={currentProduct?.supplierId || ''} onChange={handleChange} className="col-span-3" placeholder="ID de Proveedor (ej: s1)" />
                </div>
              </>
            )}
            
            {currentProduct.productType === 'produced_item' && (
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipeId" className="text-right col-span-1">{UI_TEXT.RECIPE}</Label>
                 {/* TODO: Replace with a Select populated by actual recipes */}
                <Input id="recipeId" name="recipeId" value={currentProduct?.recipeId || ''} onChange={handleChange} className="col-span-3" placeholder="ID de Receta (ej: r1)"/>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right col-span-1">{UI_TEXT.STOCK}</Label>
              <Input id="stock" name="stock" type="number" value={currentProduct?.stock || 0} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minStockLevel" className="text-right col-span-1">{UI_TEXT.MIN_STOCK}</Label>
              <Input id="minStockLevel" name="minStockLevel" type="number" value={currentProduct?.minStockLevel || 0} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right col-span-1 pt-2">{UI_TEXT.DESCRIPTION}</Label>
              <Textarea id="description" name="description" value={currentProduct?.description || ''} onChange={handleChange} className="col-span-3" rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right col-span-1">URL de Imagen</Label>
              <Input id="imageUrl" name="imageUrl" value={currentProduct?.imageUrl || ''} onChange={handleChange} className="col-span-3" placeholder="https://placehold.co/40x40.png"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aiHint" className="text-right col-span-1">AI Hint (imagen)</Label>
              <Input id="aiHint" name="aiHint" value={currentProduct?.aiHint || ''} onChange={handleChange} className="col-span-3" placeholder="ej: pan dulce"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
            <Button type="submit" onClick={handleSaveProduct}>{UI_TEXT.SAVE_CHANGES}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
