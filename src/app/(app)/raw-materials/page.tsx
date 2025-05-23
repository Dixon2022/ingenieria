
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UI_TEXT, ALL_UNITS, ALL_RAW_MATERIAL_CATEGORIES } from '@/lib/constants';
import type { RawMaterial } from '@/types';
import { Edit3, Trash2, PlusCircle, Beaker } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const initialRawMaterials: RawMaterial[] = [
  { id: 'rm1', name: 'Harina de Trigo', category: UI_TEXT.RAW_MATERIAL_CATEGORIES.INGREDIENTES, stock: 100, unit: UI_TEXT.UNITS.KG, minStockLevel: 20, supplierId: 's1', imageUrl: 'https://placehold.co/40x40.png', aiHint: 'flour bag' },
  { id: 'rm2', name: 'Azúcar Refinada', category: UI_TEXT.RAW_MATERIAL_CATEGORIES.INGREDIENTES, stock: 50, unit: UI_TEXT.UNITS.KG, minStockLevel: 10, supplierId: 's1', imageUrl: 'https://placehold.co/40x40.png', aiHint: 'sugar sack' },
  { id: 'rm3', name: 'Cajas para Pastel Grande', category: UI_TEXT.RAW_MATERIAL_CATEGORIES.EMPAQUES, stock: 200, unit: UI_TEXT.UNITS.UNIDADES, minStockLevel: 50, supplierId: 's3', imageUrl: 'https://placehold.co/40x40.png', aiHint: 'cake box' },
];

export default function RawMaterialsPage() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(initialRawMaterials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRawMaterial, setCurrentRawMaterial] = useState<Partial<RawMaterial>>({});
  const [editingRawMaterial, setEditingRawMaterial] = useState<RawMaterial | null>(null);
  const { toast } = useToast();

  const handleOpenModal = (material?: RawMaterial) => {
    setEditingRawMaterial(material || null);
    setCurrentRawMaterial(material ? { ...material } : { name: '', category: ALL_RAW_MATERIAL_CATEGORIES[0], stock: 0, unit: ALL_UNITS[0], minStockLevel: 0 });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRawMaterial({});
    setEditingRawMaterial(null);
  };

  const handleSaveRawMaterial = () => {
    if (!currentRawMaterial.name || !currentRawMaterial.category || !currentRawMaterial.unit) {
      toast({ variant: 'destructive', title: 'Error', description: 'Nombre, categoría y unidad son requeridos.' });
      return;
    }
    if (currentRawMaterial.stock === undefined || currentRawMaterial.stock < 0 || currentRawMaterial.minStockLevel === undefined || currentRawMaterial.minStockLevel < 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Stock y Stock Mínimo deben ser números no negativos.' });
        return;
    }

    if (editingRawMaterial) {
      setRawMaterials(rawMaterials.map(rm => rm.id === editingRawMaterial.id ? { ...editingRawMaterial, ...currentRawMaterial } as RawMaterial : rm));
      toast({ title: UI_TEXT.EDIT_RAW_MATERIAL, description: `La materia prima "${currentRawMaterial.name}" ha sido actualizada.` });
    } else {
      const newRawMaterial: RawMaterial = {
        id: `rm${Date.now()}`,
        name: currentRawMaterial.name!,
        category: currentRawMaterial.category!,
        stock: currentRawMaterial.stock || 0,
        unit: currentRawMaterial.unit!,
        minStockLevel: currentRawMaterial.minStockLevel || 0,
        description: currentRawMaterial.description,
        supplierId: currentRawMaterial.supplierId,
        imageUrl: currentRawMaterial.imageUrl || `https://placehold.co/40x40.png?text=${currentRawMaterial.name!.substring(0,2)}`,
        aiHint: currentRawMaterial.aiHint || 'material item',
      };
      setRawMaterials([...rawMaterials, newRawMaterial]);
      toast({ title: UI_TEXT.ADD_RAW_MATERIAL, description: `La materia prima "${newRawMaterial.name}" ha sido agregada.` });
    }
    handleCloseModal();
  };

  const handleDeleteRawMaterial = (materialId: string) => {
    const materialName = rawMaterials.find(rm => rm.id === materialId)?.name;
    setRawMaterials(rawMaterials.filter(rm => rm.id !== materialId));
    toast({ title: 'Materia Prima Eliminada', description: `"${materialName}" ha sido eliminada.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setCurrentRawMaterial(prev => prev ? { ...prev, [name]: type === 'number' ? parseFloat(value) : value } : {});
  };

  const handleSelectChange = (name: keyof RawMaterial, value: string) => {
    setCurrentRawMaterial(prev => prev ? { ...prev, [name]: value } : {});
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Beaker className="mr-2 h-6 w-6" />
          {UI_TEXT.RAW_MATERIALS_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_RAW_MATERIALS_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => handleOpenModal()} variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_RAW_MATERIAL}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] hidden sm:table-cell"></TableHead>
                <TableHead>{UI_TEXT.ITEM_NAME}</TableHead>
                <TableHead>{UI_TEXT.CATEGORY}</TableHead>
                <TableHead className="text-right">{UI_TEXT.STOCK}</TableHead>
                <TableHead>{UI_TEXT.UNIT}</TableHead>
                <TableHead className="text-right">{UI_TEXT.MIN_QUANTITY_TOLERANCE}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawMaterials.map(material => (
                <TableRow key={material.id}>
                   <TableCell className="hidden sm:table-cell">
                    <Image src={material.imageUrl || `https://placehold.co/40x40.png?text=${material.name.substring(0,1)}`} alt={material.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={material.aiHint || 'raw material'} />
                  </TableCell>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.category}</TableCell>
                  <TableCell className="text-right">{material.stock}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell className="text-right">{material.minStockLevel}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(material)} className="text-primary hover:text-primary/80">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRawMaterial(material.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {rawMaterials.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRawMaterial ? UI_TEXT.EDIT_RAW_MATERIAL : UI_TEXT.ADD_RAW_MATERIAL}</DialogTitle>
            <DialogDescription>
              {editingRawMaterial ? `Actualice los detalles de "${editingRawMaterial.name}".` : "Ingrese los detalles de la nueva materia prima."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right col-span-1">Nombre</Label>
              <Input id="name" name="name" value={currentRawMaterial?.name || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right col-span-1">{UI_TEXT.CATEGORY}</Label>
              <Select name="category" value={currentRawMaterial?.category || ''} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={`Seleccione ${UI_TEXT.CATEGORY.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_RAW_MATERIAL_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right col-span-1">{UI_TEXT.STOCK}</Label>
              <Input id="stock" name="stock" type="number" value={currentRawMaterial?.stock || 0} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right col-span-1">{UI_TEXT.UNIT}</Label>
               <Select name="unit" value={currentRawMaterial?.unit || ''} onValueChange={(value) => handleSelectChange('unit', value)}>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minStockLevel" className="text-right col-span-1">{UI_TEXT.MIN_QUANTITY_TOLERANCE}</Label>
              <Input id="minStockLevel" name="minStockLevel" type="number" value={currentRawMaterial?.minStockLevel || 0} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplierId" className="text-right col-span-1">{UI_TEXT.SUPPLIER}</Label>
                {/* TODO: Replace with a Select populated by actual suppliers */}
                <Input id="supplierId" name="supplierId" value={currentRawMaterial?.supplierId || ''} onChange={handleChange} className="col-span-3" placeholder="ID Proveedor (opcional)" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right col-span-1 pt-2">{UI_TEXT.DESCRIPTION}</Label>
              <Textarea id="description" name="description" value={currentRawMaterial?.description || ''} onChange={handleChange} className="col-span-3" rows={3} />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right col-span-1">URL de Imagen</Label>
              <Input id="imageUrl" name="imageUrl" value={currentRawMaterial?.imageUrl || ''} onChange={handleChange} className="col-span-3" placeholder="https://placehold.co/40x40.png"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aiHint" className="text-right col-span-1">AI Hint (imagen)</Label>
              <Input id="aiHint" name="aiHint" value={currentRawMaterial?.aiHint || ''} onChange={handleChange} className="col-span-3" placeholder="ej: harina costal"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
            <Button type="submit" onClick={handleSaveRawMaterial}>{UI_TEXT.SAVE_CHANGES}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
