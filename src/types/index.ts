
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
  category: string; 
  price?: number; 
  cost?: number; 
  unit: string; 
  supplierId?: string; 
  recipeId?: string; 
  description?: string;
  imageUrl?: string;
  aiHint?: string;
  stock: number; 
  minStockLevel: number; 
}

export interface RawMaterial {
  id: string;
  name:string;
  description?: string;
  category: string; 
  stock: number;
  unit: string; 
  minStockLevel: number; 
  supplierId?: string; 
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
  aiHint?: string; 
}

export interface RecipeIngredient {
  id: string; // Temp ID for list management in forms
  itemId: string; 
  itemType: 'raw_material' | 'product'; 
  name: string; 
  quantity: number;
  unit: string; 
}

export interface Recipe {
  id: string;
  name: string; 
  producesProductId: string; 
  description?: string;
  yieldQuantity: number; 
  yieldUnit: string; 
  ingredients: RecipeIngredient[];
  instructions?: string; 
  preparationTime?: number; 
  cookingTime?: number; 
  aiHint?: string; 
}

// Document Types

export interface PurchaseOrderItem {
  id: string; // Temp ID for list management
  itemId: string; 
  itemType: 'raw_material' | 'product';
  itemName: string; 
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  documentNumber: string; 
  supplierId: string; 
  supplierName?: string; 
  branchId: string; 
  orderDate: string; 
  expectedDeliveryDate?: string;
  items: PurchaseOrderItem[];
  notes?: string;
  status: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  totalAmount?: number; // Calculated
  aiHint?: string; 
}

export interface SalesOrderItem {
  id: string; // Temp ID
  productId: string; 
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrder {
  id: string;
  documentNumber: string; 
  customerId?: string; 
  customerName?: string; 
  branchId: string;
  orderDate: string;
  items: SalesOrderItem[];
  paymentMethod?: string;
  notes?: string;
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount?: number; // Calculated
  requiresOpenCashRegister?: boolean; // Reminder for business rule
  aiHint?: string;
}

export interface InventoryAdjustmentItem {
  id: string; // Temp ID
  itemId: string; 
  itemType: 'raw_material' | 'product';
  itemName: string;
  quantity: number; 
  unit: string;
  reasonPerItem?: string; 
}

export interface InventoryAdjustment {
  id: string;
  documentNumber: string; 
  branchId: string;
  adjustmentDate: string;
  adjustmentType: 'increase' | 'decrease' | 'recount'; 
  reasonGeneral: string; 
  items: InventoryAdjustmentItem[];
  notes?: string;
  status: 'draft' | 'completed';
  aiHint?: string;
}

export interface StockTransferItem {
  id: string; // Temp ID
  itemId: string; 
  itemType: 'raw_material' | 'product';
  itemName: string;
  quantity: number;
  unit: string;
}

export interface StockTransfer {
  id: string;
  documentNumber: string; 
  sourceBranchId: string;
  destinationBranchId: string;
  transferDate: string;
  expectedArrivalDate?: string;
  actualArrivalDate?: string;
  items: StockTransferItem[];
  notes?: string;
  status: 'draft' | 'pending_dispatch' | 'in_transit' | 'received' | 'cancelled';
  aiHint?: string;
}

export interface ProductionOrderItemConsumed { 
  id: string; // Temp ID
  itemId: string; 
  itemType: 'raw_material' | 'product';
  itemName: string;
  quantityRequired: number; 
  quantityConsumed: number; 
  unit: string;
}

export interface ProductionOrder {
  id: string;
  documentNumber: string; 
  branchId: string;
  recipeId: string; 
  recipeName?: string; 
  productIdProduced: string; 
  productNameProduced?: string; 
  quantityToProduce: number; 
  unitProduced: string;
  plannedStartDate: string;
  actualStartDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  consumedItems: ProductionOrderItemConsumed[];
  actualYield?: number; 
  notes?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  aiHint?: string;
}
