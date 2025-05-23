
"use client";
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UI_TEXT } from '@/lib/constants';
import type { Branch } from '@/types';
import { Edit3, Trash2, PlusCircle, Building, Search } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const initialBranches: Branch[] = [
  { id: '1', name: 'Sucursal Centro', address: 'Av. Principal 123, Centro', phone: '555-1234', aiHint: 'storefront city' },
  { id: '2', name: 'Sucursal Norte', address: 'Calle Norte 456, Col. Industrial', phone: '555-5678', aiHint: 'bakery shop' },
  { id: '3', name: 'Sucursal Playa', address: 'Blvd. Costero 789, Zona Hotelera', phone: '555-9012', aiHint: 'cafe beach' },
];

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Partial<Branch> | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleOpenModal = (branch?: Branch) => {
    setEditingBranch(branch || null);
    setCurrentBranch(branch ? { ...branch } : { name: '', address: '', phone: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBranch(null);
    setEditingBranch(null);
  };

  const handleSaveBranch = () => {
    if (!currentBranch || !currentBranch.name || !currentBranch.address || !currentBranch.phone) {
      toast({ variant: 'destructive', title: 'Error', description: 'Todos los campos son requeridos.' });
      return;
    }

    if (editingBranch) {
      setBranches(branches.map(b => b.id === editingBranch.id ? { ...editingBranch, ...currentBranch } as Branch : b));
      toast({ title: 'Sucursal Actualizada', description: `La sucursal "${currentBranch.name}" ha sido actualizada.` });
    } else {
      const newBranch: Branch = {
        id: (Math.random() * 10000).toString(), // simple ID generation
        name: currentBranch.name!,
        address: currentBranch.address!,
        phone: currentBranch.phone!,
        aiHint: 'store building'
      };
      setBranches([...branches, newBranch]);
      toast({ title: 'Sucursal Agregada', description: `La sucursal "${newBranch.name}" ha sido agregada.` });
    }
    handleCloseModal();
  };

  const handleDeleteBranch = (branchId: string) => {
    const branchName = branches.find(b => b.id === branchId)?.name;
    setBranches(branches.filter(b => b.id !== branchId));
    toast({ title: 'Sucursal Eliminada', description: `La sucursal "${branchName}" ha sido eliminada.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentBranch(prev => prev ? { ...prev, [name]: value } : null);
  };

  const filteredBranches = useMemo(() => {
    return branches.filter(branch =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [branches, searchTerm]);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Building className="mr-2 h-6 w-6" />
          {UI_TEXT.BRANCHES_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_BRANCHES_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpenModal()} variant="default" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_BRANCH}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] hidden sm:table-cell">{UI_TEXT.BRANCH_NAME}</TableHead>
                <TableHead className="min-w-[250px]">{UI_TEXT.ADDRESS}</TableHead>
                <TableHead className="min-w-[120px]">{UI_TEXT.PHONE}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map(branch => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-3">
                        <Image src={`https://placehold.co/40x40.png?text=${branch.name.charAt(0)}`} alt={branch.name} width={40} height={40} className="rounded-md object-cover flex-shrink-0" data-ai-hint={branch.aiHint || 'store building'} />
                        <span className="truncate">{branch.name}</span>
                     </div>
                  </TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell>{branch.phone}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(branch)} className="text-primary hover:text-primary/80">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBranch(branch.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredBranches.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{searchTerm ? `No se encontraron sucursales para "${searchTerm}".` : UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBranch ? UI_TEXT.EDIT_BRANCH : UI_TEXT.ADD_BRANCH}</DialogTitle>
            <DialogDescription>
              {editingBranch ? `Actualice los detalles de la sucursal "${editingBranch.name}".` : "Ingrese los detalles de la nueva sucursal."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="name" className="sm:text-right sm:col-span-1">{UI_TEXT.BRANCH_NAME}</Label>
              <Input id="name" name="name" value={currentBranch?.name || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="address" className="sm:text-right sm:col-span-1">{UI_TEXT.ADDRESS}</Label>
              <Input id="address" name="address" value={currentBranch?.address || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="phone" className="sm:text-right sm:col-span-1">{UI_TEXT.PHONE}</Label>
              <Input id="phone" name="phone" value={currentBranch?.phone || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
            <Button type="submit" onClick={handleSaveBranch}>{UI_TEXT.SAVE_CHANGES}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

    
