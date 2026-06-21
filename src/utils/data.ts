/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tienda, Categoria, Articulo, CompraHistorica, MetodoPago } from '../types';

// Seed initial common item database for quick searches
export interface CommonItem {
  nombre: string;
  categoriaId: string;
  precioSugerido: number;
}

export const COMMOM_ITEMS_DB: CommonItem[] = [
  { nombre: "Leche Entera 1L Salud", categoriaId: "despensa", precioSugerido: 1.65 },
  { nombre: "Pan de Caja Integral 600g Bimbo", categoriaId: "despensa", precioSugerido: 2.85 },
  { nombre: "Huevo Blanco 30 piezas (Cartón)", categoriaId: "frescos", precioSugerido: 4.90 },
  { nombre: "Pechuga de Pollo 1Kg", categoriaId: "frescos", precioSugerido: 5.80 },
  { nombre: "Manzana Gala 1Kg", categoriaId: "frescos", precioSugerido: 3.50 },
  { nombre: "Mano de Guineos Seda", categoriaId: "frescos", precioSugerido: 1.25 },
  { nombre: "Arroz Súper Extra 1Kg", categoriaId: "despensa", precioSugerido: 1.40 },
  { nombre: "Frijol Rojo Seda 1Kg", categoriaId: "despensa", precioSugerido: 2.40 },
  { nombre: "Detergente Líquido Maxx 3L", categoriaId: "limpieza", precioSugerido: 8.50 },
  { nombre: "Papel Higiénico 12 rollos", categoriaId: "limpieza", precioSugerido: 4.50 },
  { nombre: "Shampoo Anticaspa 400ml", categoriaId: "belleza", precioSugerido: 4.20 },
  { nombre: "Jabón de Barra Humectante", categoriaId: "belleza", precioSugerido: 1.10 },
  { nombre: "Alimento para Gato Adulto 2Kg", categoriaId: "mascotas", precioSugerido: 9.50 },
  { nombre: "Croquetas Perro Adulto 4Kg", categoriaId: "mascotas", precioSugerido: 14.00 },
  { nombre: "Refresco de Cola 2L", categoriaId: "bebidas", precioSugerido: 2.10 },
  { nombre: "Agua Mineral Gasificada 1.5L", categoriaId: "bebidas", precioSugerido: 1.20 },
  { nombre: "Aceite de Cocina de Soya 1L", categoriaId: "despensa", precioSugerido: 2.90 },
  { nombre: "Pasta Dental Triple Acción", categoriaId: "belleza", precioSugerido: 1.95 }
];

// Initial Categories Seed - Budgets in USD
export const DEFAULT_CATEGORIES: Categoria[] = [
  { id: "despensa", nombre: "Despensa General", icono: "ShoppingBag", limiteGastoSugerido: 130 },
  { id: "frescos", nombre: "Carnes & Frescos", icono: "Apple", limiteGastoSugerido: 150 },
  { id: "limpieza", nombre: "Limpieza del Hogar", icono: "Sparkles", limiteGastoSugerido: 60 },
  { id: "belleza", nombre: "Cuidado Personal", icono: "Heart", limiteGastoSugerido: 40 },
  { id: "mascotas", nombre: "Mascotas", icono: "PawPrint", limiteGastoSugerido: 50 },
  { id: "bebidas", nombre: "Bebidas", icono: "CupSoda", limiteGastoSugerido: 30 }
];

// Initial Stores Seed - El Salvador Context
export const DEFAULT_STORES: Tienda[] = [
  { id: "selectos", nombre: "Súper Nacional", color: "blue", presupuestoMensual: 220, metodoPagoSugerido: "TDC BAC Súper (7% Desc)" },
  { id: "despensa_juan", nombre: "La Despensa de Don Juan", color: "purple", presupuestoMensual: 130, metodoPagoSugerido: "Vales de Despensa" },
  { id: "pricesmart", nombre: "PriceSmart Club", color: "emerald", presupuestoMensual: 150, metodoPagoSugerido: "TDC PriceSmart BAC" },
  { id: "despensa_familiar", nombre: "Despensa Familiar", color: "amber", presupuestoMensual: 100, metodoPagoSugerido: "Efectivo / Chivo Wallet" }
];

// Initial Payment Methods seed - Salvadoran wallet/cards
export const DEFAULT_PAYMENTS: MetodoPago[] = [
  { id: "vales", nombre: "Vales de Despensa", tipo: "vales", color: "bg-emerald-500", descripcion: "Canjeable directamente en cajas de supermercados" },
  { id: "tdc", nombre: "TDC BAC Súper (7% Desc o Cashback)", tipo: "tdc", color: "bg-fuchsia-600", descripcion: "Ofrece descuentos inmediatos los días afiliados en supermercados locales" },
  { id: "efectivo", nombre: "Efectivo / Chivo Wallet (USD)", tipo: "efectivo", color: "bg-slate-500", descripcion: "Moneda de curso legal directa o billetera estatal con transacciones instantáneas" }
];

// Seeding historic purchases representing realistic price variations in USD
export const DEFAULT_HISTORICAL_PURCHASES: CompraHistorica[] = [
  // --- MARZO 2026 ---
  {
    id: "h_mar_wallet",
    fecha: "2026-03-10",
    tiendaId: "selectos",
    precioFinalPagado: 22.80,
    metodoPagoUtilizado: "TDC BAC Súper (7% Desc o Cashback)",
    articulos: [
      { id: "m1", nombre: "Leche Entera 1L Salud", categoriaId: "despensa", cantidadPlanificada: 4, precioEstimadoUnitario: 1.50, cantidadRealComprada: 4, precioRealEstante: 1.50, estado: "en_carrito", esArticuloExtra: false },
      { id: "m2", nombre: "Huevo Blanco 30 piezas (Cartón)", categoriaId: "frescos", cantidadPlanificada: 1, precioEstimadoUnitario: 4.20, cantidadRealComprada: 1, precioRealEstante: 4.20, estado: "en_carrito", esArticuloExtra: false },
      { id: "m3", nombre: "Pan de Caja Integral 600g Bimbo", categoriaId: "despensa", cantidadPlanificada: 1, precioEstimadoUnitario: 2.60, cantidadRealComprada: 1, precioRealEstante: 2.60, estado: "en_carrito", esArticuloExtra: false },
      { id: "m4", nombre: "Pechuga de Pollo 1Kg", categoriaId: "frescos", cantidadPlanificada: 1.5, precioEstimadoUnitario: 5.20, cantidadRealComprada: 1.5, precioRealEstante: 5.20, estado: "en_carrito", esArticuloExtra: false },
      { id: "m5", nombre: "Refresco de Cola 2L", categoriaId: "bebidas", cantidadPlanificada: 2, precioEstimadoUnitario: 1.90, cantidadRealComprada: 2, precioRealEstante: 1.90, estado: "en_carrito", esArticuloExtra: true }
    ]
  },
  // --- ABRIL 2026 ---
  {
    id: "h_abr_wallet",
    fecha: "2026-04-12",
    tiendaId: "selectos",
    precioFinalPagado: 24.15,
    metodoPagoUtilizado: "TDC BAC Súper (7% Desc o Cashback)",
    articulos: [
      { id: "a1", nombre: "Leche Entera 1L Salud", categoriaId: "despensa", cantidadPlanificada: 4, precioEstimadoUnitario: 1.50, cantidadRealComprada: 4, precioRealEstante: 1.55, estado: "en_carrito", esArticuloExtra: false },
      { id: "a2", nombre: "Huevo Blanco 30 piezas (Cartón)", categoriaId: "frescos", cantidadPlanificada: 1, precioEstimadoUnitario: 4.20, cantidadRealComprada: 1, precioRealEstante: 4.40, estado: "en_carrito", esArticuloExtra: false },
      { id: "a3", nombre: "Pan de Caja Integral 600g Bimbo", categoriaId: "despensa", cantidadPlanificada: 1, precioEstimadoUnitario: 2.60, cantidadRealComprada: 1, precioRealEstante: 2.70, estado: "en_carrito", esArticuloExtra: false },
      { id: "a4", nombre: "Pechuga de Pollo 1Kg", categoriaId: "frescos", cantidadPlanificada: 1.5, precioEstimadoUnitario: 5.20, cantidadRealComprada: 1.5, precioRealEstante: 5.40, estado: "en_carrito", esArticuloExtra: false },
      { id: "a5", nombre: "Refresco de Cola 2L", categoriaId: "bebidas", cantidadPlanificada: 2, precioEstimadoUnitario: 1.90, cantidadRealComprada: 2, precioRealEstante: 2.05, estado: "en_carrito", esArticuloExtra: true }
    ]
  },
  // --- MAYO 2026 ---
  {
    id: "h_may_wallet",
    fecha: "2026-05-15",
    tiendaId: "selectos",
    precioFinalPagado: 25.55,
    metodoPagoUtilizado: "Vales de Despensa",
    articulos: [
      { id: "my1", nombre: "Leche Entera 1L Salud", categoriaId: "despensa", cantidadPlanificada: 4, precioEstimadoUnitario: 1.55, cantidadRealComprada: 4, precioRealEstante: 1.60, estado: "en_carrito", esArticuloExtra: false },
      { id: "my2", nombre: "Huevo Blanco 30 piezas (Cartón)", categoriaId: "frescos", cantidadPlanificada: 1, precioEstimadoUnitario: 4.40, cantidadRealComprada: 1, precioRealEstante: 4.75, estado: "en_carrito", esArticuloExtra: false },
      { id: "my3", nombre: "Pan de Caja Integral 600g Bimbo", categoriaId: "despensa", cantidadPlanificada: 1, precioEstimadoUnitario: 2.70, cantidadRealComprada: 1, precioRealEstante: 2.80, estado: "en_carrito", esArticuloExtra: false },
      { id: "my4", nombre: "Pechuga de Pollo 1Kg", categoriaId: "frescos", cantidadPlanificada: 1.5, precioEstimadoUnitario: 5.40, cantidadRealComprada: 1.5, precioRealEstante: 5.60, estado: "en_carrito", esArticuloExtra: false },
      { id: "my5", nombre: "Refresco de Cola 2L", categoriaId: "bebidas", cantidadPlanificada: 2, precioEstimadoUnitario: 2.05, cantidadRealComprada: 2, precioRealEstante: 2.10, estado: "en_carrito", esArticuloExtra: true }
    ]
  },
  // La Despensa de Don Juan
  {
    id: "h_may_city",
    fecha: "2026-05-20",
    tiendaId: "despensa_juan",
    precioFinalPagado: 28.10,
    metodoPagoUtilizado: "Vales de Despensa",
    articulos: [
      { id: "mc1", nombre: "Leche Entera 1L Salud", categoriaId: "despensa", cantidadPlanificada: 4, precioEstimadoUnitario: 1.60, cantidadRealComprada: 4, precioRealEstante: 1.75, estado: "en_carrito", esArticuloExtra: false },
      { id: "mc2", nombre: "Huevo Blanco 30 piezas (Cartón)", categoriaId: "frescos", cantidadPlanificada: 1, precioEstimadoUnitario: 4.75, cantidadRealComprada: 1, precioRealEstante: 5.15, estado: "en_carrito", esArticuloExtra: false },
      { id: "mc3", nombre: "Pan de Caja Integral 600g Bimbo", categoriaId: "despensa", cantidadPlanificada: 1, precioEstimadoUnitario: 2.80, cantidadRealComprada: 1, precioRealEstante: 3.10, estado: "en_carrito", esArticuloExtra: false },
      { id: "mc4", nombre: "Pechuga de Pollo 1Kg", categoriaId: "frescos", cantidadPlanificada: 1.5, precioEstimadoUnitario: 5.60, cantidadRealComprada: 1.5, precioRealEstante: 6.00, estado: "en_carrito", esArticuloExtra: false },
      { id: "mc5", nombre: "Refresco de Cola 2L", categoriaId: "bebidas", cantidadPlanificada: 2, precioEstimadoUnitario: 2.10, cantidadRealComprada: 2, precioRealEstante: 2.30, estado: "en_carrito", esArticuloExtra: false }
    ]
  },
  // PriceSmart club compras por volumen
  {
    id: "h_may_costco",
    fecha: "2026-05-28",
    tiendaId: "pricesmart",
    precioFinalPagado: 60.50,
    metodoPagoUtilizado: "TDC PriceSmart BAC",
    articulos: [
      { id: "cc1", nombre: "Croquetas Perro Adulto 4Kg", categoriaId: "mascotas", cantidadPlanificada: 2, precioEstimadoUnitario: 13.50, cantidadRealComprada: 2, precioRealEstante: 13.50, estado: "en_carrito", esArticuloExtra: false },
      { id: "cc2", nombre: "Detergente Líquido Maxx 3L", categoriaId: "limpieza", cantidadPlanificada: 2, precioEstimadoUnitario: 8.00, cantidadRealComprada: 2, precioRealEstante: 8.00, estado: "en_carrito", esArticuloExtra: false },
      { id: "cc3", nombre: "Papel Higiénico 12 rollos", categoriaId: "limpieza", cantidadPlanificada: 5, precioEstimadoUnitario: 3.80, cantidadRealComprada: 5, precioRealEstante: 3.50, estado: "en_carrito", esArticuloExtra: false }
    ]
  },
  // Despensa Familiar (precios súper bajos para comparar)
  {
    id: "h_may_aurrera",
    fecha: "2026-05-30",
    tiendaId: "despensa_familiar",
    precioFinalPagado: 21.65,
    metodoPagoUtilizado: "Efectivo / Chivo Wallet (USD)",
    articulos: [
      { id: "au1", nombre: "Leche Entera 1L Salud", categoriaId: "despensa", cantidadPlanificada: 4, precioEstimadoUnitario: 1.50, cantidadRealComprada: 4, precioRealEstante: 1.45, estado: "en_carrito", esArticuloExtra: false },
      { id: "au2", nombre: "Huevo Blanco 30 piezas (Cartón)", categoriaId: "frescos", cantidadPlanificada: 1, precioEstimadoUnitario: 4.10, cantidadRealComprada: 1, precioRealEstante: 4.10, estado: "en_carrito", esArticuloExtra: false },
      { id: "au3", nombre: "Pan de Caja Integral 600g Bimbo", categoriaId: "despensa", cantidadPlanificada: 1, precioEstimadoUnitario: 2.50, cantidadRealComprada: 1, precioRealEstante: 2.40, estado: "en_carrito", esArticuloExtra: false },
      { id: "au4", nombre: "Pechuga de Pollo 1Kg", categoriaId: "frescos", cantidadPlanificada: 1.5, precioEstimadoUnitario: 5.10, cantidadRealComprada: 1.5, precioRealEstante: 4.90, estado: "en_carrito", esArticuloExtra: false },
      { id: "au5", nombre: "Refresco de Cola 2L", categoriaId: "bebidas", cantidadPlanificada: 2, precioEstimadoUnitario: 2.00, cantidadRealComprada: 2, precioRealEstante: 2.10, estado: "en_carrito", esArticuloExtra: false }
    ]
  }
];

// Seed active list (current draft list for the supermarket run)
export const DEFAULT_ACTIVE_LIST_SEED: Articulo[] = [
  { id: "act1", nombre: "Leche Entera 1L Salud", categoriaId: "despensa", cantidadPlanificada: 4, precioEstimadoUnitario: 1.65, cantidadRealComprada: 4, precioRealEstante: 1.65, estado: "pendiente", esArticuloExtra: false },
  { id: "act2", nombre: "Huevo Blanco 30 piezas (Cartón)", categoriaId: "frescos", cantidadPlanificada: 1, precioEstimadoUnitario: 4.90, cantidadRealComprada: 1, precioRealEstante: 4.90, estado: "pendiente", esArticuloExtra: false },
  { id: "act3", nombre: "Pan de Caja Integral 600g Bimbo", categoriaId: "despensa", cantidadPlanificada: 1, precioEstimadoUnitario: 2.85, cantidadRealComprada: 1, precioRealEstante: 2.85, estado: "pendiente", esArticuloExtra: false },
  { id: "act4", nombre: "Detergente Líquido Maxx 3L", categoriaId: "limpieza", cantidadPlanificada: 1, precioEstimadoUnitario: 8.50, cantidadRealComprada: 1, precioRealEstante: 8.50, estado: "en_carrito", esArticuloExtra: false },
];

export const STORAGE_KEYS = {
  STORES: 'super_tiendas_v1',
  CATEGORIES: 'super_categorias_v1',
  PAYMENTS: 'super_pagos_v1',
  HISTORY: 'super_historial_v1',
  ACTIVE_LIST: 'super_lista_activa_v1',
  ACTIVE_STORE: 'super_tienda_activa_v1',
  BUDGET_GLOBAL: 'super_presupuesto_global_v1'
};

// Generic Local Storage API helpers
export const loadData = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    console.error(`Error parsing key ${key}`, e);
    return defaultValue;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Loader initializers
export const getStores = (): Tienda[] => loadData<Tienda[]>(STORAGE_KEYS.STORES, DEFAULT_STORES);
export const saveStores = (stores: Tienda[]): void => saveData(STORAGE_KEYS.STORES, stores);

export const getCategories = (): Categoria[] => loadData<Categoria[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
export const saveCategories = (categories: Categoria[]): void => saveData(STORAGE_KEYS.CATEGORIES, categories);

export const getPayments = (): MetodoPago[] => loadData<MetodoPago[]>(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
export const savePayments = (payments: MetodoPago[]): void => saveData(STORAGE_KEYS.PAYMENTS, payments);

export const getHistory = (): CompraHistorica[] => loadData<CompraHistorica[]>(STORAGE_KEYS.HISTORY, DEFAULT_HISTORICAL_PURCHASES);
export const saveHistory = (history: CompraHistorica[]): void => saveData(STORAGE_KEYS.HISTORY, history);

export const getActiveList = (): Articulo[] => loadData<Articulo[]>(STORAGE_KEYS.ACTIVE_LIST, DEFAULT_ACTIVE_LIST_SEED);
export const saveActiveList = (list: Articulo[]): void => saveData(STORAGE_KEYS.ACTIVE_LIST, list);

export const getActiveStoreId = (): string => loadData<string>(STORAGE_KEYS.ACTIVE_STORE, "selectos");
export const saveActiveStoreId = (id: string): void => saveData(STORAGE_KEYS.ACTIVE_STORE, id);

export const getMonthlyBudgetGlobal = (): number => loadData<number>(STORAGE_KEYS.BUDGET_GLOBAL, 500); // Dólares Estadounidenses (USD)
export const saveMonthlyBudgetGlobal = (budget: number): void => saveData(STORAGE_KEYS.BUDGET_GLOBAL, budget);
