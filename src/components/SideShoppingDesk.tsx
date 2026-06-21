/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Articulo, CompraHistorica, Categoria, Tienda } from '../types';
import { COMMOM_ITEMS_DB, CommonItem } from '../utils/data';
import { 
  Search, 
  Plus, 
  Trash2, 
  History, 
  Layers, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  PlusCircle, 
  ChevronRight, 
  ChevronDown,
  Info,
  Tag
} from 'lucide-react';

interface SideShoppingDeskProps {
  activeList: Articulo[];
  setActiveList: (list: Articulo[]) => void;
  history: CompraHistorica[];
  categories: Categoria[];
  stores: Tienda[];
}

export default function SideShoppingDesk({
  activeList,
  setActiveList,
  history,
  categories,
  stores,
}: SideShoppingDeskProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'despensa');
  const [customPrice, setCustomPrice] = useState('2.50');
  const [customName, setCustomName] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isAddingManually, setIsAddingManually] = useState(false);

  // Auto-calculate the planned estimate of the active list
  const activeListEstimate = activeList.reduce((sum, item) => sum + (item.cantidadPlanificada * item.precioEstimadoUnitario), 0);

  // Filter common items suggestions based on search query
  const filteredSuggestions = COMMOM_ITEMS_DB.filter(item => {
    if (!searchQuery) return false;
    return item.nombre.toLowerCase().includes(searchQuery.toLowerCase());
  }).slice(0, 5);

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.nombre || 'Despensa';
  };

  const getStoreName = (id: string) => {
    return stores.find(s => s.id === id)?.nombre || 'Supermercado';
  };

  // Add item helper
  const handleAddItem = (name: string, catId: string, price: number) => {
    const existingIndex = activeList.findIndex(item => item.nombre.toLowerCase() === name.toLowerCase());

    if (existingIndex > -1) {
      const updated = [...activeList];
      updated[existingIndex].cantidadPlanificada += 1;
      setActiveList(updated);
    } else {
      const newItem: Articulo = {
        id: 'act_' + Math.random().toString(36).substring(2, 9),
        nombre: name,
        categoriaId: catId,
        cantidadPlanificada: 1,
        precioEstimadoUnitario: price,
        cantidadRealComprada: 1,
        precioRealEstante: price,
        estado: 'pendiente',
        esArticuloExtra: false
      };
      setActiveList([...activeList, newItem]);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customName.trim();
    const price = parseFloat(customPrice);
    if (name && !isNaN(price)) {
      handleAddItem(name, selectedCategory, price);
      setCustomName('');
      setSearchQuery('');
      setIsAddingManually(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    setActiveList(activeList.filter(item => item.id !== id));
  };

  const handleUpdateQty = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setActiveList(activeList.map(item => item.id === id ? {
      ...item,
      cantidadPlanificada: newQty,
      cantidadRealComprada: newQty
    } : item));
  };

  const handleUpdatePrice = (id: string, newPrice: number) => {
    if (newPrice < 0) return;
    setActiveList(activeList.map(item => item.id === id ? {
      ...item,
      precioEstimadoUnitario: newPrice,
      precioRealEstante: newPrice
    } : item));
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro de que deseas limpiar la lista activa actual?')) {
      setActiveList([]);
    }
  };

  // Clone/Merge mechanics
  const handleClonePurchase = (historica: CompraHistorica) => {
    const clonedArticles = historica.articulos.map((item, index) => ({
      ...item,
      id: 'clone_' + index + '_' + Math.random().toString(36).substring(2, 5),
      estado: 'pendiente' as const,
      esArticuloExtra: false,
      cantidadRealComprada: item.cantidadPlanificada,
      precioRealEstante: item.precioEstimadoUnitario
    }));
    setActiveList(clonedArticles);
    setShowHistoryModal(false);
  };

  const handleMergePurchase = (historica: CompraHistorica) => {
    const merged = [...activeList];
    
    historica.articulos.forEach(histItem => {
      const existingIdx = merged.findIndex(actItem => actItem.nombre.toLowerCase() === histItem.nombre.toLowerCase());
      if (existingIdx > -1) {
        merged[existingIdx].cantidadPlanificada = Math.max(merged[existingIdx].cantidadPlanificada, histItem.cantidadPlanificada);
        merged[existingIdx].cantidadRealComprada = merged[existingIdx].cantidadPlanificada;
      } else {
        merged.push({
          ...histItem,
          id: 'merged_' + Math.random().toString(36).substring(2, 7),
          estado: 'pendiente',
          esArticuloExtra: false,
          cantidadRealComprada: histItem.cantidadPlanificada,
          precioRealEstante: histItem.precioEstimadoUnitario
        });
      }
    });

    setActiveList(merged);
    setShowHistoryModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4.5 space-y-4 shadow-xl">
      
      {/* Mini Title Widget */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-selectos-yellow animate-pulse" />
          <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-selectos-cyan" />
            <span>Mi Carretilla</span>
          </h3>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-bold">
            {activeList.length} ítems
          </span>
        </div>
        
        <button 
          onClick={() => setShowHistoryModal(true)}
          className="text-[10px] text-selectos-cyan hover:text-white flex items-center space-x-1 font-extrabold uppercase transition"
          title="Ver compras pasadas para duplicarlas"
        >
          <History className="w-3.5 h-3.5" />
          <span>Historial</span>
        </button>
      </div>

      {/* Súper Selectos Quick Search Autocomplete */}
      <div className="relative">
        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">Buscador Veloz de Productos</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar leche, frijol rojo, pan, huevo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-250 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-selectos-cyan"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-2.5 pointer-events-none" />
        </div>

        {/* Suggestion dropdown matches */}
        <AnimatePresence>
          {filteredSuggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute z-30 left-0 right-0 mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 divide-y divide-slate-900"
            >
              {filteredSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleAddItem(item.nombre, item.categoriaId, item.precioSugerido);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2 hover:bg-selectos-blue/15 text-xs text-slate-350 flex justify-between items-center transition rounded-lg"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-selectos-green rounded-full shrink-0" />
                    <span className="truncate max-w-[170px] font-medium text-slate-250">{item.nombre}</span>
                  </div>
                  <span className="text-[10px] text-selectos-yellow font-black font-mono">
                    +${item.precioSugerido.toFixed(2)}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle button to expand/collapse custom product inputs */}
      <div className="border-t border-slate-800/60 pt-3">
        <button
          onClick={() => setIsAddingManually(!isAddingManually)}
          className="w-full bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-200 transition flex items-center justify-between"
        >
          <span className="flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-selectos-cyan" />
            <span>¿Producto personalizado o no listado?</span>
          </span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isAddingManually ? 'rotate-90' : ''}`} />
        </button>

        {/* Custom manual add form */}
        <AnimatePresence>
          {isAddingManually && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddCustomItem}
              className="overflow-hidden mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2.5"
            >
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nombre del artículo (ej. Café Listo)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-selectos-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] block text-slate-400 font-bold uppercase mb-1">Precio (USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-selectos-cyan"
                  />
                </div>
                <div>
                  <label className="text-[9px] block text-slate-400 font-bold uppercase mb-1">Categoría:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-selectos-cyan"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-selectos-blue hover:bg-blue-600 text-white font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition flex items-center justify-center gap-1 shadow"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Agregar Artículo</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Rendered active articles list */}
      <div className="border-t border-slate-800 pt-3 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Artículo</span>
          <span>Precio / Cantidad</span>
        </div>

        {activeList.length === 0 ? (
          <div className="py-6 text-center text-slate-500 space-y-1 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
            <ShoppingBag className="w-6 h-6 mx-auto opacity-35" />
            <p className="text-[10px] font-semibold text-slate-400">Carretilla vacía</p>
            <p className="text-[9px] text-slate-500 px-3">Agrega artículos con el buscador veloz de arriba para iniciar la simulación.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {activeList.map((item) => {
              const category = categories.find(c => c.id === item.categoriaId);
              return (
                <div 
                  key={item.id} 
                  className={`p-2 bg-slate-950/60 rounded-xl border transition-all ${item.estado === 'en_carrito' ? 'border-selectos-green/30 bg-selectos-green/5' : 'border-slate-800 hover:border-slate-750'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-200 truncate leading-tight" title={item.nombre}>
                        {item.nombre}
                      </p>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5 truncate uppercase tracking-wider">
                        {category?.nombre || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      
                      {/* Inline estimation price input field */}
                      <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5">
                        <span className="text-[10px] text-slate-500 font-bold mr-0.5">$</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0.01"
                          value={item.precioEstimadoUnitario}
                          onChange={(e) => handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
                          className="w-10 text-[10px] bg-transparent text-slate-300 font-semibold focus:outline-none font-mono text-right"
                          title="Haz clic para ajustar precio unitario estimado"
                        />
                      </div>

                      {/* Quantity selector clickers */}
                      <div className="flex items-center bg-slate-850 rounded overflow-hidden border border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, item.cantidadPlanificada - 1)}
                          className="px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-720 hover:text-white transition"
                        >
                          -
                        </button>
                        <span className="px-1.5 text-[10px] font-black text-slate-200 font-mono">
                          {item.cantidadPlanificada}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, item.cantidadPlanificada + 1)}
                          className="px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-720 hover:text-white transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Delete button option */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded transition"
                        title="Eliminar artículo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sticky calculations details Inside the panel */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimación Carretilla:</span>
          <span className="text-sm font-black text-selectos-yellow">
            ${activeListEstimate.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </span>
        </div>

        {activeListEstimate > 0 && (
          <div className="flex items-center gap-1 text-[9px] bg-selectos-blue/15 text-selectos-cyan p-1.5 rounded-lg">
            <Tag className="w-3.5 h-3.5 shrink-0 text-selectos-yellow animate-pulse" />
            <span className="leading-tight">
              ¡Paga con tarjeta de afiliado o TDC BAC para un ahorro extra inmediato de <strong>${(activeListEstimate * 0.07).toFixed(2)} USD!</strong>
            </span>
          </div>
        )}
      </div>

      {/* Reset carretilla option button if there fits any */}
      {activeList.length > 0 && (
        <button
          onClick={handleClearAll}
          className="w-full py-2 border border-rose-950 text-rose-450 hover:bg-rose-950/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition"
        >
          Vaciar Todo el Pedido
        </button>
      )}

      {/* PRE-COMPRAS HISTORICAL CLONE / MERGE LIST SELECTION MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-selectos-navy border-b border-selectos-blue flex justify-between items-center">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4.5 h-4.5 text-selectos-yellow" />
                <span>Cargar desde Compras Pasadas</span>
              </h4>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-slate-400 hover:text-white font-extrabold"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 flex-1 max-h-[55vh]">
              <p className="text-xs text-slate-400 leading-relaxed">
                Elige un ticket de compra anterior realizado en El Salvador para cargar sus productos directamente. Puedes <strong>reemplazar</strong> la carretilla actual o <strong>fusionarla</strong>.
              </p>

              {history.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Aún no cuentas con registros históricos guardados. Completa un pago en "Optimizar Pago" para que se archiven aquí.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((h, idx) => {
                    const store = stores.find(s => s.id === h.tiendaId);
                    return (
                      <div key={h.id || idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-200">{store?.nombre || 'Supermercado'}</p>
                            <p className="text-[10px] text-slate-500 font-mono">Fecha: {h.fecha} • {h.articulos.length} ítems</p>
                          </div>
                          <span className="text-xs font-black text-selectos-yellow font-mono">
                            ${h.precioFinalPagado.toFixed(2)} USD
                          </span>
                        </div>

                        {/* List previews */}
                        <div className="text-[10px] text-slate-400 truncate max-w-full">
                          <span className="font-bold">Ítems:</span> {h.articulos.map(a => `${a.cantidadPlanificada}x ${a.nombre}`).join(', ')}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1 border-t border-slate-900">
                          <button
                            onClick={() => handleClonePurchase(h)}
                            className="flex-1 bg-selectos-blue hover:bg-blue-600 text-white font-extrabold text-[9px] py-1.5 rounded uppercase tracking-wider transition"
                          >
                            Reemplazar Carretilla
                          </button>
                          <button
                            onClick={() => handleMergePurchase(h)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-[9px] py-1.5 rounded uppercase tracking-wider transition"
                          >
                            Fusionar Productos
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 text-center border-t border-slate-800/60">
              <span className="text-[10px] text-slate-500 italic block">
                Los precios unitarios se adaptarán según el ticket histórico seleccionado.
              </span>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
