/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Articulo, Categoria, Tienda } from '../types';
import { 
  Check, 
  Plus, 
  Minus, 
  AlertOctagon, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Percent, 
  HelpCircle, 
  FileText, 
  ShoppingCart, 
  AlertTriangle, 
  Sparkles, 
  CheckSquare, 
  Square,
  Gift,
  PlusSquare,
  X
} from 'lucide-react';

interface SupermarketModeProps {
  activeList: Articulo[];
  setActiveList: (list: Articulo[]) => void;
  categories: Categoria[];
  stores: Tienda[];
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  onFinishShopping: () => void; // Navigates to screen 3
}

export default function SupermarketMode({
  activeList,
  setActiveList,
  categories,
  stores,
  activeStoreId,
  setActiveStoreId,
  onFinishShopping,
}: SupermarketModeProps) {
  const [showTemptationModal, setShowTemptationModal] = useState(false);
  const [temptationName, setTemptationName] = useState('');
  const [temptationPrice, setTemptationPrice] = useState('2.50');
  const [temptationCat, setTemptationCat] = useState(categories[0]?.id || 'despensa');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const activeStore = stores.find(s => s.id === activeStoreId) || stores[0];

  // Helper selectors
  const toggleCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const getCategoryTheme = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat || { nombre: "General", icono: "ShoppingBag" };
  };

  // State modifiers
  const handleToggleState = (id: string) => {
    setActiveList(activeList.map(item => {
      if (item.id === id) {
        const nextState: Articulo['estado'] = item.estado === 'en_carrito' ? 'pendiente' : 'en_carrito';
        return {
          ...item,
          estado: nextState,
          // When marking as en_carrito, synchronize real quantity if not set
          cantidadRealComprada: item.cantidadRealComprada || item.cantidadPlanificada,
          precioRealEstante: item.precioRealEstante || item.precioEstimadoUnitario
        };
      }
      return item;
    }));
  };

  const handleUpdateRealQty = (id: string, delta: number) => {
    setActiveList(activeList.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.cantidadRealComprada + delta);
        return {
          ...item,
          cantidadRealComprada: newQty,
          // If we decr to 0, maybe keep it but as 'pendiente' or 'no_disponible'
          estado: newQty === 0 ? 'pendiente' : item.estado
        };
      }
      return item;
    }));
  };

  const handleUpdateRealPrice = (id: string, value: number) => {
    if (isNaN(value) || value < 0) return;
    setActiveList(activeList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          precioRealEstante: value
        };
      }
      return item;
    }));
  };

  const handleMarkUnavailable = (id: string) => {
    setActiveList(activeList.map(item => {
      if (item.id === id) {
        return { ...item, estado: 'no_disponible' as const };
      }
      return item;
    }));
  };

  // Impulse buying addition ("Detector de Tentaciones")
  const handleAddTemptation = (e: React.FormEvent) => {
    e.preventDefault();
    const name = temptationName.trim();
    const price = parseFloat(temptationPrice);
    if (name && !isNaN(price)) {
      const impulseItem: Articulo = {
        id: 'imp_' + Math.random().toString(36).substring(2, 9),
        nombre: `🍭 ${name} (Imprevisto)`,
        categoriaId: temptationCat,
        cantidadPlanificada: 1,
        precioEstimadoUnitario: price,
        cantidadRealComprada: 1,
        precioRealEstante: price,
        estado: 'en_carrito', // added directly to cart
        esArticuloExtra: true // impulse buy
      };
      setActiveList([...activeList, impulseItem]);
      setTemptationName('');
      setShowTemptationModal(false);
    }
  };

  // --- MATH CALCS FOR "QUEMADOR DE PRESUPUESTO" WIDGET ---
  // Initial Plan Estimate total
  const estimatedInitialTotal = activeList
    .filter(item => item.estado !== 'no_disponible')
    .reduce((sum, item) => sum + (item.cantidadPlanificada * item.precioEstimadoUnitario), 0);

  // Total actually accumulated in Cart so far
  const totalCartAcumulado = activeList
    .filter(item => item.estado === 'en_carrito')
    .reduce((sum, item) => sum + (item.cantidadRealComprada * item.precioRealEstante), 0);

  // Total predicted of active items (cart real value + pending estimated value)
  const totalPredictivoLista = activeList.reduce((sum, item) => {
    if (item.estado === 'en_carrito') {
      return sum + (item.cantidadRealComprada * item.precioRealEstante);
    } else if (item.estado === 'pendiente') {
      return sum + (item.cantidadPlanificada * item.precioEstimadoUnitario);
    }
    return sum; // ignore no_disponible
  }, 0);

  // Budget left for this specific store
  const storeBudgetLimit = activeStore.presupuestoMensual;
  const storeBudgetRemaining = storeBudgetLimit - totalCartAcumulado;
  const isStoreBudgetBlown = totalPredictivoLista > storeBudgetLimit;
  
  // Calculate percentage of active list currently bought
  const totalItemsCount = activeList.filter(item => item.estado !== 'no_disponible').length;
  const cartItemsCount = activeList.filter(item => item.estado === 'en_carrito').length;
  const checkoutPercentage = totalItemsCount > 0 ? (cartItemsCount / totalItemsCount) * 100 : 0;

  // Filter items into Category Groups containing at least one item
  const usedCategoryIds = Array.from(new Set(activeList.map(item => item.categoriaId)));
  const listCategories = categories.filter(c => usedCategoryIds.includes(c.id));

  return (
    <div className="space-y-6 pb-28">
      
      {/* Mobile-Friendly Head controls */}
      <div className="bg-slate-800/60 p-4 border border-slate-700/40 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Modo Tienda Activo</span>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <ShoppingCart className="text-indigo-400 w-5 h-5" />
            <span>Día de Súper</span>
          </h2>
          <p className="text-xs text-slate-400">Toca para poner en carrito, desliza el contador o altera precios reales.</p>
        </div>

        {/* Change Shop Floor Selection */}
        <div className="w-full md:w-auto flex items-center space-x-3 bg-slate-900/40 px-3 py-2 rounded-xl border border-slate-755">
          <span className="text-xs font-semibold text-slate-400 block whitespace-nowrap">Establecimiento:</span>
          <select
            value={activeStoreId}
            onChange={(e) => setActiveStoreId(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer pr-1"
          >
            {stores.map(s => (
              <option key={s.id} value={s.id}>{s.nombre} (Límite: ${s.presupuestoMensual})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main shopping lists broken down by category / aisles */}
      {activeList.length === 0 ? (
        <div className="bg-slate-800/40 rounded-2xl border border-slate-750 px-6 py-20 text-center space-y-3.5">
          <ShoppingCart className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">No hay productos planificados para tu visita.</p>
          <p className="text-slate-500 text-xs">Vuelve al Planificador Inteligente para agregar víveres esenciales.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {listCategories.map((c) => {
            const catItems = activeList.filter(item => item.categoriaId === c.id);
            const isCollapsed = collapsedCategories[c.id] || false;

            return (
              <div key={c.id} className="bg-slate-800/50 border border-slate-700/30 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Category Header (collapsible, huge 48px target) */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(c.id)}
                  className="w-full px-4 py-3.5 bg-slate-800 hover:bg-slate-750 border-b border-slate-700/20 text-left flex justify-between items-center select-none"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg">
                      {c.icono === 'Apple' ? '🍎' : c.icono === 'ShoppingBag' ? '🛍️' : c.icono === 'Sparkles' ? '✨' : c.icono === 'Heart' ? '❤️' : c.icono === 'PawPrint' ? '🐾' : '🥤'}
                    </span>
                    <span className="text-sm font-bold text-slate-100">{c.nombre}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold border border-slate-650">
                      {catItems.length}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-slate-400 space-x-1.5">
                    <span>{isCollapsed ? 'Desplegar' : 'Contraer'}</span>
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {/* Items contained list */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-700/20">
                    {catItems.map((item) => {
                      const isBought = item.estado === 'en_carrito';
                      const isUnavailable = item.estado === 'no_disponible';

                      return (
                        <div
                          key={item.id}
                          className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all duration-300 ${isBought ? 'bg-indigo-950/20 border-l-4 border-l-indigo-500' : isUnavailable ? 'opacity-40 bg-slate-900/30' : 'bg-transparent'}`}
                        >
                          {/* Checked box + Name */}
                          <div className="flex items-center space-x-3 shrink-0 max-w-full sm:max-w-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleState(item.id)}
                              className="w-11 h-11 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center transition shrink-0 select-none cursor-pointer"
                              title={isBought ? "Regresar a pendientes" : "Marcar en carrito"}
                            >
                              {isBought ? (
                                <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-slate-900 font-bold" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded border-2 border-slate-600" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <p className={`text-sm font-bold text-slate-100 truncate ${isBought ? 'line-through text-slate-400 decoration-slate-500/80' : ''}`}>
                                {item.nombre}
                              </p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                {item.esArticuloExtra && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-700/40 flex items-center space-x-0.5">
                                    <Gift className="w-2.5 h-2.5" />
                                    <span>Imprevisto/Extra</span>
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">
                                  Est. Unit: ${item.precioEstimadoUnitario.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Sub-controls inline */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            
                            {/* Quantity Controls (touch target of 44x44px for the triggers) */}
                            <div className="flex items-center bg-slate-900/50 rounded-xl border border-slate-750 p-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateRealQty(item.id, -1)}
                                className="w-9 h-9 bg-slate-800 text-slate-100 font-bold border border-slate-700 hover:bg-slate-700 rounded-lg flex items-center justify-center transition select-none cursor-pointer text-lg"
                                title="Restar cantidad"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              
                              <span className="w-9 text-center font-bold text-slate-200 text-xs">
                                {isBought ? item.cantidadRealComprada : item.cantidadPlanificada}
                              </span>
                              
                              <button
                                type="button"
                                onClick={() => handleUpdateRealQty(item.id, 1)}
                                className="w-9 h-9 bg-slate-800 text-slate-100 font-bold border border-slate-700 hover:bg-slate-700 rounded-lg flex items-center justify-center transition select-none cursor-pointer text-lg"
                                title="Sumar cantidad"
                              >
                                <Plus className="w-4.5 h-4.5" />
                              </button>
                            </div>

                            {/* Price Overwrite Module (Adaptador de Variaciones de Precio) */}
                            <div className="flex items-center space-x-1 justify-end max-w-[125px]">
                              <span className="text-slate-400 text-xs font-semibold">$ Real:</span>
                              <input
                                type="number"
                                step="0.1"
                                value={isBought ? item.precioRealEstante : item.precioEstimadoUnitario}
                                onChange={(e) => handleUpdateRealPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-indigo-550"
                                title="Altera la variación del precio real del estante"
                              />
                            </div>

                            {/* Options to mark unavailable */}
                            {!isBought && !isUnavailable && (
                              <button
                                type="button"
                                onClick={() => handleMarkUnavailable(item.id)}
                                className="text-[10px] text-slate-400 hover:text-rose-400 px-2 py-1.5 hover:bg-slate-900/50 rounded-lg transition"
                                title="Marcar como no disponible en tienda"
                              >
                                Agotado
                              </button>
                            )}

                            {isUnavailable && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveList(activeList.map(it => it.id === item.id ? { ...it, estado: 'pendiente' } : it));
                                }}
                                className="text-[10px] text-indigo-400 font-semibold"
                              >
                                Habilitar
                              </button>
                            )}

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB): "Detector de Tentaciones" */}
      <div className="fixed bottom-24 right-5 sm:right-8 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowTemptationModal(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg hover:shadow-fuchsia-500/20 transition cursor-pointer"
          title="Detector de Tentaciones - Registrar antojos sorpresa!"
        >
          <Gift className="w-6 h-6 animate-bounce" />
        </motion.button>
      </div>

      {/* TEMPTATION DETECTOR POPUP / MODAL */}
      {showTemptationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Gift className="text-fuchsia-400 w-5 h-5" />
                <h3 className="text-sm font-extrabold text-slate-200">Detector de Tentaciones 🍭</h3>
              </div>
              <button onClick={() => setShowTemptationModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ¿Un antojo fuera de lista? Agrégalo cargado directamente en el carrito con una marca fucsia especial de artículo extra para vigilar su impacto en caja.
            </p>

            <form onSubmit={handleAddTemptation} className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nombre del capricho:</label>
                <input
                  type="text"
                  placeholder="Ej: Galletas de menta doble chocolate"
                  value={temptationName}
                  onChange={(e) => setTemptationName(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Precio En Estante:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temptationPrice}
                    onChange={(e) => setTemptationPrice(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pasillo / Categoría:</label>
                  <select
                    value={temptationCat}
                    onChange={(e) => setTemptationCat(e.target.value)}
                    className="block w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-[11px] focus:outline-none h-[34px]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Meter en Carrito como Extra
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* STICKY footer "Quemador de Presupuesto" Panel widget */}
      <div id="sticky-budget-burner" className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-3.5 px-4 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          {/* Progress bar and indicators */}
          <div className="w-full md:w-3/5 space-y-2.5">
            <div className="flex flex-wrap justify-between items-end text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 font-bold block">Progreso de Compra:</span>
                <span className="font-extrabold text-indigo-400">
                  {cartItemsCount}/{totalItemsCount} comprados ({checkoutPercentage.toFixed(0)}%)
                </span>
              </div>

              <div className="flex space-x-3.5 text-slate-400">
                <span>Plani: <strong className="text-slate-300">${estimatedInitialTotal.toFixed(0)}</strong></span>
                <span>En Carrito: <strong className="text-indigo-400 font-extrabold">${totalCartAcumulado.toFixed(1)}</strong></span>
                
                {/* Available visit budget indicator */}
                <span>Dispo: 
                  <strong className={`ml-1 ${storeBudgetRemaining < 0 ? 'text-rose-400' : 'text-emerald-400 font-bold'}`}>
                    ${storeBudgetRemaining.toFixed(0)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Visual indicator bar */}
            <div className="relative w-full h-2.5 bg-slate-850 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${isStoreBudgetBlown ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-indigo-500'}`}
                style={{ width: `${Math.min((totalPredictivoLista / storeBudgetLimit) * 100, 100)}%` }}
              />
              <div 
                className="absolute top-0 right-0 h-full border-r-[3px] border-r-rose-400/90 pointer-events-none"
                style={{ right: `${Math.max(0, 100 - (storeBudgetLimit / Math.max(1, totalPredictivoLista)) * 100)}%` }}
                title="Presupuesto límite de establecimiento"
              />
            </div>
            
            {/* Danger warn alert info */}
            {isStoreBudgetBlown && (
              <div className="text-[10px] text-rose-400 font-bold flex items-center space-x-1">
                <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                <span>⚠️ ¡CUIDADO! La proyección final (${totalPredictivoLista.toFixed(2)} USD) excede tu límite asignado para {activeStore.nombre} (${storeBudgetLimit} USD). ¡Considera depurar extras!</span>
              </div>
            )}
          </div>

          {/* Right finish / final button */}
          <div className="w-full md:w-auto flex justify-end">
            <button
              type="button"
              disabled={cartItemsCount === 0}
              onClick={onFinishShopping}
              className={`w-full md:w-auto px-6 py-3 font-extrabold text-sm rounded-xl transition shadow flex items-center justify-center space-x-2 select-none ${cartItemsCount > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:shadow-emerald-500/10' : 'bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed'}`}
            >
              <span>Finalizar Compra (${totalCartAcumulado.toFixed(1)})</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
