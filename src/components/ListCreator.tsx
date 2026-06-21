/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Articulo, CompraHistorica, Categoria, Tienda } from '../types';
import { COMMOM_ITEMS_DB, CommonItem } from '../utils/data';
import { Search, Plus, Trash2, Copy, History, HelpCircle, PlusCircle, Sparkles, RefreshCw, Layers, ShoppingBag } from 'lucide-react';

interface ListCreatorProps {
  activeList: Articulo[];
  setActiveList: (list: Articulo[]) => void;
  history: CompraHistorica[];
  categories: Categoria[];
  stores: Tienda[];
}

export default function ListCreator({
  activeList,
  setActiveList,
  history,
  categories,
  stores,
}: ListCreatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || "despensa");
  const [customPrice, setCustomPrice] = useState('35');
  const [customName, setCustomName] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Auto-calculate the planned estimate of the active list
  const activeListEstimate = activeList.reduce((sum, item) => sum + (item.cantidadPlanificada * item.precioEstimadoUnitario), 0);

  // Filter common items suggestions based on search query
  const filteredSuggestions = COMMOM_ITEMS_DB.filter(item => {
    if (!searchQuery) return false;
    return item.nombre.toLowerCase().includes(searchQuery.toLowerCase());
  }).slice(0, 5);

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.nombre || "Despensa";
  };

  const getStoreName = (id: string) => {
    return stores.find(s => s.id === id)?.nombre || "Supermercado";
  };

  // Add item helper
  const handleAddItem = (name: string, catId: string, price: number) => {
    // Check if it already exists, if so, increase planned quantity
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

  // --- Clone and Merge mechanics ---
  const handleClonePurchase = (historica: CompraHistorica) => {
    // Clone logic: completely replace active list with products from previous purchase
    const clonedArticles = historica.articulos.map((item, index) => ({
      ...item,
      id: 'clone_' + index + '_' + Math.random().toString(36).substring(2, 5),
      estado: 'pendiente' as const, // reset state back to plan
      esArticuloExtra: false, // reset impulso state back
      cantidadRealComprada: item.cantidadPlanificada,
      precioRealEstante: item.precioEstimadoUnitario
    }));
    setActiveList(clonedArticles);
    setShowHistoryModal(false);
  };

  const handleMergePurchase = (historica: CompraHistorica) => {
    // Merge logic: Combine item list. If duplicate name, keep max quantity. If new, add it.
    const merged = [...activeList];
    
    historica.articulos.forEach(histItem => {
      const existingIdx = merged.findIndex(actItem => actItem.nombre.toLowerCase() === histItem.nombre.toLowerCase());
      if (existingIdx > -1) {
        // Exists, so we ensure the planned quantity is at least the past template one
        merged[existingIdx].cantidadPlanificada = Math.max(merged[existingIdx].cantidadPlanificada, histItem.cantidadPlanificada);
        merged[existingIdx].cantidadRealComprada = merged[existingIdx].cantidadPlanificada;
      } else {
        // New item to list
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
    <div className="space-y-6">
      
      {/* Header Utilities */}
      <div id="list-actions-bar" className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-800/50 p-4 border border-slate-700/50 rounded-2xl gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <PlusCircle className="text-emerald-400 w-5 h-5" />
            <span>Creador & Planificador de Compras</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Agrega básicos de canasta o fusiona de forma inteligente de pasados tickets.
          </p>
        </div>

        {/* History actions buttons */}
        <div className="flex space-x-2.5 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>Clonar / Fusionar Historial</span>
          </button>
          
          {activeList.length > 0 && (
            <button 
              type="button"
              onClick={handleClearAll}
              className="flex-none px-3 py-2.5 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/20 hover:bg-rose-600 rounded-xl transition"
            >
              Vaciar Lista
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Search & Custom Product Input */}
        <div className="space-y-4">
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-md font-bold text-slate-200">Buscador Veloz de Básicos</h3>
            
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Busca Leche, Huevo, Pan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
              />
            </div>

            {/* Auto Suggestions list */}
            {searchQuery && (
              <div className="space-y-1.5 bg-slate-900/50 border border-slate-800 rounded-xl p-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 px-1 font-semibold">Sugerencias encontradas</p>
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleAddItem(item.nombre, item.categoriaId, item.precioSugerido);
                        setSearchQuery('');
                      }}
                      className="w-full flex justify-between items-center px-2 py-1.5 hover:bg-slate-850 rounded-lg text-xs text-left group transition-colors"
                    >
                      <span className="text-slate-200 font-medium group-hover:text-indigo-400">{item.nombre}</span>
                      <span className="text-indigo-400 font-semibold bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/40">
                        ${item.precioSugerido}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 px-1 py-1">Sin coincidencias. ¡Agrega tu nuevo artículo abajo!</p>
                )}
              </div>
            )}

            {/* Custom/New Entry Form */}
            <form onSubmit={handleAddCustomItem} className="border-t border-slate-700/40 pt-4 space-y-3.5">
              <p className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Agregar Artículo Personalizado</span>
              </p>

              <div>
                <label className="text-[11px] block font-medium text-slate-400 mb-1">Nombre del artículo:</label>
                <input
                  type="text"
                  placeholder="Por ejemplo: Arándanos Deshidratados"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] block font-medium text-slate-400 mb-1">Est. Precio Unitario (USD):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ref: 2.50"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] block font-medium text-slate-400 mb-1">Categoría:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-[38px]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Planificar a la Lista</span>
              </button>
            </form>
          </div>

          {/* Quick-add Common list buttons */}
          <div className="bg-slate-800/40 border border-slate-750 rounded-2xl p-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Básicos comunes de Alacena</h4>
            <div className="flex flex-wrap gap-2">
              {COMMOM_ITEMS_DB.slice(0, 9).map((item, idx) => {
                const isAlreadyIn = activeList.some(act => act.nombre.toLowerCase() === item.nombre.toLowerCase());
                return (
                  <button
                    key={idx}
                    onClick={() => handleAddItem(item.nombre, item.categoriaId, item.precioSugerido)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all duration-300 text-left ${isAlreadyIn ? 'bg-indigo-950/30 text-indigo-400 border-indigo-500/40' : 'bg-slate-900/30 text-slate-300 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'}`}
                  >
                    <span>{item.nombre}</span>
                    <span className="opacity-70 text-[10px] ml-1">(${item.precioSugerido})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Columns: Active List Editor Table */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/40 overflow-hidden">
            
            {/* Table Header Displaying Totals */}
            <div className="p-4 bg-slate-850/80 border-b border-slate-700/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Artículos Planificados para el Día de Súper</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Establece cantidades y precios estimados de tienda de referencia.</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Estimado Total de Lista</span>
                <span className="text-lg font-extrabold text-indigo-400">
                  ${activeListEstimate.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {/* List Body */}
            {activeList.length === 0 ? (
              <div className="py-20 text-center space-y-3.5">
                <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto stroke-[1.5]" />
                <div className="space-y-1">
                  <p className="text-slate-300 text-sm font-semibold">Tu lista de compras está vacía.</p>
                  <p className="text-slate-500 text-xs px-6 max-w-sm mx-auto">Comienza buscando productos o clona uno de tus tickets pasados para rellenar la canasta de forma veloz.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/20 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700/30">
                      <th className="py-3 px-4">Artículo</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4 text-center">Cant. Planificada</th>
                      <th className="py-3 px-4 text-center">Est. Unitario</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                      <th className="py-3 px-4 text-right">Aciones</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-700/20">
                    <AnimatePresence initial={false}>
                      {activeList.map((item) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-slate-750/30 transition text-sm group"
                        >
                          {/* Name */}
                          <td className="py-3.5 px-4 font-semibold text-slate-200">
                            {item.nombre}
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4">
                            <span className="text-xs bg-slate-750 px-2 py-1 rounded-lg text-slate-300 border border-slate-700/60 font-medium">
                              {getCategoryName(item.categoriaId)}
                            </span>
                          </td>

                          {/* Quantity control */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, item.cantidadPlanificada - 1)}
                                className="w-7 h-7 bg-slate-800 text-slate-300 font-bold border border-slate-700 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors select-none"
                              >
                                -
                              </button>
                              <span className="w-10 text-center font-bold text-slate-100">{item.cantidadPlanificada}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, item.cantidadPlanificada + 1)}
                                className="w-7 h-7 bg-slate-800 text-slate-300 font-bold border border-slate-700 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors select-none"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Price Edit Input */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center space-x-1 justify-center max-w-[90px]">
                              <span className="text-slate-400">$</span>
                              <input
                                type="number"
                                value={item.precioEstimadoUnitario}
                                onChange={(e) => handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-slate-100 text-xs font-semibold text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </td>

                          {/* Subtotal */}
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-200">
                            ${(item.cantidadPlanificada * item.precioEstimadoUnitario).toFixed(2)}
                          </td>

                          {/* Delete Item button */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 px-2 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Remover de lista"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* COMPRAS PREVIAS MODAL: Clonar y Fusionar Históricos */}
      {showHistoryModal && (
        <div id="history-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <History className="text-sky-450 w-5 h-5" />
                  <span>Clonación & Fusión de Canasta Básica</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Elige un ticket histórico para regenerar o complementar tu lista.
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-450 hover:text-slate-200 text-xs"
              >
                Cerrar
              </button>
            </div>

            {/* List / Selection */}
            <div className="p-5 overflow-y-auto max-h-[380px] space-y-4">
              {history.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-xs">Aún no cuentas con compras registradas en el historial.</p>
              ) : (
                history.map((ticket) => {
                  const itemsCount = ticket.articulos.length;
                  const storeName = getStoreName(ticket.tiendaId);

                  return (
                    <div 
                      key={ticket.id} 
                      className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3.5 hover:border-slate-700 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-200">{storeName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Fecha: {ticket.fecha} • {itemsCount} artículos</p>
                        </div>
                        <span className="text-sm font-extrabold text-indigo-400">
                          ${ticket.precioFinalPagado.toFixed(2)} USD
                        </span>
                      </div>

                      {/* Display products in short preview line */}
                      <p className="text-[11px] text-slate-400 italic">
                        Artículos: {ticket.articulos.slice(0, 4).map(a => `${a.nombre} (x${a.cantidadPlanificada})`).join(', ')}
                        {ticket.articulos.length > 4 ? "..." : ""}
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleClonePurchase(ticket)}
                          className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition"
                          title="Sustituye completamente la lista con esta canasta"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Clonar canasta</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleMergePurchase(ticket)}
                          className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg transition"
                          title="Suma estos productos a tu lista activa sin borrar los actuales"
                        >
                          <Layers className="w-3.5 h-3.5 text-sky-400" />
                          <span>Fusionar con actual</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
