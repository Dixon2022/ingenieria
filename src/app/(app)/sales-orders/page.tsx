
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
import { Eye, Receipt, Calendar as CalendarIcon, Search } from 'lucide-react'; // Changed icons
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getSalesOrdersFromPOS } from '@/app/(app)/pos/page'; // Import function to get POS sales

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
  // editingOrder is no longer needed as page is view-only for existing items.
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Fetch sales orders created from POS when component mounts or focuses
    const newPOSSales = getSalesOrdersFromPOS();
    if (newPOSSales.length > 0) {
      setSalesOrders(prevOrders => [...prevOrders, ...newPOSSales]);
    }
  }, []); // Could add focus listener for more real-time update if needed

  const calculateTotalAmount = (items: SalesOrderItem[] = []) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleOpenViewModal = (order: SalesOrder) => {
    setCurrentOrder({ ...order });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOrder({});
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
          {/* "Add Sales Order" button removed as per request */}
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
                    <Button variant="ghost" size="icon" onClick={() => handleOpenViewModal(order)} className="text-primary hover:text-primary/80">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {/* Edit and Delete buttons removed */}
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

      {/* View Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{UI_TEXT.VIEW_SALES_ORDER}: {currentOrder?.documentNumber}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] p-1">
            <div className="grid gap-4 py-4 pr-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-documentNumber">{UI_TEXT.DOCUMENT_NUMBER}</Label>
                  <Input id="view-documentNumber" value={currentOrder?.documentNumber || ''} readOnly disabled />
                </div>
                <div>
                  <Label htmlFor="view-customerName">{UI_TEXT.CUSTOMER_NAME}</Label>
                  <Input id="view-customerName" value={currentOrder?.customerName || ''} readOnly disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-branchId">{UI_TEXT.BRANCH_LABEL}</Label>
                   <Input id="view-branchId" value={mockBranches.find(b => b.id === currentOrder?.branchId)?.name || currentOrder?.branchId || ''} readOnly disabled />
                </div>
                 <div>
                  <Label htmlFor="view-status">{UI_TEXT.STATUS}</Label>
                  <Input id="view-status" value={DOCUMENT_STATUS_OPTIONS[currentOrder?.status?.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label || currentOrder?.status || ''} readOnly disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="view-orderDate">{UI_TEXT.ORDER_DATE}</Label>
                   <Input id="view-orderDate" value={currentOrder?.orderDate ? format(new Date(currentOrder.orderDate), "PPP", { locale: es }) : ''} readOnly disabled />
                </div>
                 <div>
                  <Label htmlFor="view-paymentMethod">{UI_TEXT.PAYMENT_METHOD}</Label>
                  <Input id="view-paymentMethod" value={currentOrder?.paymentMethod || ''} readOnly disabled/>
                </div>
              </div>
               <div className="flex items-center space-x-2 mt-2">
                <Checkbox id="view-requiresOpenCashRegister" checked={currentOrder?.requiresOpenCashRegister || false} disabled />
                <Label htmlFor="view-requiresOpenCashRegister" className="text-sm text-muted-foreground">{UI_TEXT.CASH_REGISTER_OPEN_REQUIRED}</Label>
              </div>
              
              {/* Items Section */}
              <div className="col-span-full space-y-2 mt-4">
                <Label className="text-lg font-semibold">{UI_TEXT.ITEMS}</Label>
                {currentOrder?.items?.map((item, index) => (
                  <Card key={item.id} className="p-3 bg-secondary/30">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5"> 
                        <Label className="text-xs">{UI_TEXT.ITEM_NAME}</Label>
                        <Input value={item.productName} readOnly disabled />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">{UI_TEXT.QUANTITY}</Label>
                        <Input type="number" value={item.quantity} readOnly disabled />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">{UI_TEXT.UNIT_PRICE}</Label>
                        <Input type="number" value={item.unitPrice} readOnly disabled />
                      </div>
                       <div className="col-span-3">
                        <Label className="text-xs">Total</Label>
                        <Input type="text" value={`₡${(item.quantity * item.unitPrice).toFixed(0)}`} readOnly disabled className="bg-muted/50"/>
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
                <Label htmlFor="view-notes">{UI_TEXT.NOTES}</Label>
                <Textarea id="view-notes" value={currentOrder?.notes || ''} readOnly disabled rows={3} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
