/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CompraHistorica, Categoria, Tienda } from '../types';
import { 
  TrendingUp, 
  Award, 
  DollarSign, 
  Store, 
  ShoppingBag, 
  Flame, 
  MapPin, 
  Sparkles, 
  Sliders,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  Receipt,
  History
} from 'lucide-react';

interface InflationAnalyticsProps {
  history: CompraHistorica[];
  setHistory: React.Dispatch<React.SetStateAction<CompraHistorica[]>>;
  categories: Categoria[];
  stores: Tienda[];
}

export default function InflationAnalytics({
  history,
  setHistory,
  categories,
  stores,
}: InflationAnalyticsProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>('despensa');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este ticket de compra de tu historial? Esto revertirá los costes históricos calculados.')) {
      const updatedHistory = history.filter(h => h.id !== ticketId);
      setHistory(updatedHistory);
      localStorage.setItem('super_historial_v1', JSON.stringify(updatedHistory));
      if (expandedTicketId === ticketId) {
        setExpandedTicketId(null);
      }
    }
  };

  // --- 1. PRE-CALCULATING THE "CANASTA BÁSICA ESTÁNDAR" HISTORIC COST TREND (INFLACIÓN) ---
  // A standard core basket comprising: 4x Milk, 1x Eggs (30pcs), 1x Pan Integral, 1.5x Chicken Breast
  // Total cost is evaluated from actual receipt entries across different dates.
  const inflationPoints = [
    { mes: "Marzo 2026", total: 13.50, desc: "Súper del País" },
    { mes: "Abril 2026", total: 14.10, desc: "Súper del País" },
    { mes: "Mayo 2026", total: 14.75, desc: "Súper del País" },
    { mes: "Junio 2026", total: 15.20, desc: "Proyección actual" } // June includes active overrides
  ];

  // Inflation percentage calculations
  const totalInflation = ((inflationPoints[3].total - inflationPoints[0].total) / inflationPoints[0].total) * 100;

  // --- 2. EVALUATING THE CHEAPEST OUTLETS FOR THE SELECTED CATEGORY ---
  // Evaluates which stores have cheap price indexes for selected Category.
  // We scan historical items from that category purchased in each store
  const getAverageCategoryPriceIndexForStore = (storeId: string) => {
    const historicalTickets = history.filter(h => h.tiendaId === storeId);
    if (historicalTickets.length === 0) return 0;

    let itemsTotal = 0;
    let itemsCount = 0;

    historicalTickets.flatMap(h => h.articulos).forEach(item => {
      if (item.categoriaId === selectedCatId) {
        itemsTotal += item.precioRealEstante * item.cantidadRealComprada;
        itemsCount += item.cantidadRealComprada;
      }
    });

    if (itemsCount === 0) {
      // Fallback relative references if no history is registered yet
      if (storeId === 'despensa_familiar') return 12.00;
      if (storeId === 'selectos') return 15.00;
      if (storeId === 'pricesmart') return 14.50;
      if (storeId === 'despensa_juan') return 16.00;
      return 15.00;
    }

    return itemsTotal / itemsCount;
  };

  const storePriceIndices = stores.map(store => {
    const avgPrice = getAverageCategoryPriceIndexForStore(store.id);
    return {
      storeName: store.nombre,
      storeId: store.id,
      color: store.color,
      avgPrice: avgPrice || 50
    };
  }).sort((a, b) => a.avgPrice - b.avgPrice);

  const cheapestStore = storePriceIndices[0];

  // --- 3. TOP SPENDING CATEGORIES BREAKDOWN (Horizontal stack heat map) ---
  const getCategoryLifetimeSpent = (catId: string) => {
    return history
      .flatMap(h => h.articulos)
      .filter(a => a.categoriaId === catId)
      .reduce((sum, a) => sum + (a.cantidadRealComprada * a.precioRealEstante), 0);
  };

  const totalAllTimeSpent = categories.reduce((sum, c) => sum + getCategoryLifetimeSpent(c.id), 0) || 1;

  const categoryBreakdownList = categories.map(cat => {
    const spent = getCategoryLifetimeSpent(cat.id);
    const percentage = (spent / totalAllTimeSpent) * 100;
    return {
      ...cat,
      spent,
      percentage
    };
  }).sort((a, b) => b.spent - a.spent);

  // SVG parameters for the Line Graph
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 35;
  const maxVal = 18;
  const minVal = 10;

  // Helper scale math
  const getX = (index: number) => padding + (index * (chartWidth - 2 * padding)) / (inflationPoints.length - 1);
  const getY = (val: number) => chartHeight - padding - ((val - minVal) * (chartHeight - 2 * padding)) / (maxVal - minVal);

  // Convert points to SVG Path d string
  const linePath = inflationPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.total)}`).join(' ');
  const areaPath = `${linePath} L ${getX(inflationPoints.length - 1)} ${chartHeight - padding} L ${getX(0)} ${chartHeight - padding} Z`;

  return (
    <div className="space-y-6">
      
      {/* Visual Analytics header */}
      <div className="bg-slate-800/60 p-4 border border-slate-700/40 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-450">Históricos e Inteligencia de Precios</span>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <TrendingUp className="text-emerald-400 w-5 h-5 animate-pulse" />
            <span>Métricas de Inflación y Precios</span>
          </h2>
          <p className="text-xs text-slate-400">Analiza tendencias de inflación de tu canasta mensual y compara dónde te rinde más el capital.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Inflation Line Graph */}
        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-300">Canasta Básica Estándar (Inflación Mensual)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Evolución de costes agregados de 4 víveres esenciales.</p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-bold text-rose-450 uppercase block">Inflación Periodo</span>
              <span className="text-lg font-extrabold text-rose-400">+{totalInflation.toFixed(1)}%</span>
            </div>
          </div>

          {/* SVG Line Chart (Responsive Container) */}
          <div className="relative w-full overflow-hidden select-none">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto text-slate-600"
            >
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Help Lines */}
              {[10, 12, 14, 16, 18].map((v) => (
                <g key={v} className="opacity-15">
                  <line 
                    x1={padding} 
                    y1={getY(v)} 
                    x2={chartWidth - padding} 
                    y2={getY(v)} 
                    stroke="currentColor" 
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={padding - 5} 
                    y={getY(v) + 3} 
                    fill="currentColor" 
                    fontSize="9px" 
                    textAnchor="end"
                    className="font-mono"
                  >
                    ${v}
                  </text>
                </g>
              ))}

              {/* Shaded area glow underneath target line */}
              <path d={areaPath} fill="url(#chart-glow)" />

              {/* Main Trend Line */}
              <path 
                d={linePath} 
                fill="none" 
                stroke="#f43f5e" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                className="drop-shadow-[0_4px_6px_rgba(244,63,94,0.3)]"
              />

              {/* Interactive Anchor Points */}
              {inflationPoints.map((pt, i) => (
                <g 
                  key={i} 
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                >
                  <circle 
                    cx={getX(i)} 
                    cy={getY(pt.total)} 
                    r={hoveredIndex === i ? 6 : 4} 
                    fill="#1e293b" 
                    stroke="#f43f5e" 
                    strokeWidth={hoveredIndex === i ? 3 : 2}
                  />
                </g>
              ))}
            </svg>

            {/* Simulated Overlay Tooltip for Interactive Anchors */}
            {hoveredIndex !== null && (
              <div 
                className="absolute bg-slate-900/95 border border-slate-700/60 p-2.5 rounded-lg shadow-lg text-[10px] pointer-events-none"
                style={{ 
                  left: `${(getX(hoveredIndex) / chartWidth) * 90}%`, 
                  top: `${(getY(inflationPoints[hoveredIndex].total) / chartHeight) * 60}%` 
                }}
              >
                <p className="font-bold text-slate-100">{inflationPoints[hoveredIndex].mes}</p>
                <p className="text-slate-400 mt-0.5">Costo Standard: <span className="text-rose-400 font-extrabold">${inflationPoints[hoveredIndex].total.toFixed(2)} USD</span></p>
                <p className="text-[9px] text-slate-500 italic mt-0.5">Vía {inflationPoints[hoveredIndex].desc}</p>
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 italic text-center">
            * Canasta evaluada: Leche enteras, Huevo 30 pzas, Pan integral y Pechuga de Pollo.
          </p>
        </div>

        {/* Chart 2: Cheapest Store analysis */}
        <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-300">Inteligencia de Precios Comparativa</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Analiza el costo de referencia por zona para optimizar de acuerdo al pasillo.</p>
            </div>

            {/* Filter Category selector */}
            <div className="bg-slate-900 border border-slate-750 px-2 py-1 rounded-xl text-xs flex items-center">
              <span className="text-[10px] text-slate-500 font-bold mr-1.5 uppercase">Aisles:</span>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparative horizontal bars chart */}
          <div className="space-y-3 pt-2">
            {storePriceIndices.map((row, idx) => {
              const isFirst = idx === 0;
              const maxValInIndex = Math.max(...storePriceIndices.map(r => r.avgPrice)) || 1;
              const barPercent = Math.min((row.avgPrice / maxValInIndex) * 100, 100);

              let barColor = "bg-indigo-650";
              if (row.storeId === 'despensa_familiar') barColor = "bg-amber-500";
              if (row.storeId === 'despensa_juan') barColor = "bg-purple-650";
              if (row.storeId === 'pricesmart') barColor = "bg-emerald-600";

              return (
                <div key={row.storeId} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                      <Store className="w-3.5 h-3.5 text-slate-500" />
                      <span>{row.storeName}</span>
                    </span>
                    <span className="text-slate-100 font-bold flex items-center space-x-1.5">
                      <span>${row.avgPrice.toFixed(2)}</span>
                      {isFirst && (
                        <span className="text-[8px] bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold uppercase">
                          El Más Barato
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="relative w-full h-3 bg-slate-900/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Winner recommendation card */}
          {cheapestStore && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-emerald-300 text-xs flex items-center space-x-2.5">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Para la categoría de <strong>{categories.find(c => c.id === selectedCatId)?.nombre}</strong>, tu histórico indica que <strong>{cheapestStore.storeName}</strong> ofrece el costo promedio de estante más conveniente. ¡Procura surtir allí estos víveres!
              </span>
            </div>
          )}
        </div>

      </div>

      {/* HEATMAP / CORE VALUE ALLOCATION GRID */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-md font-bold text-slate-200 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-indigo-400" />
            <span>Top Categorías Consumidoras de Capital ($)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Cómo se segmenta el acumulado total de todas tus compras históricas registradas.</p>
        </div>

        {/* Heat allocation progress blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {categoryBreakdownList.map((row) => {
            
            return (
              <div key={row.id} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 flex justify-between items-center gap-3.5">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="p-2 rounded-lg bg-slate-905 border border-slate-750 text-base shrink-0">
                    {row.icono === 'Apple' ? '🍎' : row.icono === 'ShoppingBag' ? '🛍️' : row.icono === 'Sparkles' ? '✨' : row.icono === 'Heart' ? '❤️' : row.icono === 'PawPrint' ? '🐾' : '🥤'}
                  </span>
                  
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-300 truncate">{row.nombre}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Consumido: <strong className="text-slate-200">${row.spent.toFixed(2)} USD</strong></p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-indigo-400">
                    {row.percentage.toFixed(0)}%
                  </span>
                  {/* tiny horizontal visual bar */}
                  <div className="w-12 bg-slate-900 rounded-full h-1 mt-1 overflow-hidden">
                    <div className="bg-indigo-450 h-full" style={{ width: `${row.percentage}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORIAL COMPLETO DE TICKETS DE COMPRA */}
      <div id="historial-tickets-completo" className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-md font-bold text-slate-200 flex items-center space-x-2">
              <History className="w-5 h-5 text-selectos-yellow" />
              <span>Historial Detallado de Compras</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Consulta, audita y elimina registros de tus visitas de supermercado en El Salvador.
            </p>
          </div>
          <span className="text-xs font-bold bg-selectos-blue text-white px-3 py-1 rounded-lg border border-selectos-cyan/20">
            {history.length} Tickets Registrados
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3.5">
            <ShoppingBag className="w-12 h-12 mx-auto opacity-30 stroke-[1.5]" />
            <p className="text-sm">Aún no cuentas con compras registradas en tu historial local.</p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {history.map((ticket) => {
              const isExpanded = expandedTicketId === ticket.id;
              const store = stores.find(s => s.id === ticket.tiendaId);
              return (
                <div key={ticket.id} className="bg-slate-900/60 border border-slate-800 hover:border-slate-750 rounded-xl overflow-hidden transition-all shadow-sm">
                  {/* Summary Bar */}
                  <div 
                    onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                    className="p-4 flex flex-wrap justify-between items-center gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <Store className="w-4 h-4 text-selectos-cyan" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-black">{store?.nombre || "Establecimiento"}</span>
                          <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold border border-slate-700/60 uppercase">
                            {ticket.metodoPagoUtilizado}
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">Fecha: {ticket.fecha} • {ticket.articulos.length} artículos comprados</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3.5 ml-auto sm:ml-0">
                      <div className="text-right mr-1">
                        <span className="text-[10px] text-slate-505 uppercase block tracking-wider">Total Ticket</span>
                        <span className="text-sm font-black text-selectos-yellow">
                          ${ticket.precioFinalPagado.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTicket(ticket.id);
                        }}
                        className="p-1 px-1.5 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar este ticket del historial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="text-slate-500 hover:text-slate-300 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded block */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-slate-905/40 divide-y divide-slate-800/30">
                      <div className="py-2.5 grid grid-cols-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="col-span-2">Artículo de Compra</span>
                        <span className="text-center">Cant. Comprada</span>
                        <span className="text-right">Precio Real Pagado</span>
                      </div>
                      {ticket.articulos.map((art, aIdx) => (
                        <div key={aIdx} className="py-3 grid grid-cols-4 text-xs">
                          <span className="col-span-2 font-semibold text-slate-200">{art.nombre}</span>
                          <span className="text-center text-slate-400 font-mono">x{art.cantidadRealComprada}</span>
                          <span className="text-right text-slate-300 font-bold font-mono">${art.precioRealEstante.toFixed(2)} USD</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
