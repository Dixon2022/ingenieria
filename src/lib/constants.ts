export const APP_NAME = "AmorPOS";
export const BAKERY_NAME = "Panadería Amores";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  POS: "/pos",
  INVENTORY: "/inventory",
  REPORTS: "/reports",
};

export const UI_TEXT = {
  LOGIN_TITLE: "Iniciar Sesión",
  LOGIN_BUTTON: "Ingresar",
  LOGOUT_BUTTON: "Cerrar Sesión",
  USERNAME_LABEL: "Usuario",
  PASSWORD_LABEL: "Contraseña",
  POS_TITLE: "Punto de Venta",
  INVENTORY_TITLE: "Inventario",
  REPORTS_TITLE: "Reportes de Ventas",
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
  SALES_DATA_LABEL: "Datos de Ventas (JSON)",
  SALES_DATA_PLACEHOLDER: `{
  "ventas": [
    {"item": "Concha de Vainilla", "cantidadVendida": 50},
    {"item": "Bolillo", "cantidadVendida": 120}
  ],
  "inventarioActual": [
    {"item": "Concha de Vainilla", "stock": 20},
    {"item": "Bolillo", "stock": 10}
  ]
}`,
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
  },
  UNITS: {
    UNIDADES: "unidades",
    KG: "kg",
    LITROS: "litros",
  },
  VIEW_DETAILS: "Ver detalles",
  INVENTORY_ADVICE: "Consejos de Inventario por IA",
  SALES_REPORT_DESCRIPTION: "Ingrese los datos de ventas en formato JSON para obtener un análisis y recomendaciones de inventario.",
};
