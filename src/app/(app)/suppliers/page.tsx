
"use client";
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UI_TEXT } from '@/lib/constants';
import type { Supplier } from '@/types';
import { Edit3, Trash2, PlusCircle, Truck, Search } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const initialSuppliers: Supplier[] = [
  { id: 's1', name: 'Harinas del Centro S.A.', email: 'ventas@harinascentro.com', phone: '555-1111', address: 'Parque Industrial #100', contactPerson: 'Laura Gil', aiHint: 'factory building' },
  { id: 's2', name: 'Empaques Modernos', email: 'info@empaquesmod.mx', phone: '555-2222', address: 'Av. Progreso 200', contactPerson: 'Carlos López', aiHint: 'warehouse exterior' },
  { id: 's3', name: 'Distribuidora El Grano Dorado', email: 'pedidos@granodorado.com', phone: '555-3333', address: 'Bodega 5, Central de Abastos', contactPerson: 'Ana Torres', aiHint: 'grain silo' },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({});
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleOpenModal = (supplier?: Supplier) => {
    setEditingSupplier(supplier || null);
    setCurrentSupplier(supplier ? { ...supplier } : { name: '', email: '', phone: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier({});
    setEditingSupplier(null);
  };

  const handleSaveSupplier = () => {
    if (!currentSupplier.name) {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre del proveedor es requerido.' });
      return;
    }
    // Optional: Add email validation
    if (currentSupplier.email && !/\S+@\S+\.\S+/.test(currentSupplier.email)) {
      toast({ variant: 'destructive', title: 'Error', description: 'Correo electrónico no válido.' });
      return;
    }


    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...editingSupplier, ...currentSupplier } as Supplier : s));
      toast({ title: UI_TEXT.EDIT_SUPPLIER, description: `El proveedor "${currentSupplier.name}" ha sido actualizado.` });
    } else {
      const newSupplier: Supplier = {
        id: `s${Date.now()}`,
        name: currentSupplier.name!,
        email: currentSupplier.email,
        phone: currentSupplier.phone,
        address: currentSupplier.address,
        contactPerson: currentSupplier.contactPerson,
        aiHint: currentSupplier.aiHint || 'office building'
      };
      setSuppliers([...suppliers, newSupplier]);
      toast({ title: UI_TEXT.ADD_SUPPLIER, description: `El proveedor "${newSupplier.name}" ha sido agregado.` });
    }
    handleCloseModal();
  };

  const handleDeleteSupplier = (supplierId: string) => {
    const supplierName = suppliers.find(s => s.id === supplierId)?.name;
    setSuppliers(suppliers.filter(s => s.id !== supplierId));
    toast({ title: 'Proveedor Eliminado', description: `El proveedor "${supplierName}" ha sido eliminado.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentSupplier(prev => prev ? { ...prev, [name]: value } : {});
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [suppliers, searchTerm]);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Truck className="mr-2 h-6 w-6" />
          {UI_TEXT.SUPPLIERS_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_SUPPLIERS_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, contacto, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpenModal()} variant="default" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_SUPPLIER}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI_TEXT.ITEM_NAME}</TableHead>
                <TableHead>{UI_TEXT.EMAIL}</TableHead>
                <TableHead>{UI_TEXT.PHONE}</TableHead>
                <TableHead className="hidden md:table-cell">{UI_TEXT.CONTACT_PERSON}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map(supplier => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium truncate">{supplier.name}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{supplier.contactPerson}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(supplier)} className="text-primary hover:text-primary/80">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSupplier(supplier.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredSuppliers.length === 0 && (
           <p className="text-center text-muted-foreground py-10">{searchTerm ? `No se encontraron proveedores para "${searchTerm}".` : UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? UI_TEXT.EDIT_SUPPLIER : UI_TEXT.ADD_SUPPLIER}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? `Actualice los detalles de "${editingSupplier.name}".` : "Ingrese los detalles del nuevo proveedor."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="name" className="sm:text-right sm:col-span-1">Nombre</Label>
              <Input id="name" name="name" value={currentSupplier?.name || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="email" className="sm:text-right sm:col-span-1">{UI_TEXT.EMAIL}</Label>
              <Input id="email" name="email" type="email" value={currentSupplier?.email || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="phone" className="sm:text-right sm:col-span-1">{UI_TEXT.PHONE}</Label>
              <Input id="phone" name="phone" value={currentSupplier?.phone || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
             <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-start sm:gap-x-4">
              <Label htmlFor="address" className="sm:text-right sm:col-span-1 sm:pt-2">{UI_TEXT.ADDRESS}</Label>
              <Textarea id="address" name="address" value={currentSupplier?.address || ''} onChange={handleChange} className="sm:col-span-3" rows={2} />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="contactPerson" className="sm:text-right sm:col-span-1">{UI_TEXT.CONTACT_PERSON}</Label>
              <Input id="contactPerson" name="contactPerson" value={currentSupplier?.contactPerson || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
             <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="aiHint" className="sm:text-right sm:col-span-1">AI Hint (imagen)</Label>
              <Input id="aiHint" name="aiHint" value={currentSupplier?.aiHint || ''} onChange={handleChange} className="sm:col-span-3" placeholder="ej: edificio oficina"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
            <Button type="submit" onClick={handleSaveSupplier}>{UI_TEXT.SAVE_CHANGES}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

    
