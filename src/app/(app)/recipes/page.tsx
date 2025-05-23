
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UI_TEXT, ALL_UNITS } from '@/lib/constants';
import type { Recipe, RecipeIngredient, ManagedProduct, RawMaterial } from '@/types';
import { Edit3, Trash2, PlusCircle, BookCopy, PackagePlus, PackageMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from your state management or API
const mockProducts: Partial<ManagedProduct>[] = [
  { id: 'p1', name: 'Concha de Vainilla', productType: 'produced_item' },
  { id: 'p_cake', name: 'Pastel de Chocolate Mediano', productType: 'produced_item' },
];
const mockRawMaterials: Partial<RawMaterial>[] = [
  { id: 'rm1', name: 'Harina de Trigo', unit: UI_TEXT.UNITS.KG },
  { id: 'rm2', name: 'Azúcar Refinada', unit: UI_TEXT.UNITS.KG },
  { id: 'rm_egg', name: 'Huevo Fresco', unit: UI_TEXT.UNITS.UNIDADES },
  { id: 'rm_milk', name: 'Leche Entera', unit: UI_TEXT.UNITS.LITROS },
  { id: 'rm_vanilla', name: 'Extracto de Vainilla', unit: UI_TEXT.UNITS.ML },
];


const initialRecipes: Recipe[] = [
  { 
    id: 'r1', 
    name: 'Receta de Concha de Vainilla (Estándar)', 
    producesProductId: 'p1', 
    description: 'Receta clásica para conchas de vainilla esponjosas.',
    yieldQuantity: 12, 
    yieldUnit: UI_TEXT.UNITS.UNIDADES,
    ingredients: [
      { itemId: 'rm1', itemType: 'raw_material', name: 'Harina de Trigo', quantity: 0.5, unit: UI_TEXT.UNITS.KG },
      { itemId: 'rm2', itemType: 'raw_material', name: 'Azúcar Refinada', quantity: 0.2, unit: UI_TEXT.UNITS.KG },
      { itemId: 'rm_egg', itemType: 'raw_material', name: 'Huevo Fresco', quantity: 2, unit: UI_TEXT.UNITS.UNIDADES },
    ],
    instructions: "1. Mezclar ingredientes secos.\n2. Agregar líquidos y amasar.\n3. Formar y hornear.",
    preparationTime: 30,
    cookingTime: 20,
    aiHint: 'concha bread recipe'
  },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Partial<Recipe>>({});
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Partial<ManagedProduct>[]>(mockProducts.filter(p => p.productType === 'produced_item'));
  const [availableIngredients, setAvailableIngredients] = useState<(Partial<ManagedProduct> | Partial<RawMaterial>)[]>(() => [...mockRawMaterials, ...mockProducts.filter(p => p.productType !== 'produced_item')]);

  const { toast } = useToast();

  const handleOpenModal = (recipe?: Recipe) => {
    setEditingRecipe(recipe || null);
    setCurrentRecipe(recipe ? { ...recipe, ingredients: recipe.ingredients ? [...recipe.ingredients.map(ing => ({...ing}))] : [] } : { name: '', producesProductId: '', yieldQuantity: 1, yieldUnit: ALL_UNITS[0], ingredients: [], instructions: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRecipe({});
    setEditingRecipe(null);
  };

  const handleSaveRecipe = () => {
    if (!currentRecipe.name || !currentRecipe.producesProductId || !currentRecipe.yieldQuantity || !currentRecipe.yieldUnit) {
      toast({ variant: 'destructive', title: 'Error', description: 'Nombre, producto elaborado, cantidad y unidad producida son requeridos.' });
      return;
    }
    if (currentRecipe.yieldQuantity <=0) {
        toast({ variant: 'destructive', title: 'Error', description: 'La cantidad producida debe ser mayor a cero.' });
        return;
    }
    if (!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debe agregar al menos un ingrediente.' });
      return;
    }


    if (editingRecipe) {
      setRecipes(recipes.map(r => r.id === editingRecipe.id ? { ...editingRecipe, ...currentRecipe } as Recipe : r));
      toast({ title: UI_TEXT.EDIT_RECIPE, description: `La receta "${currentRecipe.name}" ha sido actualizada.` });
    } else {
      const newRecipe: Recipe = {
        id: `r${Date.now()}`,
        name: currentRecipe.name!,
        producesProductId: currentRecipe.producesProductId!,
        yieldQuantity: currentRecipe.yieldQuantity!,
        yieldUnit: currentRecipe.yieldUnit!,
        ingredients: currentRecipe.ingredients || [],
        description: currentRecipe.description,
        instructions: currentRecipe.instructions,
        preparationTime: currentRecipe.preparationTime,
        cookingTime: currentRecipe.cookingTime,
        aiHint: currentRecipe.aiHint || 'recipe book'
      };
      setRecipes([...recipes, newRecipe]);
      toast({ title: UI_TEXT.ADD_RECIPE, description: `La receta "${newRecipe.name}" ha sido agregada.` });
    }
    handleCloseModal();
  };

  const handleDeleteRecipe = (recipeId: string) => {
    const recipeName = recipes.find(r => r.id === recipeId)?.name;
    setRecipes(recipes.filter(r => r.id !== recipeId));
    toast({ title: 'Receta Eliminada', description: `La receta "${recipeName}" ha sido eliminada.`, variant: 'destructive' });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setCurrentRecipe(prev => prev ? { ...prev, [name]: type === 'number' ? parseFloat(value) : value } : {});
  };

  const handleSelectChange = (name: keyof Recipe, value: string) => {
    setCurrentRecipe(prev => prev ? { ...prev, [name]: value } : {});
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    setCurrentRecipe(prev => {
      if (!prev || !prev.ingredients) return prev;
      const newIngredients = [...prev.ingredients];
      if (field === 'itemId') {
        const selectedItem = availableIngredients.find(item => item.id === value);
        newIngredients[index] = {
          ...newIngredients[index],
          [field]: value as string,
          name: selectedItem?.name || '',
          // @ts-ignore // productType is on ManagedProduct, not RawMaterial
          itemType: selectedItem?.productType ? 'product' : 'raw_material',
          unit: selectedItem?.unit || ALL_UNITS[0] // Default unit from selected item
        };
      } else {
         newIngredients[index] = { ...newIngredients[index], [field]: value };
      }
      return { ...prev, ingredients: newIngredients };
    });
  };

  const addIngredient = () => {
    setCurrentRecipe(prev => {
      if (!prev) return prev;
      const newIngredient: RecipeIngredient = { itemId: '', itemType: 'raw_material', name: '', quantity: 1, unit: ALL_UNITS[0] };
      return { ...prev, ingredients: [...(prev.ingredients || []), newIngredient] };
    });
  };

  const removeIngredient = (index: number) => {
    setCurrentRecipe(prev => {
      if (!prev || !prev.ingredients) return prev;
      const newIngredients = prev.ingredients.filter((_, i) => i !== index);
      return { ...prev, ingredients: newIngredients };
    });
  };
  
  const getProductName = (productId: string) => mockProducts.find(p => p.id === productId)?.name || productId;


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <BookCopy className="mr-2 h-6 w-6" />
          {UI_TEXT.RECIPES_TITLE}
        </CardTitle>
        <CardDescription>{UI_TEXT.MANAGE_RECIPES_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => handleOpenModal()} variant="default">
            <PlusCircle className="mr-2 h-4 w-4" />
            {UI_TEXT.ADD_RECIPE}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI_TEXT.RECIPE_NAME}</TableHead>
                <TableHead>{UI_TEXT.PRODUCES_PRODUCT}</TableHead>
                <TableHead className="text-right">{UI_TEXT.YIELD_QUANTITY}</TableHead>
                <TableHead>{UI_TEXT.YIELD_UNIT}</TableHead>
                <TableHead className="text-center">{UI_TEXT.ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map(recipe => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>{getProductName(recipe.producesProductId)}</TableCell>
                  <TableCell className="text-right">{recipe.yieldQuantity}</TableCell>
                  <TableCell>{recipe.yieldUnit}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(recipe)} className="text-primary hover:text-primary/80">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRecipe(recipe.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {recipes.length === 0 && (
          <p className="text-center text-muted-foreground py-10">{UI_TEXT.NO_DATA}</p>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingRecipe ? UI_TEXT.EDIT_RECIPE : UI_TEXT.ADD_RECIPE}</DialogTitle>
            <DialogDescription>
              {editingRecipe ? `Actualice los detalles de la receta "${editingRecipe.name}".` : "Ingrese los detalles de la nueva receta."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] p-1">
          <div className="grid gap-6 py-4 pr-3">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right col-span-1">{UI_TEXT.RECIPE_NAME}</Label>
              <Input id="name" name="name" value={currentRecipe?.name || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="producesProductId" className="text-right col-span-1">{UI_TEXT.PRODUCES_PRODUCT}</Label>
              <Select name="producesProductId" value={currentRecipe?.producesProductId || ''} onValueChange={(value) => handleSelectChange('producesProductId', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={`Seleccione ${UI_TEXT.PRODUCES_PRODUCT.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map(prod => (
                    <SelectItem key={prod.id!} value={prod.id!}>{prod.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="yieldQuantity" className="text-right col-span-1">{UI_TEXT.YIELD_QUANTITY}</Label>
              <Input id="yieldQuantity" name="yieldQuantity" type="number" value={currentRecipe?.yieldQuantity || 1} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="yieldUnit" className="text-right col-span-1">{UI_TEXT.YIELD_UNIT}</Label>
              <Select name="yieldUnit" value={currentRecipe?.yieldUnit || ''} onValueChange={(value) => handleSelectChange('yieldUnit', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={`Seleccione ${UI_TEXT.YIELD_UNIT.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_UNITS.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right col-span-1 pt-2">{UI_TEXT.DESCRIPTION}</Label>
                <Textarea id="description" name="description" value={currentRecipe?.description || ''} onChange={handleChange} className="col-span-3" rows={2}/>
            </div>

            {/* Ingredients Section */}
            <div className="col-span-4 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">{UI_TEXT.INGREDIENTS}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addIngredient}><PackagePlus className="mr-2 h-4 w-4" /> {UI_TEXT.ADD_INGREDIENT}</Button>
              </div>
              {currentRecipe?.ingredients?.map((ing, index) => (
                <Card key={index} className="p-3 bg-secondary/30">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label htmlFor={`ing-item-${index}`} className="text-xs">{UI_TEXT.ITEM_NAME}</Label>
                      <Select 
                        value={ing.itemId} 
                        onValueChange={(value) => handleIngredientChange(index, 'itemId', value)}
                      >
                        <SelectTrigger id={`ing-item-${index}`}>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIngredients.map(item => (
                            <SelectItem key={item.id!} value={item.id!}>{item.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="col-span-3">
                      <Label htmlFor={`ing-qty-${index}`} className="text-xs">{UI_TEXT.QUANTITY}</Label>
                      <Input id={`ing-qty-${index}`} type="number" value={ing.quantity} onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))} />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`ing-unit-${index}`} className="text-xs">{UI_TEXT.UNIT}</Label>
                      <Select 
                        value={ing.unit}
                        onValueChange={(value) => handleIngredientChange(index, 'unit', value)}
                      >
                        <SelectTrigger id={`ing-unit-${index}`}>
                          <SelectValue placeholder="Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_UNITS.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)} className="text-destructive hover:text-destructive/80 mt-auto">
                        <PackageMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {(!currentRecipe?.ingredients || currentRecipe.ingredients.length === 0) && <p className="text-xs text-muted-foreground text-center py-2">No hay ingredientes.</p>}
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="instructions" className="text-right col-span-1 pt-2">{UI_TEXT.INSTRUCTIONS}</Label>
              <Textarea id="instructions" name="instructions" value={currentRecipe?.instructions || ''} onChange={handleChange} className="col-span-3" rows={4} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preparationTime" className="text-right col-span-1">{UI_TEXT.PREPARATION_TIME}</Label>
              <Input id="preparationTime" name="preparationTime" type="number" value={currentRecipe?.preparationTime || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cookingTime" className="text-right col-span-1">{UI_TEXT.COOKING_TIME}</Label>
              <Input id="cookingTime" name="cookingTime" type="number" value={currentRecipe?.cookingTime || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aiHint" className="text-right col-span-1">AI Hint (imagen)</Label>
              <Input id="aiHint" name="aiHint" value={currentRecipe?.aiHint || ''} onChange={handleChange} className="col-span-3" placeholder="ej: libro recetas"/>
            </div>
          </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={handleCloseModal}>{UI_TEXT.CANCEL}</Button>
            <Button type="submit" onClick={handleSaveRecipe}>{UI_TEXT.SAVE_CHANGES}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

