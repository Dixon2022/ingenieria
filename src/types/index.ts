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
  category: string;
  imageUrl: string; // Added for potential display in inventory
  aiHint: string; // For placeholder image search
}

// Example structure for AI sales data input, if needed elsewhere
export interface SalesDataInput {
  ventas: { item: string; cantidadVendida: number }[];
  inventarioActual?: { item: string; stock: number }[]; // Optional based on prompt
}
