
"use client";
import { useState, useEffect, useMemo } from 'react';
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
import { Edit3, Trash2, PlusCircle, BookCopy, PackagePlus, PackageMinus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from your state management or API
const mockProducts: Partial<ManagedProduct>[] = [
  { id: 'p1', name: 'Concha de Vainilla', productType: 'produced_item', unit: UI_TEXT.UNITS.UNIDADES },
  { id: 'p_cake', name: 'Pastel de Chocolate Mediano', productType: 'produced_item', unit: UI_TEXT.UNITS.UNIDADES },
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
      { id: 'ing_temp_1', itemId: 'rm1', itemType: 'raw_material', name: 'Harina de Trigo', quantity: 0.5, unit: UI_TEXT.UNITS.KG },
      { id: 'ing_temp_2', itemId: 'rm2', itemType: 'raw_material', name: 'Azúcar Refinada', quantity: 0.2, unit: UI_TEXT.UNITS.KG },
      { id: 'ing_temp_3', itemId: 'rm_egg', itemType: 'raw_material', name: 'Huevo Fresco', quantity: 2, unit: UI_TEXT.UNITS.UNIDADES },
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
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleOpenModal = (recipe?: Recipe) => {
    setEditingRecipe(recipe || null);
    const ingredientsWithTempIds = recipe?.ingredients?.map((ing, idx) => ({ ...ing, id: `temp_id_${idx}` })) || [];
    setCurrentRecipe(recipe ? { ...recipe, ingredients: ingredientsWithTempIds } : { name: '', producesProductId: '', yieldQuantity: 1, yieldUnit: ALL_UNITS[0], ingredients: [], instructions: '' });
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

    const recipeToSave = {
        ...currentRecipe,
        ingredients: currentRecipe.ingredients?.map(({ id, ...rest}) => rest) // Remove temporary id from ingredients
    } as Omit<Recipe, 'id'>;


    if (editingRecipe) {
      setRecipes(recipes.map(r => r.id === editingRecipe.id ? { id: editingRecipe.id, ...recipeToSave } : r));
      toast({ title: UI_TEXT.EDIT_RECIPE, description: `La receta "${currentRecipe.name}" ha sido actualizada.` });
    } else {
      const newRecipe: Recipe = {
        id: `r${Date.now()}`,
        ...recipeToSave,
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

  const handleIngredientChange = (tempId: string, field: keyof RecipeIngredient, value: string | number) => {
    setCurrentRecipe(prev => {
      if (!prev || !prev.ingredients) return prev;
      const newIngredients = prev.ingredients.map(ing => {
        if (ing.id === tempId) {
          if (field === 'itemId') {
            const selectedItem = availableIngredients.find(item => item.id === value);
            return {
              ...ing,
              itemId: value as string,
              name: selectedItem?.name || '',
              // @ts-ignore 
              itemType: selectedItem?.productType ? 'product' : 'raw_material',
              unit: selectedItem?.unit || ALL_UNITS[0]
            };
          }
          return { ...ing, [field]: value };
        }
        return ing;
      });
      return { ...prev, ingredients: newIngredients };
    });
  };

  const addIngredient = () => {
    setCurrentRecipe(prev => {
      if (!prev) return prev;
      const newIngredient: RecipeIngredient = { id: `temp_id_${Date.now()}`, itemId: '', itemType: 'raw_material', name: '', quantity: 1, unit: ALL_UNITS[0] };
      return { ...prev, ingredients: [...(prev.ingredients || []), newIngredient] };
    });
  };

  const removeIngredient = (tempId: string) => {
    setCurrentRecipe(prev => {
      if (!prev || !prev.ingredients) return prev;
      const newIngredients = prev.ingredients.filter((ing) => ing.id !== tempId);
      return { ...prev, ingredients: newIngredients };
    });
  };
  
  const getProductName = (productId?: string) => mockProducts.find(p => p.id === productId)?.name || productId || 'N/A';

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProductName(recipe.producesProductId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recipes, searchTerm]);


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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
           <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre de receta o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpenModal()} variant="default" className="w-full sm:w-auto">
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
              {filteredRecipes.map(recipe => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium truncate">{recipe.name}</TableCell>
                  <TableCell>{getProductName(recipe.producesProductId)}</TableCell>
                  <TableCell className="text-right">{recipe.yieldQuantity}</TableCell>
                  <TableCell>{recipe.yieldUnit}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
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
        {filteredRecipes.length === 0 && (
           <p className="text-center text-muted-foreground py-10">{searchTerm ? `No se encontraron recetas para "${searchTerm}".` : UI_TEXT.NO_DATA}</p>
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
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="name" className="sm:text-right sm:col-span-1">{UI_TEXT.RECIPE_NAME}</Label>
              <Input id="name" name="name" value={currentRecipe?.name || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="producesProductId" className="sm:text-right sm:col-span-1">{UI_TEXT.PRODUCES_PRODUCT}</Label>
              <Select name="producesProductId" value={currentRecipe?.producesProductId || ''} onValueChange={(value) => handleSelectChange('producesProductId', value)}>
                <SelectTrigger className="sm:col-span-3">
                  <SelectValue placeholder={`Seleccione ${UI_TEXT.PRODUCES_PRODUCT.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map(prod => (
                    <SelectItem key={prod.id!} value={prod.id!}>{prod.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="yieldQuantity" className="sm:text-right sm:col-span-1">{UI_TEXT.YIELD_QUANTITY}</Label>
              <Input id="yieldQuantity" name="yieldQuantity" type="number" value={currentRecipe?.yieldQuantity || 1} onChange={handleChange} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="yieldUnit" className="sm:text-right sm:col-span-1">{UI_TEXT.YIELD_UNIT}</Label>
              <Select name="yieldUnit" value={currentRecipe?.yieldUnit || ''} onValueChange={(value) => handleSelectChange('yieldUnit', value)}>
                <SelectTrigger className="sm:col-span-3">
                  <SelectValue placeholder={`Seleccione ${UI_TEXT.YIELD_UNIT.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_UNITS.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-start sm:gap-x-4">
                <Label htmlFor="description" className="sm:text-right sm:col-span-1 sm:pt-2">{UI_TEXT.DESCRIPTION}</Label>
                <Textarea id="description" name="description" value={currentRecipe?.description || ''} onChange={handleChange} className="sm:col-span-3" rows={2}/>
            </div>

            {/* Ingredients Section */}
            <div className="col-span-full space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">{UI_TEXT.INGREDIENTS}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addIngredient}><PackagePlus className="mr-2 h-4 w-4" /> {UI_TEXT.ADD_INGREDIENT}</Button>
              </div>
              {currentRecipe?.ingredients?.map((ing, index) => (
                <Card key={ing.id} className="p-3 bg-secondary/30">
                   <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-12 sm:gap-x-2 sm:items-end">
                    <div className="sm:col-span-5">
                      <Label htmlFor={`ing-item-${ing.id}`} className="text-xs">{UI_TEXT.ITEM_NAME}</Label>
                      <Select 
                        value={ing.itemId} 
                        onValueChange={(value) => handleIngredientChange(ing.id!, 'itemId', value)}
                      >
                        <SelectTrigger id={`ing-item-${ing.id}`}>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIngredients.map(item => (
                            <SelectItem key={item.id!} value={item.id!}>{item.name} ({item.unit})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="sm:col-span-3">
                      <Label htmlFor={`ing-qty-${ing.id}`} className="text-xs">{UI_TEXT.QUANTITY}</Label>
                      <Input id={`ing-qty-${ing.id}`} type="number" value={ing.quantity} onChange={(e) => handleIngredientChange(ing.id!, 'quantity', parseFloat(e.target.value))} />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor={`ing-unit-${ing.id}`} className="text-xs">{UI_TEXT.UNIT}</Label>
                      <Select 
                        value={ing.unit}
                        onValueChange={(value) => handleIngredientChange(ing.id!, 'unit', value)}
                      >
                        <SelectTrigger id={`ing-unit-${ing.id}`}>
                          <SelectValue placeholder="Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_UNITS.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-1 flex justify-end sm:self-end">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(ing.id!)} className="text-destructive hover:text-destructive/80">
                        <PackageMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {(!currentRecipe?.ingredients || currentRecipe.ingredients.length === 0) && <p className="text-xs text-muted-foreground text-center py-2">No hay ingredientes.</p>}
            </div>

            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-start sm:gap-x-4">
              <Label htmlFor="instructions" className="sm:text-right sm:col-span-1 sm:pt-2">{UI_TEXT.INSTRUCTIONS}</Label>
              <Textarea id="instructions" name="instructions" value={currentRecipe?.instructions || ''} onChange={handleChange} className="sm:col-span-3" rows={4} />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="preparationTime" className="sm:text-right sm:col-span-1">{UI_TEXT.PREPARATION_TIME}</Label>
              <Input id="preparationTime" name="preparationTime" type="number" value={currentRecipe?.preparationTime || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="cookingTime" className="sm:text-right sm:col-span-1">{UI_TEXT.COOKING_TIME}</Label>
              <Input id="cookingTime" name="cookingTime" type="number" value={currentRecipe?.cookingTime || ''} onChange={handleChange} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 items-start gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
              <Label htmlFor="aiHint" className="sm:text-right sm:col-span-1">AI Hint (imagen)</Label>
              <Input id="aiHint" name="aiHint" value={currentRecipe?.aiHint || ''} onChange={handleChange} className="sm:col-span-3" placeholder="ej: libro recetas"/>
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

    
