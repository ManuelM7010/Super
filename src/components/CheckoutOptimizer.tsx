/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Articulo, CompraHistorica, Tienda, Categoria, MetodoPago } from '../types';
import { 
  CreditCard, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Percent, 
  Info, 
  DollarSign, 
  TrendingUp, 
  Sliders, 
  ArrowRight,
  Receipt
} from 'lucide-react';

interface CheckoutOptimizerProps {
  activeList: Articulo[];
  setActiveList: (list: Articulo[]) => void;
  categories: Categoria[];
  stores: Tienda[];
  activeStoreId: string;
  payments: MetodoPago[];
  history: CompraHistorica[];
  setHistory: React.Dispatch<React.SetStateAction<CompraHistorica[]>>;
  onCheckoutComplete: () => void; // nav back to planner/dashboard
}

export default function CheckoutOptimizer({
  activeList,
  setActiveList,
  categories,
  stores,
  activeStoreId,
  payments,
  history,
  setHistory,
  onCheckoutComplete
}: CheckoutOptimizerProps) {
  const activeStore = stores.find(s => s.id === activeStoreId) || stores[0];
  const [valesBalance, setValesBalance] = useState<number>(50); // Default grocery allowance USD
  const [cashbackPercent, setCashbackPercent] = useState<number>(3.0); // Cashback card rate %
  const [selectedMainPayment, setSelectedMainPayment] = useState<string>('tdc');
  const [checkoutFinished, setCheckoutFinished] = useState(false);
  const [finalInvoice, setFinalInvoice] = useState<CompraHistorica | null>(null);

  // Filter items that are marked as inside the cart (en_carrito)
  const cartItems = activeList.filter(item => item.estado === 'en_carrito');
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.cantidadRealComprada * item.precioRealEstante), 0);

  // Split calculations
  const [valesCharge, setValesCharge] = useState(0);
  const [tdcCharge, setTdcCharge] = useState(0);
  const [efectivoCharge, setEfectivoCharge] = useState(0);

  // Auto solve optimization splits whenever balance or cart changes
  useEffect(() => {
    // 1. Identify food items eligible for Food Vouchers (vales de despensa)
    // Despensa General & Bebidas are eligible under voucher rules, and Frescos/Carnes.
    // Beauty, Cleaning, Pets have restrictions on standard vouchers in Mexico, so we exclude them.
    const eligibleCategories = ['despensa', 'bebidas', 'frescos'];
    
    const eligibleItemsTotal = cartItems
      .filter(item => eligibleCategories.includes(item.categoriaId))
      .reduce((sum, item) => sum + (item.cantidadRealComprada * item.precioRealEstante), 0);
    
    // We can pay UP TO eligible total, limited by actual vouchers balance available
    const appliedVales = Math.min(eligibleItemsTotal, valesBalance);
    const remainder = cartTotal - appliedVales;

    setValesCharge(appliedVales);
    
    if (selectedMainPayment === 'tdc') {
      setTdcCharge(remainder);
      setEfectivoCharge(0);
    } else {
      setTdcCharge(0);
      setEfectivoCharge(remainder);
    }
  }, [cartItems, cartTotal, valesBalance, selectedMainPayment]);

  const cashbackEarned = (tdcCharge * cashbackPercent) / 100;

  const handleApplyCheckout = () => {
    if (cartItems.length === 0) return;

    // Define descriptive payment breakdown string
    let payDetails = '';
    if (valesCharge > 0) payDetails += `Vales ($${valesCharge.toFixed(0)})`;
    if (tdcCharge > 0) payDetails += `${payDetails ? ' + ' : ''}TDC Cashback ($${tdcCharge.toFixed(0)})`;
    if (efectivoCharge > 0) payDetails += `${payDetails ? ' + ' : ''}Efectivo/Débito ($${efectivoCharge.toFixed(0)})`;
    if (!payDetails) payDetails = 'Efectivo';

    // 1. Create a historical purchase entry
    const newPurchase: CompraHistorica = {
      id: 'h_' + Date.now().toString(36),
      fecha: new Date().toISOString().split('T')[0], // '2026-06-14'
      tiendaId: activeStoreId,
      articulos: [...cartItems],
      precioFinalPagado: cartTotal,
      metodoPagoUtilizado: payDetails
    };

    // 2. Add to history state
    const updatedHistory = [newPurchase, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('super_historial_v1', JSON.stringify(updatedHistory));

    // 3. "Congela los precios de ese día como nuevo parámetro de referencia para futuras compras"
    // We update reference prices in active list or clear bought items while keeping outstanding pending items
    const leftoverItems = activeList.filter(item => item.estado !== 'en_carrito').map(item => {
      if (item.estado === 'no_disponible') {
        // Reset completed state back for next visit
        return { ...item, estado: 'pendiente' as const };
      }
      return item;
    });

    // Also update common database or reference prices in outstanding list
    // We set activeList back to leftovers
    setActiveList(leftoverItems);
    localStorage.setItem('super_lista_activa_v1', JSON.stringify(leftoverItems));

    setFinalInvoice(newPurchase);
    setCheckoutFinished(true);
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.nombre || "Despensa";
  };

  return (
    <div className="space-y-6">
      
      <AnimatePresence mode="wait">
        {!checkoutFinished ? (
          <motion.div
            key="optimizer-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            
            {/* Left Column: Split Engine, Rules and Parameters */}
            <div className="lg:col-span-1 space-y-5">
              
              {/* Payment Optimizer Rules Card */}
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="text-emerald-400 w-5.5 h-5.5" />
                  <h3 className="text-sm font-extrabold text-slate-100">Checkout Optimizer</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Basado en los vales de supermercado de El Salvador y los programas de lealtad bancarios de BAC o Agrícola, organizamos automáticamente tu canasta para maximizar tu ahorro y cashback de inmediato.
                </p>

                {/* Balance input sliders */}
                <div className="space-y-4 border-t border-slate-700/50 pt-4">
                  
                  {/* Food Voucher Limit Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-slate-300 block">Saldo en Monedero de Vales:</label>
                      <span className="text-xs font-bold text-emerald-400">${valesBalance} USD</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="300" 
                      step="5"
                      value={valesBalance}
                      onChange={(e) => setValesBalance(parseInt(e.target.value) || 0)}
                      className="w-full accent-emerald-500 bg-slate-900 cursor-pointer h-1.5 rounded-lg appearance-none"
                    />
                    <span className="text-[10px] text-slate-400 block italic leading-none">Prioriza alimentos & bebidas excluyendo limpieza o mascotas.</span>
                  </div>

                  {/* Secondary Payment selector */}
                  <div className="space-y-1.5pt-1">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Método de Respaldo / Excedentes:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMainPayment('tdc')}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${selectedMainPayment === 'tdc' ? 'bg-fuchsia-950/35 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                      >
                        TDC Cashback
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMainPayment('efectivo')}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${selectedMainPayment === 'efectivo' ? 'bg-slate-800 border-slate-550 text-slate-200' : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                      >
                        Efectivo / Débito
                      </button>
                    </div>
                  </div>

                  {/* TDC CashBack percentage adjuster */}
                  {selectedMainPayment === 'tdc' && (
                    <div className="space-y-1 bg-slate-950/30 p-2.5 rounded-xl border border-slate-750">
                      <div className="flex justify-between">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Tasa de Cashback TDC (%):</label>
                        <span className="text-xs font-bold text-fuchsia-400">{cashbackPercent}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.5"
                        value={cashbackPercent}
                        onChange={(e) => setCashbackPercent(parseFloat(e.target.value) || 0)}
                        className="w-full accent-fuchsia-500 bg-slate-900 cursor-pointer h-1"
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* Informative advice */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 text-indigo-300 text-xs flex items-start space-x-2.5">
                <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-indigo-200">Recomendación Activa del Asistente:</span>
                  <span>Pagando ${valesCharge.toFixed(2)} USD con tus vales y cargando ${tdcCharge.toFixed(2)} USD a tu TDC de recompensas ganas un retorno directo de <strong>${cashbackEarned.toFixed(2)} USD</strong>, maximizando tu presupuesto libre.</span>
                </div>
              </div>

            </div>

            {/* Right Columns: Optimization results split and receipt preview */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Dynamic Split Visual Bar */}
              <div className="bg-slate-800/60 p-5 border border-slate-700/40 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-slate-200">Distribución de Cuentas Virtuales sugerida</h4>
                
                {/* Visual Ratio stack */}
                <div className="w-full h-8 bg-slate-900 rounded-xl overflow-hidden flex font-sans text-xs">
                  {valesCharge > 0 && (
                    <div 
                      className="bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center text-white font-bold px-2 truncate"
                      style={{ width: `${(valesCharge / cartTotal) * 100}%` }}
                      title="Monto cubierto con Vales"
                    >
                      Vales: ${(valesCharge / cartTotal * 100).toFixed(0)}%
                    </div>
                  )}
                  {tdcCharge > 0 && (
                    <div 
                      className="bg-fuchsia-600 hover:bg-fuchsia-500 transition-all flex items-center justify-center text-white font-bold px-2 truncate"
                      style={{ width: `${(tdcCharge / cartTotal) * 105}%` }}
                      title="Monto cargado al crédito"
                    >
                      TDC: ${(tdcCharge / cartTotal * 100).toFixed(0)}%
                    </div>
                  )}
                  {efectivoCharge > 0 && (
                    <div 
                      className="bg-slate-500 hover:bg-slate-400 transition-all flex items-center justify-center text-white font-bold px-2 truncate"
                      style={{ width: `${(efectivoCharge / cartTotal) * 100}%` }}
                      title="Monto pagado en efectivo"
                    >
                      Efectivo: ${(efectivoCharge / cartTotal * 100).toFixed(0)}%
                    </div>
                  )}
                </div>

                {/* Sub-cards showing ledger breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                  
                  {/* Food Vouchers summary ledger */}
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center sm:items-start sm:flex-col gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1" />
                      <span>Monedero Vales</span>
                    </span>
                    <div>
                      <p className="text-xl font-extrabold text-slate-100">${valesCharge.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Retirado del saldo de despensa</p>
                    </div>
                  </div>

                  {/* TDC Recompensas card balance ledger */}
                  {tdcCharge > 0 && (
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center sm:items-start sm:flex-col gap-2">
                      <span className="text-[10px] font-bold text-fuchsia-400 uppercase flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-fuchsia-600 rounded-full inline-block mr-1" />
                        <span>TDC Cashback</span>
                      </span>
                      <div>
                        <p className="text-xl font-extrabold text-slate-100">${tdcCharge.toFixed(2)}</p>
                        <p className="text-[10px] text-fuchsia-300 font-medium mt-0.5">Retorno ganado: +${cashbackEarned.toFixed(1)}</p>
                      </div>
                    </div>
                  )}

                  {/* Cash summary ledger */}
                  {efectivoCharge > 0 && (
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center sm:items-start sm:flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-slate-505 rounded-full inline-block mr-1" />
                        <span>Efectivo/Débito</span>
                      </span>
                      <div>
                        <p className="text-xl font-extrabold text-slate-100">${efectivoCharge.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">A debitar del saldo líquido</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Items Allocation Receipt breakdown panel */}
              <div className="bg-slate-800/40 rounded-2xl border border-slate-700/30 overflow-hidden">
                <div className="p-4 bg-slate-800/80 border-b border-slate-700/40 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Desglose de Artículos de Compra Actual ({cartItems.length})</span>
                  <span className="text-sm font-extrabold text-slate-200">Súper Total: ${cartTotal.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                </div>

                <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => {
                    const isFoodEligible = ['despensa', 'bebidas', 'frescos'].includes(item.categoriaId);
                    
                    return (
                      <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-800/10">
                        <div>
                          <p className="font-semibold text-slate-200">{item.nombre}</p>
                          <p className="text-[10px] text-slate-400">{getCategoryName(item.categoriaId)} • Cantidad: x{item.cantidadRealComprada}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-slate-200">${(item.cantidadRealComprada * item.precioRealEstante).toFixed(2)}</p>
                          <span className={`inline-block text-[9px] px-1 rounded-sm mt-0.5 ${isFoodEligible && valesBalance >= (item.cantidadRealComprada * item.precioRealEstante) ? 'bg-emerald-950/40 text-emerald-300' : 'bg-fuchsia-950/40 text-fuchsia-300'}`}>
                            {isFoodEligible && valesBalance >= (item.cantidadRealComprada * item.precioRealEstante) ? 'Pagar con Vales' : 'Cargar a TDC'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm Action Button */}
                <div className="p-4 bg-slate-850/80 border-t border-slate-700/30 flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyCheckout}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl transition shadow hover:shadow-indigo-500/10 cursor-pointer"
                  >
                    Confirmar Pago y Congelar Precios de Referencia
                  </button>
                </div>
              </div>

            </div>

          </motion.div>
        ) : (
          <motion.div
            key="optimizer-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto bg-slate-800 border border-slate-700/60 rounded-2xl p-6 sm:p-8 space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle className="text-emerald-400 w-9 h-9 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">¡Súper Congelado de Forma Inteligente!</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Hemos registrado esta visita en tu histórico físico. El asistente ha guardado y congelado los precios capturados este día como nuevos valores de referencia para proyecciones futuras.
              </p>
            </div>

            {/* Ticket Invoice Summary Card */}
            {finalInvoice && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 text-left space-y-3 font-sans">
                <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span>HISTORIAL ID: {finalInvoice.id}</span>
                  <span>FECHA: {finalInvoice.fecha}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Total liquidado:</p>
                  <p className="text-3xl font-extrabold text-slate-100">${finalInvoice.precioFinalPagado.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
                </div>

                <div className="text-xs text-slate-300 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-semibold block text-slate-200">Métodos de pago utilizados:</span>
                  <span className="text-[11px] block text-slate-400 mt-1">{finalInvoice.metodoPagoUtilizado}</span>
                </div>

                {tdcCharge > 0 && (
                  <div className="text-[11px] text-fuchsia-300 font-semibold flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-fuchsia-400" />
                    <span>Acreditamos +${cashbackEarned.toFixed(2)} USD a tu bóveda virtual de cashback.</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onCheckoutComplete}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition cursor-pointer"
            >
              Regresar al Planificador de Compras
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
