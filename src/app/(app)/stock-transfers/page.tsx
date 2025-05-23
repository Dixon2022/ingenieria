
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
import type { StockTransfer, StockTransferItem, Branch, ManagedProduct, RawMaterial } from '@/types';
import { Edit3, Trash2, PlusCircle, ArrowRightLeft, PackagePlus, PackageMinus, Calendar as CalendarIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Mock data
const mockBranches: Pick<Branch, 'id' | 'name'>[] = [
  { id: 'b1', name: 'Sucursal Centro' },
  { id: 'b2', name: 'Sucursal Norte' },
  { id: 'b3', name: 'Sucursal Playa' },
];
const mockTransferableItems: (Pick<RawMaterial | ManagedProduct, 'id' | 'name' | 'unit'> & {itemType: 'raw_material' | 'product'})[] = [
  { id: 'rm1', name: 'Harina de Trigo', unit: UI_TEXT.UNITS.KG, itemType: 'raw_material' },
  { id: 'p1', name: 'Concha de Vainilla', unit: UI_TEXT.UNITS.UNIDADES, itemType: 'product' },
  { id: 'p4', name: 'Conchas Horneadas', unit: UI_TEXT.UNITS.UNIDADES, itemType: 'product' },
];

const initialTransfers: StockTransfer[] = [
  { 
    id: 'st1', 
    documentNumber: 'TR-2024-001', 
    sourceBranchId: 'b1', 
    destinationBranchId: 'b2',
    transferDate: new Date().toISOString(),
    expectedArrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item1', itemId: 'p4', itemType: 'product', itemName: 'Conchas Horneadas', quantity: 50, unit: UI_TEXT.UNITS.UNIDADES },
    ],
    status: 'in_transit',
    aiHint: 'stock transfer document'
  },
];

export default function StockTransfersPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>(initialTransfers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransfer, setCurrentTransfer] = useState<Partial<StockTransfer>>({});
  const [editingTransfer, setEditingTransfer] = useState<StockTransfer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleOpenModal = (transfer?: StockTransfer) => {
    setEditingTransfer(transfer || null);
    const initialItems = transfer?.items?.map(it => ({...it})) || [{ id: Date.now().toString(), itemId: '', itemType: 'raw_material', itemName: '', quantity: 1, unit: ALL_UNITS[0] }];
    setCurrentTransfer(transfer ? { ...transfer, items: initialItems } : { 
      documentNumber: `TR-${Date.now().toString().slice(-4)}`, 
      sourceBranchId: '', 
      destinationBranchId: '',
      transferDate: new Date().toISOString(),
      items: initialItems, 
      status: 'draft' 
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTransfer({});
    setEditingTransfer(null);
  };

  const handleSaveTransfer = () => {
    if (!currentTransfer.documentNumber || !currentTransfer.sourceBranchId || !currentTransfer.destinationBranchId || !currentTransfer.transferDate || !currentTransfer.status) {
      toast({ variant: 'destructive', title: 'Error', description: 'Todos los campos principales son requeridos.' });
      return;
    }
    if (currentTransfer.sourceBranchId === currentTransfer.destinationBranchId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Sucursal origen y destino no pueden ser la misma.' });
      return;
    }
    if (!currentTransfer.items || currentTransfer.items.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debe agregar al menos un artículo.' });
      return;
    }

    const transferToSave: StockTransfer = {
      ...(editingTransfer || { id: `st${Date.now()}` }),
      ...currentTransfer,
      aiHint: 'stock transfer document'
    } as StockTransfer;

    if (editingTransfer) {
      setTransfers(transfers.map(t => t.id === editingTransfer.id ? transferToSave : t));
      toast({ title: UI_TEXT.EDIT_STOCK_TRANSFER, description: `El traslado "${transferToSave.documentNumber}" ha sido actualizado.` });
    } else {
      setTransfers([...transfers, transferToSave]);
      toast({ title: UI_TEXT.ADD_STOCK_TRANSFER, description: `El traslado "${transferToSave.documentNumber}" ha sido agregado.` });
    }
    handleCloseModal();
  };

  const handleDeleteTransfer = (transferId: string) => {
    const transferNumber = transfers.find(t => t.id === transferId)?.documentNumber;
    setTransfers(transfers.filter(t => t.id !== transferId));
    toast({ title: 'Traslado Eliminado', description: `El traslado "${transferNumber}" ha sido eliminado.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentTransfer(prev => prev ? { ...prev, [name]: value } : {});
  };

  const handleSelectChange = (name: keyof StockTransfer, value: string) => {
    setCurrentTransfer(prev => prev ? { ...prev, [name]: value } : {});
  };
  
  const handleDateChange = (name: keyof StockTransfer, date?: Date) => {
    setCurrentTransfer(prev => prev ? { ...prev, [name]: date?.toISOString() } : {});
  };

  const handleItemChange = (index: number, field: keyof StockTransferItem, value: string | number) => {
    setCurrentTransfer(prev => {
      if (!prev || !prev.items) return prev;
      const newItems = [...prev.items];
      if (field === 'itemId') {
        const selectedItem = mockTransferableItems.find(item => item.id === value);
        newItems[index] = {
          ...newItems[index],
          itemId: value as string,
          itemName: selectedItem?.name || '',
          unit: selectedItem?.unit || ALL_UNITS[0],
          itemType: selectedItem?.itemType || 'raw_material',
        };
      } else {
         newItems[index] = { ...newItems[index], [field]: field === 'quantity' ? Number(value) : value };
      }
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setCurrentTransfer(prev => {
      if (!prev) return prev;
      const newItem: StockTransferItem = { id: Date.now().toString(), itemId: '', itemType: 'raw_material', itemName: '', quantity: 1, unit: ALL_UNITS[0] };
      return { ...prev, items: [...(prev.items || []), newItem] };
    });
  };

  const removeItem = (itemIndex: number) => {
    setCurrentTransfer(prev => {
      if (!prev || !prev.items) return prev;
      return { ...prev, items: prev.items.filter((_, index) => index !== itemIndex) };
    });
  };

  const getBranchName = (branchId?: string) => mockBranches.find(b => b.id === branchId)?.name || branchId || '-';

  const filteredTransfers = useMemo(() => {
    return transfers.filter(tr =>
      tr.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBranchName(tr.sourceBranchId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBranchName(tr.destinationBranchId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tr.status && DOCUMENT_STATUS_OPTIONS[tr.status.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [transfers, searchTerm]);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <ArrowRightLeft className="mr-2 h-6 w-6" />
          {UI_TEXT.STOCK_TRANSFERS_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_STOCK_TRANSFERS_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por No., sucursal, estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpenModal()} variant="default" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_STOCK_TRANSFER}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI_TEXT.DOCUMENT_NUMBER}</TableHead>
                <TableHead>{UI_TEXT.SOURCE_BRANCH}</TableHead>
                <TableHead>{UI_TEXT.DESTINATION_BRANCH}</TableHead>
                <TableHead>{UI_TEXT.TRANSFER_DATE}</TableHead>
                <TableHead>{UI_TEXT.STATUS}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map(tr => (
                <TableRow key={tr.id}>
                  <TableCell className="font-medium">{tr.documentNumber}</TableCell>
                  <TableCell>{getBranchName(tr.sourceBranchId)}</TableCell>
                  <TableCell>{getBranchName(tr.destinationBranchId)}</TableCell>
                  <TableCell>{format(new Date(tr.transferDate), "PPP", { locale: es })}</TableCell>
                  <TableCell>{DOCUMENT_STATUS_OPTIONS[tr.status.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label || tr.status}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(tr)} className="text-primary hover:text-primary/80">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTransfer(tr.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredTransfers.length === 0 && (
           <p className="text-center text-muted-foreground py-10">{searchTerm ? `No se encontraron traslados para "${searchTerm}".` : UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingTransfer ? UI_TEXT.EDIT_STOCK_TRANSFER : UI_TEXT.ADD_STOCK_TRANSFER}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] p-1">
            <div className="grid gap-4 py-4 pr-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentNumber">{UI_TEXT.DOCUMENT_NUMBER}</Label>
                  <Input id="documentNumber" name="documentNumber" value={currentTransfer?.documentNumber || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="transferDate">{UI_TEXT.TRANSFER_DATE}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentTransfer?.transferDate ? format(new Date(currentTransfer.transferDate), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={currentTransfer?.transferDate ? new Date(currentTransfer.transferDate) : undefined} onSelect={(date) => handleDateChange('transferDate', date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sourceBranchId">{UI_TEXT.SOURCE_BRANCH}</Label>
                   <Select name="sourceBranchId" value={currentTransfer?.sourceBranchId || ''} onValueChange={(value) => handleSelectChange('sourceBranchId', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {mockBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="destinationBranchId">{UI_TEXT.DESTINATION_BRANCH}</Label>
                   <Select name="destinationBranchId" value={currentTransfer?.destinationBranchId || ''} onValueChange={(value) => handleSelectChange('destinationBranchId', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {mockBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedArrivalDate">{UI_TEXT.EXPECTED_ARRIVAL_DATE}</Label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentTransfer?.expectedArrivalDate ? format(new Date(currentTransfer.expectedArrivalDate), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={currentTransfer?.expectedArrivalDate ? new Date(currentTransfer.expectedArrivalDate) : undefined} onSelect={(date) => handleDateChange('expectedArrivalDate', date)} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="status">{UI_TEXT.STATUS}</Label>
                  <Select name="status" value={currentTransfer?.status || ''} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                       {Object.values(DOCUMENT_STATUS_OPTIONS)
                        .filter(s => ['draft', 'pending_dispatch', 'in_transit', 'received', 'cancelled'].includes(s.value))
                        .map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Items Section */}
              <div className="col-span-full space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">{UI_TEXT.ITEMS}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}><PackagePlus className="mr-2 h-4 w-4" /> {UI_TEXT.ADD_ITEM}</Button>
                </div>
                {currentTransfer?.items?.map((item, index) => (
                  <Card key={item.id} className="p-3 bg-secondary/30">
                    <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-12 sm:gap-x-2 sm:items-end">
                      <div className="sm:col-span-6"> 
                        <Label htmlFor={`item-id-${index}`} className="text-xs">{UI_TEXT.ITEM_NAME}</Label>
                        <Select value={item.itemId} onValueChange={(value) => handleItemChange(index, 'itemId', value)}>
                          <SelectTrigger id={`item-id-${index}`}><SelectValue placeholder="Seleccionar..."/></SelectTrigger>
                          <SelectContent>
                            {mockTransferableItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor={`item-qty-${index}`} className="text-xs">{UI_TEXT.QUANTITY_TRANSFERRED}</Label>
                        <Input id={`item-qty-${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} />
                      </div>
                       <div className="sm:col-span-3">
                        <Label htmlFor={`item-unit-${index}`} className="text-xs">{UI_TEXT.UNIT}</Label>
                        <Input id={`item-unit-${index}`} value={item.unit} readOnly disabled className="bg-muted/50"/>
                      </div>
                      <div className="sm:col-span-1 flex justify-end sm:self-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive/80">
                          <PackageMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {(!currentTransfer?.items || currentTransfer.items.length === 0) && <p className="text-xs text-muted-foreground text-center py-2">No hay artículos.</p>}
              </div>
              <div>
                <Label htmlFor="notes">{UI_TEXT.NOTES}</Label>
                <Textarea id="notes" name="notes" value={currentTransfer?.notes || ''} onChange={handleChange} rows={3} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
            <Button type="submit" onClick={handleSaveTransfer}>{UI_TEXT.SAVE_CHANGES}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

    
