export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  aiHint: string; // For placeholder image search
}

export interface CartItem extends Product {
  quantity: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStockLevel: number;
  category: string; // For general categorization in inventory overview
  itemType?: 'product' | 'raw_material'; // To distinguish in a combined inventory list
  imageUrl: string; 
  aiHint: string; 
}

export interface SalesDataInput {
  ventas: { item: string; cantidadVendida: number }[];
  inventarioActual?: { item: string; stock: number }[]; 
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  aiHint?: string; 
}

export interface ManagedUser {
  id: string;
  identification: string;
  username: string;
  firstName: string;
  lastName: string;
  isBlocked: boolean;
  roles: string[]; 
  avatarUrl?: string;
  aiHint?: string; 
}

// New Types for additional functionalities

export type ProductType = 'third_party_sale' | 'third_party_production' | 'produced_item';

export const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = [
  { value: 'third_party_sale', label: 'Terceros para Venta' },
  { value: 'third_party_production', label: 'Terceros para Producción' },
  { value: 'produced_item', label: 'Artículo Producido' },
];

export interface ManagedProduct {
  id: string;
  name: string;
  productType: ProductType;
  category: string; // e.g., Pan Dulce, Bebidas (if sellable), or Insumos (if third_party_production)
  price?: number; // Selling price, for 'third_party_sale' and 'produced_item'
  cost?: number; // Purchase cost for 'third_party_*'; calculated or base for 'produced_item'
  unit: string; // Unit of sale/production/purchase
  supplierId?: string; // For third_party_* types
  recipeId?: string; // For 'produced_item' type, links to Recipe.id
  description?: string;
  imageUrl?: string;
  aiHint?: string;
  stock: number; // Current stock
  minStockLevel: number; // Minimum stock level
}

export interface RawMaterial {
  id: string;
  name:string;
  description?: string;
  category: string; // e.g., Ingredientes, Empaques, Limpieza
  stock: number;
  unit: string; // e.g., kg, gr, lt, ml, unidad
  minStockLevel: number; // Minimum tolerance quantity
  supplierId?: string; // Optional: preferred supplier
  imageUrl?: string;
  aiHint?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  aiHint?: string; // for a generic supplier/company logo placeholder
}

export interface RecipeIngredient {
  itemId: string; // ID of RawMaterial or ManagedProduct (sub-assembly)
  itemType: 'raw_material' | 'product'; // Distinguishes the source of the ingredient
  name: string; // Denormalized name for display in recipe
  quantity: number;
  unit: string; // Unit for this ingredient in the recipe
}

export interface Recipe {
  id: string;
  name: string; // e.g., "Receta para Concha de Vainilla"
  producesProductId: string; // ID of the 'produced_item' ManagedProduct this recipe is for
  description?: string;
  yieldQuantity: number; // How many units this recipe produces (e.g., 12)
  yieldUnit: string; // Unit of the produced item (e.g., "unidades")
  ingredients: RecipeIngredient[];
  instructions?: string; // Multi-line text for preparation steps
  preparationTime?: number; // in minutes
  cookingTime?: number; // in minutes
  aiHint?: string; // for an image representing the recipe or final product
}
