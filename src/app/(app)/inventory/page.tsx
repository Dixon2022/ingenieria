"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UI_TEXT } from '@/lib/constants';
import type { InventoryItem } from '@/types';
import { Edit3, PackageCheck, AlertTriangle, Save, Trash2, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


const initialInventory: InventoryItem[] = [
  { id: '1', name: 'Harina de Trigo', stock: 50, unit: UI_TEXT.UNITS.KG, minStockLevel: 10, category: 'Ingredientes', imageUrl: 'https://placehold.co/40x40.png', aiHint: 'flour bag' },
  { id: '2', name: 'Azúcar', stock: 30, unit: UI_TEXT.UNITS.KG, minStockLevel: 5, category: 'Ingredientes', imageUrl: 'https://placehold.co/40x40.png', aiHint: 'sugar crystals' },
  { id: '3', name: 'Huevos', stock: 100, unit: UI_TEXT.UNITS.UNIDADES, minStockLevel: 24, category: 'Ingredientes', imageUrl: 'https://placehold.co/40x40.png', aiHint: 'egg carton' },
  { id: '4', name: 'Conchas Horneadas', stock: 20, unit: UI_TEXT.UNITS.UNIDADES, minStockLevel: 10, category: UI_TEXT.PRODUCT_CATEGORIES.PAN_DULCE, imageUrl: 'https://placehold.co/40x40.png', aiHint: 'sweet bread' },
  { id: '5', name: 'Bolillos Horneados', stock: 15, unit: UI_TEXT.UNITS.UNIDADES, minStockLevel: 20, category: UI_TEXT.PRODUCT_CATEGORIES.PAN_SALADO, imageUrl: 'https://placehold.co/40x40.png', aiHint: 'bread roll' },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const { toast } = useToast();

  const handleEdit = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditStockValue(item.stock);
  };

  const handleSave = (itemId: string) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, stock: editStockValue } : item
      )
    );
    setEditingItemId(null);
    toast({ title: "Inventario Actualizado", description: `El stock de ${inventory.find(i=>i.id === itemId)?.name} ha sido actualizado.`});
  };
  
  // TODO: Add item, Delete item functionality can be added later.

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">{UI_TEXT.INVENTORY_TITLE}</CardTitle>
        <CardDescription>Monitoree y actualice los niveles de stock de sus productos e ingredientes.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* <div className="mb-4 flex justify-end">
          <Button variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Artículo
          </Button>
        </div> */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
                <TableHead>{UI_TEXT.ITEM_NAME}</TableHead>
                <TableHead className="text-right">{UI_TEXT.STOCK}</TableHead>
                <TableHead className="hidden md:table-cell">{UI_TEXT.UNIT}</TableHead>
                <TableHead className="text-right hidden md:table-cell">{UI_TEXT.MIN_STOCK}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map(item => (
                <TableRow key={item.id} className={item.stock < item.minStockLevel ? 'bg-destructive/10 hover:bg-destructive/20' : ''}>
                  <TableCell className="hidden sm:table-cell">
                    <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={item.aiHint} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.name}
                    {item.stock < item.minStockLevel && (
                      <AlertTriangle className="inline-block ml-2 h-4 w-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingItemId === item.id ? (
                      <Input
                        type="number"
                        value={editStockValue}
                        onChange={e => setEditStockValue(parseInt(e.target.value, 10))}
                        className="w-20 text-right h-8"
                        autoFocus
                        onBlur={() => handleSave(item.id)} // Save on blur
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(item.id)} // Save on Enter
                      />
                    ) : (
                      item.stock
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{item.unit}</TableCell>
                  <TableCell className="text-right hidden md:table-cell">{item.minStockLevel}</TableCell>
                  <TableCell className="text-center">
                    {editingItemId === item.id ? (
                      <Button variant="ghost" size="icon" onClick={() => handleSave(item.id)} className="text-green-600 hover:text-green-700">
                        <Save className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Placeholder for delete action
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el artículo "{item.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => console.log("Delete item", item.id)} className="bg-destructive hover:bg-destructive/90">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {inventory.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>
    </Card>
  );
}
