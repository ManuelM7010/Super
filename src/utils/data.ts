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
export const DEFAULT_HISTORICAL_PURCHASES: CompraHistorica[] = [];

// Seed active list (current draft list for the supermarket run)
export const DEFAULT_ACTIVE_LIST_SEED: Articulo[] = [];

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
