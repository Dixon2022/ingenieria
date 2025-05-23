
"use client";
import { useState, useEffect, useMemo } from 'react';
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
import type { PurchaseOrder, PurchaseOrderItem, Supplier, Branch, RawMaterial, ManagedProduct } from '@/types';
import { Edit3, Trash2, PlusCircle, ClipboardPlus, PackagePlus, PackageMinus, Calendar as CalendarIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Mock data - replace with actual data fetching
const mockSuppliers: Pick<Supplier, 'id' | 'name'>[] = [
  { id: 's1', name: 'Harinas del Centro S.A.' },
  { id: 's2', name: 'Empaques Modernos' },
];
const mockBranches: Pick<Branch, 'id' | 'name'>[] = [
  { id: 'b1', name: 'Sucursal Centro' },
  { id: 'b2', name: 'Sucursal Norte' },
];
const mockItemsForOrder: (Pick<RawMaterial, 'id' | 'name' | 'unit'> & {itemType: 'raw_material'})[] = [
  { id: 'rm1', name: 'Harina de Trigo', unit: UI_TEXT.UNITS.KG, itemType: 'raw_material' },
  { id: 'rm2', name: 'Azúcar Refinada', unit: UI_TEXT.UNITS.KG, itemType: 'raw_material' },
];


const initialPurchaseOrders: PurchaseOrder[] = [
  { 
    id: 'po1', 
    documentNumber: 'PO-2024-001', 
    supplierId: 's1', 
    supplierName: 'Harinas del Centro S.A.',
    branchId: 'b1', 
    orderDate: new Date().toISOString(), 
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item1', itemId: 'rm1', itemType: 'raw_material', itemName: 'Harina de Trigo', quantity: 10, unit: UI_TEXT.UNITS.KG, unitPrice: 2000 },
    ],
    status: 'ordered',
    totalAmount: 20000,
    aiHint: 'purchase order document'
  },
];

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<PurchaseOrder>>({});
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const calculateTotalAmount = (items: PurchaseOrderItem[] = []) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleOpenModal = (order?: PurchaseOrder) => {
    setEditingOrder(order || null);
    const initialItems = order?.items?.map(it => ({...it})) || [{ id: Date.now().toString(), itemId: '', itemType: 'raw_material', itemName: '', quantity: 1, unit: ALL_UNITS[0], unitPrice: 0 }];
    setCurrentOrder(order ? { ...order, items: initialItems } : { 
      documentNumber: `PO-${Date.now().toString().slice(-4)}`, 
      supplierId: '', 
      branchId: '', 
      orderDate: new Date().toISOString(), 
      items: initialItems, 
      status: 'draft' 
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOrder({});
    setEditingOrder(null);
  };

  const handleSaveOrder = () => {
    if (!currentOrder.documentNumber || !currentOrder.supplierId || !currentOrder.branchId || !currentOrder.orderDate || !currentOrder.status) {
      toast({ variant: 'destructive', title: 'Error', description: 'Todos los campos principales son requeridos.' });
      return;
    }
    if (!currentOrder.items || currentOrder.items.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debe agregar al menos un artículo a la orden.' });
      return;
    }

    const orderToSave: PurchaseOrder = {
      ...(editingOrder || { id: `po${Date.now()}` }),
      ...currentOrder,
      totalAmount: calculateTotalAmount(currentOrder.items),
      supplierName: mockSuppliers.find(s => s.id === currentOrder.supplierId)?.name,
      aiHint: 'purchase order document'
    } as PurchaseOrder;


    if (editingOrder) {
      setPurchaseOrders(purchaseOrders.map(o => o.id === editingOrder.id ? orderToSave : o));
      toast({ title: UI_TEXT.EDIT_PURCHASE_ORDER, description: `La orden "${orderToSave.documentNumber}" ha sido actualizada.` });
    } else {
      setPurchaseOrders([...purchaseOrders, orderToSave]);
      toast({ title: UI_TEXT.ADD_PURCHASE_ORDER, description: `La orden "${orderToSave.documentNumber}" ha sido agregada.` });
    }
    handleCloseModal();
  };

  const handleDeleteOrder = (orderId: string) => {
    const orderNumber = purchaseOrders.find(o => o.id === orderId)?.documentNumber;
    setPurchaseOrders(purchaseOrders.filter(o => o.id !== orderId));
    toast({ title: 'Orden Eliminada', description: `La orden "${orderNumber}" ha sido eliminada.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentOrder(prev => prev ? { ...prev, [name]: value } : {});
  };

  const handleSelectChange = (name: keyof PurchaseOrder, value: string) => {
    setCurrentOrder(prev => prev ? { ...prev, [name]: value } : {});
  };
  
  const handleDateChange = (name: keyof PurchaseOrder, date?: Date) => {
    setCurrentOrder(prev => prev ? { ...prev, [name]: date?.toISOString() } : {});
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    setCurrentOrder(prev => {
      if (!prev || !prev.items) return prev;
      const newItems = [...prev.items];
      if (field === 'itemId') {
        const selectedItem = mockItemsForOrder.find(item => item.id === value);
        newItems[index] = {
          ...newItems[index],
          itemId: value as string,
          itemName: selectedItem?.name || '',
          unit: selectedItem?.unit || ALL_UNITS[0],
          itemType: selectedItem?.itemType || 'raw_material',
        };
      } else {
         newItems[index] = { ...newItems[index], [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value };
      }
      return { ...prev, items: newItems, totalAmount: calculateTotalAmount(newItems) };
    });
  };

  const addItem = () => {
    setCurrentOrder(prev => {
      if (!prev) return prev;
      const newItem: PurchaseOrderItem = { id: Date.now().toString(), itemId: '', itemType: 'raw_material', itemName: '', quantity: 1, unit: ALL_UNITS[0], unitPrice: 0 };
      const updatedItems = [...(prev.items || []), newItem];
      return { ...prev, items: updatedItems, totalAmount: calculateTotalAmount(updatedItems) };
    });
  };

  const removeItem = (itemIndex: number) => {
    setCurrentOrder(prev => {
      if (!prev || !prev.items) return prev;
      const updatedItems = prev.items.filter((_, index) => index !== itemIndex);
      return { ...prev, items: updatedItems, totalAmount: calculateTotalAmount(updatedItems) };
    });
  };

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order =>
      order.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.supplierName && order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.status && DOCUMENT_STATUS_OPTIONS[order.status.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [purchaseOrders, searchTerm]);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <ClipboardPlus className="mr-2 h-6 w-6" />
          {UI_TEXT.PURCHASE_ORDERS_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_PURCHASE_ORDERS_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por No., proveedor, estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpenModal()} variant="default" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_PURCHASE_ORDER}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI_TEXT.DOCUMENT_NUMBER}</TableHead>
                <TableHead>{UI_TEXT.SUPPLIER}</TableHead>
                <TableHead>{UI_TEXT.ORDER_DATE}</TableHead>
                <TableHead className="text-right">{UI_TEXT.TOTAL_AMOUNT}</TableHead>
                <TableHead>{UI_TEXT.STATUS}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.documentNumber}</TableCell>
                  <TableCell>{order.supplierName || order.supplierId}</TableCell>
                  <TableCell>{format(new Date(order.orderDate), "PPP", { locale: es })}</TableCell>
                  <TableCell className="text-right">₡{order.totalAmount?.toFixed(0) || '0'}</TableCell>
                  <TableCell>{DOCUMENT_STATUS_OPTIONS[order.status.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label || order.status}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
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
        {filteredOrders.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{searchTerm ? `No se encontraron órdenes para "${searchTerm}".` : UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingOrder ? UI_TEXT.EDIT_PURCHASE_ORDER : UI_TEXT.ADD_PURCHASE_ORDER}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] p-1">
            <div className="grid gap-4 py-4 pr-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentNumber">{UI_TEXT.DOCUMENT_NUMBER}</Label>
                  <Input id="documentNumber" name="documentNumber" value={currentOrder?.documentNumber || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="supplierId">{UI_TEXT.SUPPLIER}</Label>
                  <Select name="supplierId" value={currentOrder?.supplierId || ''} onValueChange={(value) => handleSelectChange('supplierId', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {mockSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branchId">{UI_TEXT.BRANCH_LABEL}</Label>
                   <Select name="branchId" value={currentOrder?.branchId || ''} onValueChange={(value) => handleSelectChange('branchId', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {mockBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="status">{UI_TEXT.STATUS}</Label>
                  <Select name="status" value={currentOrder?.status || ''} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {Object.values(DOCUMENT_STATUS_OPTIONS)
                        .filter(s => ['draft', 'ordered', 'received', 'cancelled'].includes(s.value))
                        .map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderDate">{UI_TEXT.ORDER_DATE}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentOrder?.orderDate ? format(new Date(currentOrder.orderDate), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={currentOrder?.orderDate ? new Date(currentOrder.orderDate) : undefined} onSelect={(date) => handleDateChange('orderDate', date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="expectedDeliveryDate">{UI_TEXT.EXPECTED_DELIVERY_DATE}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentOrder?.expectedDeliveryDate ? format(new Date(currentOrder.expectedDeliveryDate), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={currentOrder?.expectedDeliveryDate ? new Date(currentOrder.expectedDeliveryDate) : undefined} onSelect={(date) => handleDateChange('expectedDeliveryDate', date)} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Items Section */}
              <div className="col-span-full space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">{UI_TEXT.ITEMS}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}><PackagePlus className="mr-2 h-4 w-4" /> {UI_TEXT.ADD_ITEM}</Button>
                </div>
                {currentOrder?.items?.map((item, index) => (
                  <Card key={item.id} className="p-3 bg-secondary/30">
                    <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-12 sm:gap-x-2 sm:items-end">
                      <div className="sm:col-span-4"> 
                        <Label htmlFor={`item-id-${index}`} className="text-xs">{UI_TEXT.ITEM_NAME}</Label>
                        <Select value={item.itemId} onValueChange={(value) => handleItemChange(index, 'itemId', value)}>
                          <SelectTrigger id={`item-id-${index}`}><SelectValue placeholder="Seleccionar..."/></SelectTrigger>
                          <SelectContent>
                            {mockItemsForOrder.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor={`item-qty-${index}`} className="text-xs">{UI_TEXT.QUANTITY}</Label>
                        <Input id={`item-qty-${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor={`item-unit_price-${index}`} className="text-xs">{UI_TEXT.UNIT_PRICE}</Label>
                        <Input id={`item-unit_price-${index}`} type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))} />
                      </div>
                       <div className="sm:col-span-3">
                        <Label className="text-xs">Total</Label>
                        <Input type="text" value={`₡${(item.quantity * item.unitPrice).toFixed(0)}`} readOnly disabled className="bg-muted/50"/>
                      </div>
                      <div className="sm:col-span-1 flex justify-end sm:self-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive/80">
                          <PackageMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {(!currentOrder?.items || currentOrder.items.length === 0) && <p className="text-xs text-muted-foreground text-center py-2">No hay artículos.</p>}
              </div>
              <div className="mt-4 text-right">
                <Label className="text-lg font-semibold">{UI_TEXT.TOTAL_AMOUNT}: </Label>
                <span className="text-xl font-bold text-primary">₡{calculateTotalAmount(currentOrder?.items).toFixed(0)}</span>
              </div>
              <div>
                <Label htmlFor="notes">{UI_TEXT.NOTES}</Label>
                <Textarea id="notes" name="notes" value={currentOrder?.notes || ''} onChange={handleChange} rows={3} />
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

    
