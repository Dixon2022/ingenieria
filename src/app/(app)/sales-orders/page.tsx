
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
import { Checkbox } from '@/components/ui/checkbox';
import { UI_TEXT, DOCUMENT_STATUS_OPTIONS } from '@/lib/constants';
import type { SalesOrder, SalesOrderItem, Branch, ManagedProduct } from '@/types';
import { Edit3, Trash2, PlusCircle, Receipt, PackagePlus, PackageMinus, Calendar as CalendarIcon, Search } from 'lucide-react';
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
const mockProductsForSale: Pick<ManagedProduct, 'id' | 'name' | 'price' | 'unit'>[] = [
  { id: 'p1', name: 'Concha de Vainilla', price: 1500, unit: UI_TEXT.UNITS.UNIDADES },
  { id: 'p2', name: 'Bolsa de Café Grano Entero 250g', price: 12000, unit: UI_TEXT.UNITS.UNIDADES },
];

const initialSalesOrders: SalesOrder[] = [
  { 
    id: 'so1', 
    documentNumber: 'SO-2024-001', 
    branchId: 'b1', 
    orderDate: new Date().toISOString(),
    items: [
      { id: 'item1', productId: 'p1', productName: 'Concha de Vainilla', quantity: 10, unitPrice: 1500 },
    ],
    status: 'confirmed',
    totalAmount: 15000,
    customerName: 'Cliente Ejemplo',
    aiHint: 'sales receipt document'
  },
];

export default function SalesOrdersPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(initialSalesOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<SalesOrder>>({});
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const calculateTotalAmount = (items: SalesOrderItem[] = []) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleOpenModal = (order?: SalesOrder) => {
    setEditingOrder(order || null);
    const initialItems = order?.items?.map(it => ({...it})) || [{ id: Date.now().toString(), productId: '', productName: '', quantity: 1, unitPrice: 0 }];
    setCurrentOrder(order ? { ...order, items: initialItems } : { 
      documentNumber: `SO-${Date.now().toString().slice(-4)}`, 
      branchId: '', 
      orderDate: new Date().toISOString(), 
      items: initialItems, 
      status: 'draft',
      requiresOpenCashRegister: true, 
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOrder({});
    setEditingOrder(null);
  };

  const handleSaveOrder = () => {
    if (!currentOrder.documentNumber || !currentOrder.branchId || !currentOrder.orderDate || !currentOrder.status) {
      toast({ variant: 'destructive', title: 'Error', description: 'No. Documento, Sucursal, Fecha y Estado son requeridos.' });
      return;
    }
    if (!currentOrder.items || currentOrder.items.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debe agregar al menos un artículo.' });
      return;
    }

    const orderToSave: SalesOrder = {
      ...(editingOrder || { id: `so${Date.now()}` }),
      ...currentOrder,
      totalAmount: calculateTotalAmount(currentOrder.items),
      aiHint: 'sales receipt document'
    } as SalesOrder;

    if (editingOrder) {
      setSalesOrders(salesOrders.map(o => o.id === editingOrder.id ? orderToSave : o));
      toast({ title: UI_TEXT.EDIT_SALES_ORDER, description: `El documento "${orderToSave.documentNumber}" ha sido actualizado.` });
    } else {
      setSalesOrders([...salesOrders, orderToSave]);
      toast({ title: UI_TEXT.ADD_SALES_ORDER, description: `El documento "${orderToSave.documentNumber}" ha sido agregado.` });
    }
    handleCloseModal();
  };

  const handleDeleteOrder = (orderId: string) => {
    const orderNumber = salesOrders.find(o => o.id === orderId)?.documentNumber;
    setSalesOrders(salesOrders.filter(o => o.id !== orderId));
    toast({ title: 'Documento Eliminado', description: `El documento "${orderNumber}" ha sido eliminado.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentOrder(prev => prev ? { ...prev, [name]: value } : {});
  };

  const handleSelectChange = (name: keyof SalesOrder, value: string) => {
    setCurrentOrder(prev => prev ? { ...prev, [name]: value } : {});
  };
  
  const handleDateChange = (name: keyof SalesOrder, date?: Date) => {
    setCurrentOrder(prev => prev ? { ...prev, [name]: date?.toISOString() } : {});
  };

  const handleCheckboxChange = (name: keyof SalesOrder, checked: boolean) => {
    setCurrentOrder(prev => prev ? { ...prev, [name]: checked } : null);
  };

  const handleItemChange = (index: number, field: keyof SalesOrderItem, value: string | number) => {
    setCurrentOrder(prev => {
      if (!prev || !prev.items) return prev;
      const newItems = [...prev.items];
      if (field === 'productId') {
        const selectedProduct = mockProductsForSale.find(p => p.id === value);
        newItems[index] = {
          ...newItems[index],
          productId: value as string,
          productName: selectedProduct?.name || '',
          unitPrice: selectedProduct?.price || 0,
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
      const newItem: SalesOrderItem = { id: Date.now().toString(), productId: '', productName: '', quantity: 1, unitPrice: 0 };
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
    return salesOrders.filter(order =>
      order.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.status && DOCUMENT_STATUS_OPTIONS[order.status.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [salesOrders, searchTerm]);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Receipt className="mr-2 h-6 w-6" />
          {UI_TEXT.SALES_ORDERS_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_SALES_ORDERS_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por No., cliente, estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpenModal()} variant="default" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_SALES_ORDER}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI_TEXT.DOCUMENT_NUMBER}</TableHead>
                <TableHead>{UI_TEXT.CUSTOMER_NAME}</TableHead>
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
                  <TableCell>{order.customerName || '-'}</TableCell>
                  <TableCell>{format(new Date(order.orderDate), "PPP", { locale: es })}</TableCell>
                  <TableCell className="text-right">₡{order.totalAmount?.toFixed(0) || '0'}</TableCell>
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
        {filteredOrders.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{searchTerm ? `No se encontraron documentos para "${searchTerm}".` : UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingOrder ? UI_TEXT.EDIT_SALES_ORDER : UI_TEXT.ADD_SALES_ORDER}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] p-1">
            <div className="grid gap-4 py-4 pr-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentNumber">{UI_TEXT.DOCUMENT_NUMBER}</Label>
                  <Input id="documentNumber" name="documentNumber" value={currentOrder?.documentNumber || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="customerName">{UI_TEXT.CUSTOMER_NAME}</Label>
                  <Input id="customerName" name="customerName" value={currentOrder?.customerName || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                        .filter(s => ['draft', 'confirmed', 'completed', 'cancelled'].includes(s.value))
                        .map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="paymentMethod">{UI_TEXT.PAYMENT_METHOD}</Label>
                  <Input id="paymentMethod" name="paymentMethod" value={currentOrder?.paymentMethod || ''} onChange={handleChange} placeholder="Ej: Efectivo, Tarjeta"/>
                </div>
              </div>
               <div className="flex items-center space-x-2 mt-2">
                <Checkbox id="requiresOpenCashRegister" checked={currentOrder?.requiresOpenCashRegister || false} onCheckedChange={(checked) => handleCheckboxChange('requiresOpenCashRegister', !!checked)} disabled />
                <Label htmlFor="requiresOpenCashRegister" className="text-sm text-muted-foreground">{UI_TEXT.CASH_REGISTER_OPEN_REQUIRED}</Label>
              </div>
              
              {/* Items Section */}
              <div className="col-span-full space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">{UI_TEXT.ITEMS}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}><PackagePlus className="mr-2 h-4 w-4" /> {UI_TEXT.ADD_ITEM}</Button>
                </div>
                {currentOrder?.items?.map((item, index) => (
                  <Card key={item.id} className="p-3 bg-secondary/30">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label htmlFor={`item-prod-id-${index}`} className="text-xs">{UI_TEXT.ITEM_NAME}</Label>
                        <Select value={item.productId} onValueChange={(value) => handleItemChange(index, 'productId', value)}>
                          <SelectTrigger id={`item-prod-id-${index}`}><SelectValue placeholder="Seleccionar..."/></SelectTrigger>
                          <SelectContent>
                            {mockProductsForSale.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`item-qty-${index}`} className="text-xs">{UI_TEXT.QUANTITY}</Label>
                        <Input id={`item-qty-${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`item-unit_price-${index}`} className="text-xs">{UI_TEXT.UNIT_PRICE}</Label>
                        <Input id={`item-unit_price-${index}`} type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))} disabled={!!item.productId} />
                      </div>
                       <div className="col-span-3">
                        <Label className="text-xs">Total</Label>
                        <Input type="text" value={`₡${(item.quantity * item.unitPrice).toFixed(0)}`} readOnly disabled className="bg-muted/50"/>
                      </div>
                      <div className="col-span-1">
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

    