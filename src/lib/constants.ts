

export const APP_NAME = "AmorPOS";
export const BAKERY_NAME = "Panadería Amores";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  POS: "/pos",
  INVENTORY: "/inventory",
  PRODUCTS: "/products",
  RAW_MATERIALS: "/raw-materials",
  RECIPES: "/recipes",
  SUPPLIERS: "/suppliers",
  REPORTS: "/reports",
  BRANCHES: "/branches",
  USERS: "/users",
  // Document Routes
  PURCHASE_ORDERS: "/purchase-orders",
  SALES_ORDERS: "/sales-orders",
  INVENTORY_ADJUSTMENTS: "/inventory-adjustments",
  STOCK_TRANSFERS: "/stock-transfers",
  PRODUCTION_ORDERS: "/production-orders",
};

export const UI_TEXT = {
  LOGIN_TITLE: "Iniciar Sesión",
  LOGIN_BUTTON: "Ingresar",
  LOGOUT_BUTTON: "Cerrar Sesión",
  USERNAME_LABEL: "Usuario",
  PASSWORD_LABEL: "Contraseña",
  BRANCH_LABEL: "Sucursal",
  POS_TITLE: "Punto de Venta",
  INVENTORY_TITLE: "Inventario General",
  PRODUCTS_TITLE: "Productos",
  RAW_MATERIALS_TITLE: "Materia Prima",
  RECIPES_TITLE: "Recetas",
  SUPPLIERS_TITLE: "Proveedores",
  REPORTS_TITLE: "Reportes de Ventas",
  BRANCHES_TITLE: "Sucursales",
  USERS_TITLE: "Usuarios",
  LOADING: "Cargando...",
  WELCOME_MESSAGE: `Bienvenido a ${APP_NAME}`,
  NAVIGATION: "Navegación",
  ADD_TO_CART: "Agregar",
  CART_TITLE: "Carrito",
  TOTAL: "Total",
  CHECKOUT: "Cobrar",
  CLEAR_CART: "Vaciar Carrito",
  ITEM_NAME: "Nombre",
  STOCK: "Existencia",
  UNIT: "Unidad",
  ACTIONS: "Acciones",
  UPDATE_STOCK: "Actualizar",
  MIN_STOCK: "Stock Mínimo",
  SALES_DATA_LABEL: "Datos de Ventas (JSON)", // Kept for reference, but page will change
  SALES_DATA_PLACEHOLDER: `{
  "ventas": [
    {"item": "Concha de Vainilla", "cantidadVendida": 50},
    {"item": "Bolillo", "cantidadVendida": 120}
  ],
  "inventarioActual": [
    {"item": "Concha de Vainilla", "stock": 20},
    {"item": "Bolillo", "stock": 10}
  ]
}`, // Kept for reference
  ANALYZE_SALES: "Analizar Ventas",
  ANALYSIS_RESULTS: "Resultados del Análisis",
  ITEMS_TO_ADJUST: "Artículos para Ajustar Inventario",
  REASONING: "Justificación",
  NO_DATA: "No hay datos para mostrar.",
  NO_ITEMS_IN_CART: "El carrito está vacío.",
  TRANSACTION_SUCCESS: "Transacción completada.",
  ERROR_LOGIN_FAILED: "Usuario o contraseña incorrectos.",
  ERROR_ANALYSIS: "Error al analizar los datos.",
  PRODUCT_CATEGORIES: {
    PAN_DULCE: "Pan Dulce",
    PAN_SALADO: "Pan Salado",
    PASTELES: "Pasteles",
    BEBIDAS: "Bebidas",
    OTROS: "Otros",
  },
  RAW_MATERIAL_CATEGORIES: {
    INGREDIENTES: "Ingredientes",
    EMPAQUES: "Empaques",
    LIMPIEZA: "Limpieza",
    OTROS: "Otros Insumos",
  },
  PRODUCT_TYPES_LABELS: {
    third_party_sale: "Terceros para Venta",
    third_party_production: "Terceros para Producción",
    produced_item: "Artículo Producido",
  },
  UNITS: {
    UNIDADES: "unidades",
    KG: "kg",
    GR: "gr",
    LITROS: "litros",
    ML: "ml",
    CAJA: "caja",
    PAQUETE: "paquete",
  },
  VIEW_DETAILS: "Ver detalles",
  INVENTORY_ADVICE: "Consejos de Inventario por IA",
  SALES_REPORT_DESCRIPTION: "Seleccione filtros para generar un análisis de ventas y recomendaciones de inventario.", // Updated
  REPORTS_FILTER_TITLE: "Filtros para el Reporte",
  START_DATE: "Fecha de Inicio",
  END_DATE: "Fecha de Fin",
  SELECT_BRANCH: "Seleccionar Sucursal",
  ALL_BRANCHES: "Todas las Sucursales",
  GENERATE_REPORT: "Generar Reporte",
  
  ADD_BRANCH: "Agregar Sucursal",
  EDIT_BRANCH: "Editar Sucursal",
  DELETE_BRANCH: "Eliminar Sucursal",
  BRANCH_NAME: "Nombre de Sucursal",
  ADDRESS: "Dirección",
  PHONE: "Teléfono",
  
  ADD_USER: "Agregar Usuario",
  EDIT_USER: "Editar Usuario",
  DELETE_USER: "Eliminar Usuario",
  IDENTIFICATION: "Identificación",
  USERNAME: "Nombre de Usuario",
  FIRST_NAME: "Nombres",
  LAST_NAME: "Apellidos",
  STATUS: "Estado",
  ROLES: "Roles",
  IS_BLOCKED: "Bloqueado",
  ASSIGN_ROLES: "Asignar Roles",
  USER_STATE_BLOCKED: "Bloqueado",
  USER_STATE_ACTIVE: "Activo",
  
  SAVE_CHANGES: "Guardar Cambios",
  CANCEL: "Cancelar",
  ARE_YOU_SURE: "¿Está seguro?",
  DELETE_CONFIRM_MESSAGE: "Esta acción no se puede deshacer.",
  DELETE: "Eliminar",

  MANAGE_BRANCHES_DESCRIPTION: "Administre las sucursales de la panadería.",
  MANAGE_USERS_DESCRIPTION: "Administre los usuarios del sistema y sus roles.",
  MANAGE_PRODUCTS_DESCRIPTION: "Defina y administre los productos de la panadería.",
  MANAGE_RAW_MATERIALS_DESCRIPTION: "Administre la materia prima y otros insumos.",
  MANAGE_RECIPES_DESCRIPTION: "Cree y administre las recetas para los productos elaborados.",
  MANAGE_SUPPLIERS_DESCRIPTION: "Administre la información de los proveedores.",

  PRODUCT_TYPE: "Tipo de Producto",
  CATEGORY: "Categoría",
  PRICE: "Precio Venta",
  COST: "Costo",
  SUPPLIER: "Proveedor",
  RECIPE: "Receta",
  DESCRIPTION: "Descripción",
  ADD_PRODUCT: "Agregar Producto",
  EDIT_PRODUCT: "Editar Producto",
  
  ADD_RAW_MATERIAL: "Agregar Materia Prima",
  EDIT_RAW_MATERIAL: "Editar Materia Prima",
  MIN_QUANTITY_TOLERANCE: "Cant. Tolerancia Mínima",

  ADD_SUPPLIER: "Agregar Proveedor",
  EDIT_SUPPLIER: "Editar Proveedor",
  EMAIL: "Correo Electrónico",
  CONTACT_PERSON: "Persona de Contacto",
  
  ADD_RECIPE: "Crear Receta",
  EDIT_RECIPE: "Editar Receta",
  VIEW_RECIPE: "Ver Receta", 
  RECIPE_DETAILS: "Detalles de la Receta", 
  RECIPE_NAME: "Nombre de la Receta",
  PRODUCES_PRODUCT: "Producto Elaborado",
  YIELD_QUANTITY: "Cantidad Producida",
  YIELD_UNIT: "Unidad Producida",
  INGREDIENTS: "Ingredientes",
  INSTRUCTIONS: "Instrucciones",
  PREPARATION_TIME: "Tiempo de Prep. (min)",
  COOKING_TIME: "Tiempo de Cocción (min)",
  ADD_INGREDIENT: "Agregar Ingrediente",
  ITEM_TYPE: "Tipo de Item",
  QUANTITY: "Cantidad",

  // Document UI Texts
  PURCHASE_ORDERS_TITLE: "Órdenes de Compra",
  MANAGE_PURCHASE_ORDERS_DESCRIPTION: "Cree y administre órdenes de compra a proveedores.",
  ADD_PURCHASE_ORDER: "Nueva Orden de Compra",
  EDIT_PURCHASE_ORDER: "Editar Orden de Compra",
  DOCUMENT_NUMBER: "No. Documento",
  ORDER_DATE: "Fecha de Orden",
  EXPECTED_DELIVERY_DATE: "Fecha Entrega Estimada",
  ITEMS: "Artículos",
  ADD_ITEM: "Agregar Artículo",
  UNIT_PRICE: "Precio Unit.",
  TOTAL_AMOUNT: "Monto Total",
  NOTES: "Notas",
  DOCUMENT_STATUS_DRAFT: "Borrador",
  DOCUMENT_STATUS_ORDERED: "Ordenado",
  DOCUMENT_STATUS_RECEIVED: "Recibido",
  DOCUMENT_STATUS_CANCELLED: "Cancelado",
  DOCUMENT_STATUS_COMPLETED: "Completado",
  DOCUMENT_STATUS_CONFIRMED: "Confirmado",
  DOCUMENT_STATUS_IN_PROGRESS: "En Progreso",
  DOCUMENT_STATUS_PENDING_DISPATCH: "Pendiente Despacho",
  DOCUMENT_STATUS_IN_TRANSIT: "En Tránsito",
  DOCUMENT_STATUS_PLANNED: "Planificado",


  SALES_ORDERS_TITLE: "Documentos de Venta",
  MANAGE_SALES_ORDERS_DESCRIPTION: "Consulte documentos de venta (boletas/facturas).", 
  ADD_SALES_ORDER: "Nuevo Documento de Venta", 
  EDIT_SALES_ORDER: "Editar Documento de Venta",
  VIEW_SALES_ORDER: "Ver Documento de Venta", 
  CUSTOMER_NAME: "Nombre Cliente",
  PAYMENT_METHOD: "Método de Pago",
  CASH_REGISTER_OPEN_REQUIRED: "Requiere caja abierta (PDV)", 

  INVENTORY_ADJUSTMENTS_TITLE: "Ajustes de Inventario",
  MANAGE_INVENTORY_ADJUSTMENTS_DESCRIPTION: "Registre ajustes manuales al inventario.",
  ADD_INVENTORY_ADJUSTMENT: "Nuevo Ajuste",
  EDIT_INVENTORY_ADJUSTMENT: "Editar Ajuste",
  ADJUSTMENT_DATE: "Fecha de Ajuste",
  ADJUSTMENT_TYPE: "Tipo de Ajuste",
  ADJUSTMENT_TYPE_INCREASE: "Aumento",
  ADJUSTMENT_TYPE_DECREASE: "Disminución",
  ADJUSTMENT_TYPE_RECOUNT: "Recuento",
  REASON_GENERAL: "Motivo General",
  QUANTITY_ADJUSTED: "Cantidad Ajustada",
  REASON_PER_ITEM: "Motivo (Artículo)",

  STOCK_TRANSFERS_TITLE: "Traslados de Mercancía",
  MANAGE_STOCK_TRANSFERS_DESCRIPTION: "Gestione traslados de inventario entre sucursales.",
  ADD_STOCK_TRANSFER: "Nuevo Traslado",
  EDIT_STOCK_TRANSFER: "Editar Traslado",
  SOURCE_BRANCH: "Sucursal Origen",
  DESTINATION_BRANCH: "Sucursal Destino",
  TRANSFER_DATE: "Fecha de Traslado",
  EXPECTED_ARRIVAL_DATE: "Fecha Llegada Estimada",
  QUANTITY_TRANSFERRED: "Cantidad Trasladada",

  PRODUCTION_ORDERS_TITLE: "Órdenes de Producción",
  MANAGE_PRODUCTION_ORDERS_DESCRIPTION: "Planifique y registre la producción de artículos.",
  ADD_PRODUCTION_ORDER: "Nueva Orden de Producción",
  EDIT_PRODUCTION_ORDER: "Editar Orden de Producción",
  PRODUCT_TO_PRODUCE: "Producto a Producir",
  QUANTITY_TO_PRODUCE: "Cantidad a Producir",
  PLANNED_START_DATE: "Fecha Inicio Plan.",
  PLANNED_END_DATE: "Fecha Fin Plan.",
  CONSUMED_ITEMS: "Insumos Consumidos",
  QUANTITY_REQUIRED: "Cant. Requerida",
  QUANTITY_CONSUMED: "Cant. Consumida",
  ACTUAL_YIELD: "Producción Real",
};

export const ALL_UNITS = Object.values(UI_TEXT.UNITS);
export const ALL_PRODUCT_CATEGORIES = Object.values(UI_TEXT.PRODUCT_CATEGORIES);
export const ALL_RAW_MATERIAL_CATEGORIES = Object.values(UI_TEXT.RAW_MATERIAL_CATEGORIES);

export const DOCUMENT_STATUS_OPTIONS = {
  DRAFT: { value: 'draft', label: UI_TEXT.DOCUMENT_STATUS_DRAFT },
  ORDERED: { value: 'ordered', label: UI_TEXT.DOCUMENT_STATUS_ORDERED },
  PARTIALLY_RECEIVED: { value: 'partially_received', label: 'Recibido Parcialmente' },
  RECEIVED: { value: 'received', label: UI_TEXT.DOCUMENT_STATUS_RECEIVED },
  CANCELLED: { value: 'cancelled', label: UI_TEXT.DOCUMENT_STATUS_CANCELLED },
  CONFIRMED: { value: 'confirmed', label: UI_TEXT.DOCUMENT_STATUS_CONFIRMED },
  COMPLETED: { value: 'completed', label: UI_TEXT.DOCUMENT_STATUS_COMPLETED },
  PENDING_DISPATCH: { value: 'pending_dispatch', label: UI_TEXT.DOCUMENT_STATUS_PENDING_DISPATCH },
  IN_TRANSIT: { value: 'in_transit', label: UI_TEXT.DOCUMENT_STATUS_IN_TRANSIT },
  PLANNED: { value: 'planned', label: UI_TEXT.DOCUMENT_STATUS_PLANNED },
  IN_PROGRESS: { value: 'in_progress', label: UI_TEXT.DOCUMENT_STATUS_IN_PROGRESS },
};

export const ADJUSTMENT_TYPE_OPTIONS = {
  INCREASE: { value: 'increase', label: UI_TEXT.ADJUSTMENT_TYPE_INCREASE },
  DECREASE: { value: 'decrease', label: UI_TEXT.ADJUSTMENT_TYPE_DECREASE },
  RECOUNT: { value: 'recount', label: UI_TEXT.ADJUSTMENT_TYPE_RECOUNT },
};

// Re-exporting mockBranches here for easier import in POS page if needed for dialog
export const mockBranches: Pick<import('@/types').Branch, 'id' | 'name'>[] = [
  { id: 'b1', name: 'Sucursal Centro' },
  { id: 'b2', name: 'Sucursal Norte' },
  { id: 'b3', name: 'Sucursal Playa' },
];

// Mock Recipes for POS consumption
export const mockRecipesForPOS: Pick<import('@/types').Recipe, 'id' | 'name' | 'producesProductId' | 'ingredients' | 'instructions'| 'yieldQuantity' | 'yieldUnit' | 'preparationTime' | 'cookingTime'>[] = [
 { 
    id: 'r1', 
    name: 'Receta de Concha de Vainilla (Estándar)', 
    producesProductId: '1', // Links to 'Concha de Vainilla' product
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
  },
   { 
    id: 'r_empanada', 
    name: 'Receta de Empanada de Piña', 
    producesProductId: '4', // Links to 'Empanada de Piña'
    yieldQuantity: 10, 
    yieldUnit: UI_TEXT.UNITS.UNIDADES,
    ingredients: [
      { id: 'ing_emp_1', itemId: 'rm1', itemType: 'raw_material', name: 'Harina de Trigo', quantity: 0.4, unit: UI_TEXT.UNITS.KG },
      { id: 'ing_emp_2', itemId: 'rm_mantequilla', itemType: 'raw_material', name: 'Mantequilla', quantity: 0.1, unit: UI_TEXT.UNITS.KG },
      { id: 'ing_emp_3', itemId: 'rm_pina', itemType: 'raw_material', name: 'Relleno de Piña', quantity: 0.3, unit: UI_TEXT.UNITS.KG },
    ],
    instructions: "1. Preparar masa.\n2. Rellenar y sellar.\n3. Hornear hasta dorar.",
    preparationTime: 25,
    cookingTime: 22,
  },
];

// Mock Sales Orders for report generation (can be combined with POS generated ones)
export const mockSalesOrdersForReports: import('@/types').SalesOrder[] = [
 { 
    id: 'so1', 
    documentNumber: 'SO-2024-001', 
    branchId: 'b1', 
    orderDate: new Date(2024, 6, 15).toISOString(), // July 15, 2024
    items: [
      { id: 'item1_so1', productId: 'p1', productName: 'Concha de Vainilla', quantity: 10, unitPrice: 1500 },
      { id: 'item2_so1', productId: 'p2', productName: 'Bolillo', quantity: 20, unitPrice: 500 },
    ],
    status: 'completed',
    totalAmount: 25000, // 10*1500 + 20*500 = 15000 + 10000
    customerName: 'Cliente Ejemplo Uno',
    aiHint: 'sales receipt document'
  },
  { 
    id: 'so2', 
    documentNumber: 'SO-2024-002', 
    branchId: 'b2', 
    orderDate: new Date(2024, 6, 16).toISOString(), // July 16, 2024
    items: [
      { id: 'item1_so2', productId: 'p1', productName: 'Concha de Vainilla', quantity: 5, unitPrice: 1500 },
      { id: 'item2_so2', productId: 'p3', productName: 'Oreja', quantity: 12, unitPrice: 1800 },
    ],
    status: 'completed',
    totalAmount: 29100, // 5*1500 + 12*1800 = 7500 + 21600
    customerName: 'Cliente Ejemplo Dos',
    aiHint: 'sales receipt document'
  },
    { 
    id: 'so3', 
    documentNumber: 'SO-2024-003', 
    branchId: 'b1', 
    orderDate: new Date(2024, 6, 20).toISOString(), // July 20, 2024
    items: [
      { id: 'item1_so3', productId: 'p4', productName: 'Empanada de Piña', quantity: 15, unitPrice: 2000 },
    ],
    status: 'completed',
    totalAmount: 30000,
    customerName: 'Cliente Ejemplo Tres',
    aiHint: 'sales receipt document'
  },
];

    