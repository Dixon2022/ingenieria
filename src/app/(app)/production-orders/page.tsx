
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { UI_TEXT, ALL_UNITS, DOCUMENT_STATUS_OPTIONS } from '@/lib/constants';
import type { ProductionOrder, ProductionOrderItemConsumed, Branch, Recipe, ManagedProduct, RawMaterial } from '@/types';
import { Edit3, Trash2, PlusCircle, Cog, PackagePlus, PackageMinus, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Mock data
const mockBranches: Pick<Branch, 'id' | 'name'>[] = [
  { id: 'b1', name: 'Sucursal Centro' },
  { id: 'b2', name: 'Sucursal Norte' },
];
const mockRecipes: Pick<Recipe, 'id' | 'name' | 'producesProductId' | 'yieldQuantity' | 'yieldUnit' | 'ingredients'>[] = [
  { 
    id: 'r1', 
    name: 'Receta de Concha de Vainilla (Estándar)', 
    producesProductId: 'p1',
    yieldQuantity: 12, 
    yieldUnit: UI_TEXT.UNITS.UNIDADES,
    ingredients: [
      { id: 'ing1', itemId: 'rm1', itemType: 'raw_material', name: 'Harina de Trigo', quantity: 0.5, unit: UI_TEXT.UNITS.KG },
      { id: 'ing2', itemId: 'rm2', itemType: 'raw_material', name: 'Azúcar Refinada', quantity: 0.2, unit: UI_TEXT.UNITS.KG },
    ]
  },
];
const mockProducibleProducts: Pick<ManagedProduct, 'id' | 'name' | 'unit'>[] = [
  { id: 'p1', name: 'Concha de Vainilla', unit: UI_TEXT.UNITS.UNIDADES },
  // Add more if needed by recipes
];


const initialProductionOrders: ProductionOrder[] = [
  { 
    id: 'prod1', 
    documentNumber: 'PROD-2024-001', 
    branchId: 'b1', 
    recipeId: 'r1',
    recipeName: 'Receta de Concha de Vainilla (Estándar)',
    productIdProduced: 'p1',
    productNameProduced: 'Concha de Vainilla',
    quantityToProduce: 24, // e.g., 2 batches of recipe
    unitProduced: UI_TEXT.UNITS.UNIDADES,
    plannedStartDate: new Date().toISOString(),
    consumedItems: [
      { id: 'ci1', itemId: 'rm1', itemType: 'raw_material', itemName: 'Harina de Trigo', quantityRequired: 1, quantityConsumed: 1, unit: UI_TEXT.UNITS.KG },
      { id: 'ci2', itemId: 'rm2', itemType: 'raw_material', itemName: 'Azúcar Refinada', quantityRequired: 0.4, quantityConsumed: 0.4, unit: UI_TEXT.UNITS.KG },
    ],
    status: 'planned',
    aiHint: 'production order form'
  },
];

export default function ProductionOrdersPage() {
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(initialProductionOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<ProductionOrder>>({});
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const { toast } = useToast();

  const handleOpenModal = (order?: ProductionOrder) => {
    setEditingOrder(order || null);
    let initialConsumedItems: ProductionOrderItemConsumed[] = [];
    let initialProductInfo = {};

    if (order) {
      initialConsumedItems = order.consumedItems?.map(it => ({...it})) || [];
      initialProductInfo = {
        productIdProduced: order.productIdProduced,
        productNameProduced: order.productNameProduced,
        unitProduced: order.unitProduced,
      };
    } else if (mockRecipes.length > 0 && mockProducibleProducts.length > 0) {
        // Auto-populate from first recipe if creating new
        const defaultRecipe = mockRecipes[0];
        const product = mockProducibleProducts.find(p => p.id === defaultRecipe.producesProductId);
        initialProductInfo = {
            recipeId: defaultRecipe.id,
            recipeName: defaultRecipe.name,
            productIdProduced: defaultRecipe.producesProductId,
            productNameProduced: product?.name,
            unitProduced: product?.unit || defaultRecipe.yieldUnit,
            quantityToProduce: defaultRecipe.yieldQuantity, // Default to 1 batch
        };
        initialConsumedItems = defaultRecipe.ingredients.map(ing => ({
            id: Date.now().toString() + ing.itemId,
            itemId: ing.itemId,
            itemType: ing.itemType,
            itemName: ing.name,
            quantityRequired: ing.quantity,
            quantityConsumed: ing.quantity, // Default consumed to required
            unit: ing.unit,
        }));
    }


    setCurrentOrder(order ? { ...order, consumedItems: initialConsumedItems, ...initialProductInfo } : { 
      documentNumber: `PROD-${Date.now().toString().slice(-4)}`, 
      branchId: '', 
      plannedStartDate: new Date().toISOString(),
      consumedItems: initialConsumedItems, 
      status: 'planned',
      ...initialProductInfo
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOrder({});
    setEditingOrder(null);
  };

  const handleSaveOrder = () => {
    if (!currentOrder.documentNumber || !currentOrder.branchId || !currentOrder.recipeId || !currentOrder.productIdProduced || !currentOrder.quantityToProduce || !currentOrder.plannedStartDate || !currentOrder.status) {
      toast({ variant: 'destructive', title: 'Error', description: 'Todos los campos principales son requeridos.' });
      return;
    }
    if (!currentOrder.consumedItems || currentOrder.consumedItems.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debe haber insumos consumidos (verificar receta).' });
      return;
    }

    const orderToSave: ProductionOrder = {
      ...(editingOrder || { id: `prod${Date.now()}` }),
      ...currentOrder,
      aiHint: 'production order form'
    } as ProductionOrder;

    if (editingOrder) {
      setProductionOrders(productionOrders.map(o => o.id === editingOrder.id ? orderToSave : o));
      toast({ title: UI_TEXT.EDIT_PRODUCTION_ORDER, description: `La orden "${orderToSave.documentNumber}" ha sido actualizada.` });
    } else {
      setProductionOrders([...productionOrders, orderToSave]);
      toast({ title: UI_TEXT.ADD_PRODUCTION_ORDER, description: `La orden "${orderToSave.documentNumber}" ha sido agregada.` });
    }
    handleCloseModal();
  };

  const handleDeleteOrder = (orderId: string) => {
    const orderNumber = productionOrders.find(o => o.id === orderId)?.documentNumber;
    setProductionOrders(productionOrders.filter(o => o.id !== orderId));
    toast({ title: 'Orden Eliminada', description: `La orden "${orderNumber}" ha sido eliminada.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setCurrentOrder(prev => prev ? { ...prev, [name]: val } : {});

    if (name === 'quantityToProduce' && currentOrder.recipeId) {
        updateConsumedItemsBasedOnQuantity(currentOrder.recipeId, parseFloat(value));
    }
  };
  
  const updateConsumedItemsBasedOnQuantity = (recipeId: string, quantityToProduce: number) => {
    const recipe = mockRecipes.find(r => r.id === recipeId);
    if (!recipe || isNaN(quantityToProduce) || quantityToProduce <=0) return;

    const batches = quantityToProduce / recipe.yieldQuantity;

    setCurrentOrder(prev => {
        if(!prev) return prev;
        const newConsumedItems = recipe.ingredients.map(ing => ({
            id: Date.now().toString() + ing.itemId,
            itemId: ing.itemId,
            itemType: ing.itemType,
            itemName: ing.name,
            quantityRequired: ing.quantity * batches,
            quantityConsumed: ing.quantity * batches, // Default consumed to required
            unit: ing.unit,
        }));
        return {...prev, consumedItems: newConsumedItems };
    });
  };


  const handleSelectChange = (name: keyof ProductionOrder, value: string) => {
    setCurrentOrder(prev => prev ? { ...prev, [name]: value } : {});
    if (name === 'recipeId') {
      const selectedRecipe = mockRecipes.find(r => r.id === value);
      if (selectedRecipe) {
        const product = mockProducibleProducts.find(p => p.id === selectedRecipe.producesProductId);
        setCurrentOrder(prev => ({
          ...prev,
          recipeName: selectedRecipe.name,
          productIdProduced: selectedRecipe.producesProductId,
          productNameProduced: product?.name,
          unitProduced: product?.unit || selectedRecipe.yieldUnit,
          quantityToProduce: prev?.quantityToProduce || selectedRecipe.yieldQuantity, // Keep existing or default to recipe yield
        }));
        updateConsumedItemsBasedOnQuantity(value, prev?.quantityToProduce || selectedRecipe.yieldQuantity);
      }
    }
  };
  
  const handleDateChange = (name: keyof ProductionOrder, date?: Date) => {
    setCurrentOrder(prev => prev ? { ...prev, [name]: date?.toISOString() } : {});
  };

  const handleConsumedItemChange = (index: number, field: keyof ProductionOrderItemConsumed, value: string | number) => {
    setCurrentOrder(prev => {
      if (!prev || !prev.consumedItems) return prev;
      const newItems = [...prev.consumedItems];
      newItems[index] = { ...newItems[index], [field]: field === 'quantityConsumed' || field === 'quantityRequired' ? Number(value) : value };
      return { ...prev, consumedItems: newItems };
    });
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Cog className="mr-2 h-6 w-6" />
          {UI_TEXT.PRODUCTION_ORDERS_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_PRODUCTION_ORDERS_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => handleOpenModal()} variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_PRODUCTION_ORDER}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI_TEXT.DOCUMENT_NUMBER}</TableHead>
                <TableHead>{UI_TEXT.PRODUCT_TO_PRODUCE}</TableHead>
                <TableHead className="text-right">{UI_TEXT.QUANTITY_TO_PRODUCE}</TableHead>
                <TableHead>{UI_TEXT.PLANNED_START_DATE}</TableHead>
                <TableHead>{UI_TEXT.STATUS}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.documentNumber}</TableCell>
                  <TableCell>{order.productNameProduced || order.productIdProduced}</TableCell>
                  <TableCell className="text-right">{order.quantityToProduce} {order.unitProduced}</TableCell>
                  <TableCell>{format(new Date(order.plannedStartDate), "PPP", { locale: es })}</TableCell>
                  <TableCell>{DOCUMENT_STATUS_OPTIONS[order.status.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label || order.status}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(order)} className="text-primary hover:text-primary/80">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(order.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {productionOrders.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]"> {/* Wider for more fields */}
          <DialogHeader>
            <DialogTitle>{editingOrder ? UI_TEXT.EDIT_PRODUCTION_ORDER : UI_TEXT.ADD_PRODUCTION_ORDER}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] p-1">
            <div className="grid gap-4 py-4 pr-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentNumber">{UI_TEXT.DOCUMENT_NUMBER}</Label>
                  <Input id="documentNumber" name="documentNumber" value={currentOrder?.documentNumber || ''} onChange={handleChange} />
                </div>
                 <div>
                  <Label htmlFor="branchId">{UI_TEXT.BRANCH_LABEL}</Label>
                   <Select name="branchId" value={currentOrder?.branchId || ''} onValueChange={(value) => handleSelectChange('branchId', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {mockBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipeId">{UI_TEXT.RECIPE}</Label>
                  <Select name="recipeId" value={currentOrder?.recipeId || ''} onValueChange={(value) => handleSelectChange('recipeId', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar Receta..." /></SelectTrigger>
                    <SelectContent>
                      {mockRecipes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="productIdProduced">{UI_TEXT.PRODUCT_TO_PRODUCE}</Label>
                  <Input id="productIdProduced" name="productNameProduced" value={currentOrder?.productNameProduced || ''} readOnly disabled />
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <Label htmlFor="quantityToProduce">{UI_TEXT.QUANTITY_TO_PRODUCE}</Label>
                  <Input id="quantityToProduce" name="quantityToProduce" type="number" value={currentOrder?.quantityToProduce || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="unitProduced">{UI_TEXT.UNIT} (Producida)</Label>
                  <Input id="unitProduced" name="unitProduced" value={currentOrder?.unitProduced || ''} readOnly disabled />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plannedStartDate">{UI_TEXT.PLANNED_START_DATE}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentOrder?.plannedStartDate ? format(new Date(currentOrder.plannedStartDate), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={currentOrder?.plannedStartDate ? new Date(currentOrder.plannedStartDate) : undefined} onSelect={(date) => handleDateChange('plannedStartDate', date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="status">{UI_TEXT.STATUS}</Label>
                  <Select name="status" value={currentOrder?.status || ''} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                       {Object.values(DOCUMENT_STATUS_OPTIONS)
                        .filter(s => ['planned', 'in_progress', 'completed', 'cancelled'].includes(s.value))
                        .map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Consumed Items Section */}
              <div className="col-span-full space-y-2 mt-4">
                <Label className="text-lg font-semibold">{UI_TEXT.CONSUMED_ITEMS}</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                <Table className="text-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">{UI_TEXT.ITEM_NAME}</TableHead>
                            <TableHead className="text-right w-[20%]">{UI_TEXT.QUANTITY_REQUIRED}</TableHead>
                            <TableHead className="text-right w-[20%]">{UI_TEXT.QUANTITY_CONSUMED}</TableHead>
                            <TableHead className="w-[20%]">{UI_TEXT.UNIT}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {currentOrder?.consumedItems?.map((item, index) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell className="text-right">
                            <Input 
                                type="number" 
                                value={item.quantityRequired} 
                                onChange={(e) => handleConsumedItemChange(index, 'quantityRequired', parseFloat(e.target.value))}
                                className="h-8 text-xs text-right" 
                            />
                        </TableCell>
                         <TableCell className="text-right">
                            <Input 
                                type="number" 
                                value={item.quantityConsumed} 
                                onChange={(e) => handleConsumedItemChange(index, 'quantityConsumed', parseFloat(e.target.value))}
                                className="h-8 text-xs text-right" 
                            />
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                    </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
                {(!currentOrder?.consumedItems || currentOrder.consumedItems.length === 0) && <p className="text-xs text-muted-foreground text-center py-2">Seleccione una receta para ver los insumos.</p>}
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                 <div>
                    <Label htmlFor="actualYield">{UI_TEXT.ACTUAL_YIELD} (Opcional)</Label>
                    <Input id="actualYield" name="actualYield" type="number" value={currentOrder?.actualYield || ''} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">{UI_TEXT.NOTES}</Label>
                <Textarea id="notes" name="notes" value={currentOrder?.notes || ''} onChange={handleChange} rows={2} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
            <Button type="submit" onClick={handleSaveOrder}>{UI_TEXT.SAVE_CHANGES}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

