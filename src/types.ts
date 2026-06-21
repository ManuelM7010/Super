/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tienda {
  id: string;
  nombre: string;
  color: string; // Tailwind color name (e.g., 'emerald', 'sky')
  presupuestoMensual: number;
  metodoPagoSugerido: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string; // Lucide icon name
  limiteGastoSugerido: number;
}

export interface Articulo {
  id: string;
  nombre: string;
  categoriaId: string;
  cantidadPlanificada: number;
  precioEstimadoUnitario: number;
  cantidadRealComprada: number;
  precioRealEstante: number;
  estado: 'pendiente' | 'en_carrito' | 'no_disponible';
  esArticuloExtra: boolean;
}

export interface CompraHistorica {
  id: string;
  fecha: string; // YYYY-MM-DD
  tiendaId: string;
  articulos: Articulo[];
  precioFinalPagado: number;
  metodoPagoUtilizado: string; // How it was actually paid or splits
}

export interface MetodoPago {
  id: string;
  nombre: string;
  tipo: 'vales' | 'tdc' | 'efectivo' | 'debito';
  color: string;
  descripcion: string;
}
