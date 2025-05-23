
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
import { UI_TEXT, ALL_UNITS, DOCUMENT_STATUS_OPTIONS, ADJUSTMENT_TYPE_OPTIONS } from '@/lib/constants';
import type { InventoryAdjustment, InventoryAdjustmentItem, Branch, ManagedProduct, RawMaterial } from '@/types';
import { Edit3, Trash2, PlusCircle, FileEdit, PackagePlus, PackageMinus, Calendar as CalendarIcon, Search } from 'lucide-react';
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
const mockInventoryItems: (Pick<RawMaterial | ManagedProduct, 'id' | 'name' | 'unit'> & {itemType: 'raw_material' | 'product'})[] = [
  { id: 'rm1', name: 'Harina de Trigo', unit: UI_TEXT.UNITS.KG, itemType: 'raw_material' },
  { id: 'p1', name: 'Concha de Vainilla', unit: UI_TEXT.UNITS.UNIDADES, itemType: 'product' },
];

const initialAdjustments: InventoryAdjustment[] = [
  { 
    id: 'adj1', 
    documentNumber: 'ADJ-2024-001', 
    branchId: 'b1', 
    adjustmentDate: new Date().toISOString(),
    adjustmentType: 'decrease',
    reasonGeneral: 'Mermas del día',
    items: [
      { id: 'item1', itemId: 'p1', itemType: 'product', itemName: 'Concha de Vainilla', quantity: 5, unit: UI_TEXT.UNITS.UNIDADES, reasonPerItem: 'Quemadas' },
    ],
    status: 'completed',
    aiHint: 'inventory adjustment form'
  },
];

export default function InventoryAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>(initialAdjustments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAdjustment, setCurrentAdjustment] = useState<Partial<InventoryAdjustment>>({});
  const [editingAdjustment, setEditingAdjustment] = useState<InventoryAdjustment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleOpenModal = (adj?: InventoryAdjustment) => {
    setEditingAdjustment(adj || null);
    const initialItems = adj?.items?.map(it => ({...it})) || [{ id: Date.now().toString(), itemId: '', itemType: 'raw_material', itemName: '', quantity: 1, unit: ALL_UNITS[0] }];
    setCurrentAdjustment(adj ? { ...adj, items: initialItems } : { 
      documentNumber: `ADJ-${Date.now().toString().slice(-4)}`, 
      branchId: '', 
      adjustmentDate: new Date().toISOString(),
      adjustmentType: 'decrease',
      reasonGeneral: '',
      items: initialItems, 
      status: 'draft' 
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAdjustment({});
    setEditingAdjustment(null);
  };

  const handleSaveAdjustment = () => {
    if (!currentAdjustment.documentNumber || !currentAdjustment.branchId || !currentAdjustment.adjustmentDate || !currentAdjustment.adjustmentType || !currentAdjustment.status || !currentAdjustment.reasonGeneral) {
      toast({ variant: 'destructive', title: 'Error', description: 'Todos los campos principales son requeridos.' });
      return;
    }
    if (!currentAdjustment.items || currentAdjustment.items.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debe agregar al menos un artículo.' });
      return;
    }

    const adjToSave: InventoryAdjustment = {
      ...(editingAdjustment || { id: `adj${Date.now()}` }),
      ...currentAdjustment,
      aiHint: 'inventory adjustment form'
    } as InventoryAdjustment;

    if (editingAdjustment) {
      setAdjustments(adjustments.map(a => a.id === editingAdjustment.id ? adjToSave : a));
      toast({ title: UI_TEXT.EDIT_INVENTORY_ADJUSTMENT, description: `El ajuste "${adjToSave.documentNumber}" ha sido actualizado.` });
    } else {
      setAdjustments([...adjustments, adjToSave]);
      toast({ title: UI_TEXT.ADD_INVENTORY_ADJUSTMENT, description: `El ajuste "${adjToSave.documentNumber}" ha sido agregado.` });
    }
    handleCloseModal();
  };

  const handleDeleteAdjustment = (adjId: string) => {
    const adjNumber = adjustments.find(a => a.id === adjId)?.documentNumber;
    setAdjustments(adjustments.filter(a => a.id !== adjId));
    toast({ title: 'Ajuste Eliminado', description: `El ajuste "${adjNumber}" ha sido eliminado.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentAdjustment(prev => prev ? { ...prev, [name]: value } : {});
  };

  const handleSelectChange = (name: keyof InventoryAdjustment, value: string) => {
    setCurrentAdjustment(prev => prev ? { ...prev, [name]: value } : {});
  };
  
  const handleDateChange = (name: keyof InventoryAdjustment, date?: Date) => {
    setCurrentAdjustment(prev => prev ? { ...prev, [name]: date?.toISOString() } : {});
  };

  const handleItemChange = (index: number, field: keyof InventoryAdjustmentItem, value: string | number) => {
    setCurrentAdjustment(prev => {
      if (!prev || !prev.items) return prev;
      const newItems = [...prev.items];
      if (field === 'itemId') {
        const selectedItem = mockInventoryItems.find(item => item.id === value);
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
    setCurrentAdjustment(prev => {
      if (!prev) return prev;
      const newItem: InventoryAdjustmentItem = { id: Date.now().toString(), itemId: '', itemType: 'raw_material', itemName: '', quantity: 1, unit: ALL_UNITS[0] };
      return { ...prev, items: [...(prev.items || []), newItem] };
    });
  };

  const removeItem = (itemIndex: number) => {
    setCurrentAdjustment(prev => {
      if (!prev || !prev.items) return prev;
      return { ...prev, items: prev.items.filter((_, index) => index !== itemIndex) };
    });
  };

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(adj =>
      adj.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mockBranches.find(b => b.id === adj.branchId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (adj.reasonGeneral && adj.reasonGeneral.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (adj.status && DOCUMENT_STATUS_OPTIONS[adj.status.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [adjustments, searchTerm]);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <FileEdit className="mr-2 h-6 w-6" />
          {UI_TEXT.INVENTORY_ADJUSTMENTS_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_INVENTORY_ADJUSTMENTS_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por No., sucursal, motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpenModal()} variant="default" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_INVENTORY_ADJUSTMENT}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI_TEXT.DOCUMENT_NUMBER}</TableHead>
                <TableHead>{UI_TEXT.ADJUSTMENT_DATE}</TableHead>
                <TableHead>{UI_TEXT.ADJUSTMENT_TYPE}</TableHead>
                 <TableHead>{UI_TEXT.BRANCH_LABEL}</TableHead>
                <TableHead>{UI_TEXT.STATUS}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.map(adj => (
                <TableRow key={adj.id}>
                  <TableCell className="font-medium">{adj.documentNumber}</TableCell>
                  <TableCell>{format(new Date(adj.adjustmentDate), "PPP", { locale: es })}</TableCell>
                  <TableCell>{ADJUSTMENT_TYPE_OPTIONS[adj.adjustmentType.toUpperCase() as keyof typeof ADJUSTMENT_TYPE_OPTIONS]?.label || adj.adjustmentType}</TableCell>
                  <TableCell>{mockBranches.find(b => b.id === adj.branchId)?.name || adj.branchId}</TableCell>
                  <TableCell>{DOCUMENT_STATUS_OPTIONS[adj.status.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label || adj.status}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(adj)} className="text-primary hover:text-primary/80">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAdjustment(adj.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredAdjustments.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{searchTerm ? `No se encontraron ajustes para "${searchTerm}".` : UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingAdjustment ? UI_TEXT.EDIT_INVENTORY_ADJUSTMENT : UI_TEXT.ADD_INVENTORY_ADJUSTMENT}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] p-1">
            <div className="grid gap-4 py-4 pr-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentNumber">{UI_TEXT.DOCUMENT_NUMBER}</Label>
                  <Input id="documentNumber" name="documentNumber" value={currentAdjustment?.documentNumber || ''} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="adjustmentDate">{UI_TEXT.ADJUSTMENT_DATE}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentAdjustment?.adjustmentDate ? format(new Date(currentAdjustment.adjustmentDate), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={currentAdjustment?.adjustmentDate ? new Date(currentAdjustment.adjustmentDate) : undefined} onSelect={(date) => handleDateChange('adjustmentDate', date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branchId">{UI_TEXT.BRANCH_LABEL}</Label>
                   <Select name="branchId" value={currentAdjustment?.branchId || ''} onValueChange={(value) => handleSelectChange('branchId', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {mockBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adjustmentType">{UI_TEXT.ADJUSTMENT_TYPE}</Label>
                  <Select name="adjustmentType" value={currentAdjustment?.adjustmentType || ''} onValueChange={(value) => handleSelectChange('adjustmentType', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {Object.values(ADJUSTMENT_TYPE_OPTIONS).map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">{UI_TEXT.STATUS}</Label>
                  <Select name="status" value={currentAdjustment?.status || ''} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {Object.values(DOCUMENT_STATUS_OPTIONS)
                        .filter(s => ['draft', 'completed'].includes(s.value))
                        .map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="reasonGeneral">{UI_TEXT.REASON_GENERAL}</Label>
                <Textarea id="reasonGeneral" name="reasonGeneral" value={currentAdjustment?.reasonGeneral || ''} onChange={handleChange} rows={2} />
              </div>
              
              {/* Items Section */}
              <div className="col-span-full space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">{UI_TEXT.ITEMS}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}><PackagePlus className="mr-2 h-4 w-4" /> {UI_TEXT.ADD_ITEM}</Button>
                </div>
                {currentAdjustment?.items?.map((item, index) => (
                  <Card key={item.id} className="p-3 bg-secondary/30">
                    <div className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4"> 
                        <Label htmlFor={`item-id-${index}`} className="text-xs">{UI_TEXT.ITEM_NAME}</Label>
                        <Select value={item.itemId} onValueChange={(value) => handleItemChange(index, 'itemId', value)}>
                          <SelectTrigger id={`item-id-${index}`}><SelectValue placeholder="Seleccionar..."/></SelectTrigger>
                          <SelectContent>
                            {mockInventoryItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`item-qty-${index}`} className="text-xs">{UI_TEXT.QUANTITY_ADJUSTED}</Label>
                        <Input id={`item-qty-${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} />
                      </div>
                      <div className="col-span-5">
                        <Label htmlFor={`item-reason-${index}`} className="text-xs">{UI_TEXT.REASON_PER_ITEM} (Opcional)</Label>
                        <Input id={`item-reason-${index}`} value={item.reasonPerItem || ''} onChange={(e) => handleItemChange(index, 'reasonPerItem', e.target.value)} />
                      </div>
                      <div className="col-span-1 self-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive/80">
                          <PackageMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {(!currentAdjustment?.items || currentAdjustment.items.length === 0) && <p className="text-xs text-muted-foreground text-center py-2">No hay artículos.</p>}
              </div>
              <div>
                <Label htmlFor="notes">{UI_TEXT.NOTES}</Label>
                <Textarea id="notes" name="notes" value={currentAdjustment?.notes || ''} onChange={handleChange} rows={3} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
            <Button type="submit" onClick={handleSaveAdjustment}>{UI_TEXT.SAVE_CHANGES}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

    