/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Articulo, Categoria, Tienda } from '../types';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  Layers, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  Clock,
  ExternalLink,
  BookOpen,
  Scale
} from 'lucide-react';

interface AsistenteSelectosAIProps {
  activeList: Articulo[];
  categories: Categoria[];
  stores: Tienda[];
}

export default function AsistenteSelectosAI({
  activeList,
  categories,
  stores,
}: AsistenteSelectosAIProps) {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [activeContext, setActiveContext] = useState<string>(''); // 'compare' | 'recipes' | 'chat'
  const [errorMessage, setErrorMessage] = useState<string>('');

  const callAIAPI = async (contextMode: 'compare' | 'recipes' | 'chat', promptText: string = '') => {
    setIsLoading(true);
    setErrorMessage('');
    setActiveContext(contextMode);
    
    try {
      const res = await fetch('/api/asistente-super', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeList,
          userPrompt: promptText,
          contextMode,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error de conexión con el asistente.');
      }

      const data = await res.json();
      setResponse(data.result || 'No se obtuvo respuesta del co-pilot.');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    callAIAPI('chat', userPrompt);
  };

  // Simple and highly robust rendering of Markdown lists, headers, tables, bold text
  const parseMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    return lines.map((line, idx) => {
      // Check for table border row or content row
      if (line.trim().startsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (line.includes('---')) {
          return null; // Skip table border styling
        }
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
          return null;
        } else {
          tableRows.push(cells);
          
          // If this is the last line or the next line isn't a table, render the full table now
          const nextLine = lines[idx + 1];
          if (!nextLine || !nextLine.trim().startsWith('|')) {
            inTable = false;
            const headers = [...tableHeaders];
            const rows = [...tableRows];
            tableHeaders = [];
            tableRows = [];
            return (
              <div key={`table-${idx}`} className="my-4 overflow-x-auto rounded-xl border border-slate-700/80">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-selectos-blue/30 border-b border-slate-700 font-bold text-slate-100">
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} className="p-3 text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 text-slate-300 font-medium">
                            {formatText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          return null;
        }
      }

      // If we got here and was previously inTable but this row isn't a table row, we should close it (safety fallback)
      if (inTable) {
        inTable = false;
      }

      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-selectos-cyan mt-5 mb-2 flex items-center space-x-1.5 uppercase tracking-wide">
            <span className="w-1.5 h-3.5 bg-selectos-cyan rounded-full inline-block"></span>
            <span>{formatText(line.replace('### ', ''))}</span>
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-extrabold text-selectos-yellow mt-6 mb-3 border-b border-slate-800 pb-1 flex items-center space-x-2">
            <Sparkles className="w-4.5 h-4.5 text-selectos-yellow fill-selectos-yellow/20" />
            <span>{formatText(line.replace('## ', ''))}</span>
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-lg font-black text-white mt-8 mb-4 border-l-4 border-selectos-blue pl-3">
            {formatText(line.replace('# ', ''))}
          </h2>
        );
      }

      // Unordered lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const cleanedLine = line.trim().substring(2);
        return (
          <div key={idx} className="flex items-start space-x-2.5 my-1.5 ml-3">
            <CheckCircle2 className="w-4 h-4 text-selectos-green mt-0.5 shrink-0" />
            <span className="text-xs text-slate-300 leading-relaxed">{formatText(cleanedLine)}</span>
          </div>
        );
      }

      // Numbered lists
      const numberedRegex = /^\d+\.\s(.*)/;
      if (numberedRegex.test(line.trim())) {
        const match = line.trim().match(numberedRegex);
        return (
          <div key={idx} className="flex items-start space-x-2.5 my-2 ml-1">
            <span className="bg-selectos-blue/40 text-selectos-cyan text-[10px] font-black h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border border-selectos-blue/30">
              {line.trim().split('.')[0]}
            </span>
            <span className="text-xs text-slate-300 leading-relaxed font-medium">{formatText(match ? match[1] : '')}</span>
          </div>
        );
      }

      // Spacer line
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }

      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1.5">
          {formatText(line)}
        </p>
      );
    });
  };

  // Internal text styling for bold (**text**)
  const formatText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-extrabold text-white text-semibold text-selectos-yellow">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Banners - Súper Selectos Style */}
      <div className="bg-gradient-to-r from-selectos-navy via-selectos-blue to-blue-900 border border-selectos-blue/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Glow effect */}
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-selectos-cyan/15 rounded-full blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-60 h-60 bg-selectos-yellow/10 rounded-full blur-3xl" />
        
        {/* Left header context with yellow star tags */}
        <div className="space-y-2 max-w-xl z-10 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-selectos-yellow px-2 md:px-3 py-1 rounded-full text-[10px] font-black text-selectos-navy uppercase tracking-wider flex items-center space-x-1 shadow-md">
              <span>★</span>
              <span>Súper Co-Pilot AI</span>
            </span>
            <span className="bg-slate-900/60 border border-slate-700/60 px-2.5 py-1 rounded-full text-[9px] font-bold text-slate-300 flex items-center">
              <Clock className="w-3 h-3 text-emerald-400 mr-1 animate-pulse" />
              Precios El Salvador (USD)
            </span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Optimiza tu lista de <span className="text-selectos-yellow underline decoration-selectos-cyan decoration-2 underline-offset-4">Forma Inteligente</span>
          </h2>
          <p className="text-xs text-slate-200/90 leading-relaxed max-w-lg">
            Determina de forma inteligente en qué súper salvadoreño rinde más tu dinero, planifica cenas tradicionales de bajo costo y aprovecha los días de descuento bancario.
          </p>
        </div>

        {/* Right side banner button actions */}
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
          <button
            onClick={() => callAIAPI('compare')}
            disabled={isLoading}
            className="flex-1 sm:flex-none bg-selectos-yellow hover:bg-yellow-400 text-selectos-navy font-extrabold text-xs px-4 py-3 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-yellow-500/10 flex items-center justify-center space-x-2"
          >
            <Scale className="w-4 h-4" />
            <span>Comparar Precios Súper</span>
          </button>
          
          <button
            onClick={() => callAIAPI('recipes')}
            disabled={isLoading}
            className="flex-1 sm:flex-none bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-md flex items-center justify-center space-x-2"
          >
            <BookOpen className="w-4 h-4 text-selectos-cyan" />
            <span>Recetas Tipicas Baratas</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Parameters, Active List snapshot, Custom Chat prompt */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Snapshot of planning list */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4.5 h-4.5 text-selectos-cyan" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Tu Lista Activa ({activeList.length})</h3>
              </div>
              <span className="text-[10px] bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full">
                ${activeList.reduce((sum, item) => sum + (item.cantidadPlanificada * item.precioEstimadoUnitario), 0).toFixed(2)} USD
              </span>
            </div>

            {activeList.length === 0 ? (
              <div className="py-4 text-center text-slate-500 space-y-1">
                <p className="text-xs font-semibold">No hay artículos cargados</p>
                <p className="text-[10px]">Agrega productos en "Planear Lista" para analizarlos.</p>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {activeList.map((item) => (
                  <div key={item.id} className="bg-slate-950/50 p-2 rounded-xl flex items-center justify-between border border-slate-800/40">
                    <div>
                      <p className="text-xs font-bold text-slate-200 truncate max-w-[140px]">{item.nombre}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Cant: {item.cantidadPlanificada} • Cat: {categories.find(c => c.id === item.categoriaId)?.nombre || 'General'}</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/10">
                      ${(item.cantidadPlanificada * item.precioEstimadoUnitario).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom chat query */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-selectos-yellow" />
              <span>Consulta Directa al Co-Pilot</span>
            </h3>
            
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Haz consultas personalizadas sobre compras, métodos de pago, recetas con sobras o si conviene comprar en un súper puntual de El Salvador.
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Ej: ¿Cuáles pupusas salen más baratas de preparar para 5 personas? o ¿Cómo funciona el descuento los miércoles de súper?"
                className="w-full h-24 p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-selectos-blue placeholder-slate-500 resize-none"
              />
              <button
                type="submit"
                disabled={isLoading || !userPrompt.trim()}
                className="w-full bg-selectos-blue hover:bg-blue-600 disabled:bg-slate-800 text-white font-extrabold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-md"
              >
                {isLoading && activeContext === 'chat' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-white" />
                )}
                <span>Preguntar al Asistente</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: AI Board outputs */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl min-h-[420px] overflow-hidden flex flex-col">
            
            {/* Header board */}
            <div className="bg-slate-900 p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-selectos-green animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Tablero de Respuestas Inteligentes</span>
              </div>
              
              {activeContext && (
                <span className="text-[10px] font-bold text-selectos-cyan bg-selectos-blue/20 border border-selectos-blue/30 px-2.5 py-0.5 rounded-full uppercase">
                  {activeContext === 'compare' ? 'Comparar Tiendas' : activeContext === 'recipes' ? 'Sugerencia: Recetas' : 'Chat Personalizado'}
                </span>
              )}
            </div>

            {/* Response area */}
            <div className="p-5 flex-grow overflow-y-auto">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center py-16 space-y-4"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-selectos-blue/20 border-t-4 border-t-selectos-yellow animate-spin" />
                      <Sparkles className="w-5 h-5 text-selectos-cyan absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="text-center space-y-1 max-w-sm">
                      <p className="text-xs font-semibold text-slate-200">Consultando Base Inteligente El Salvador...</p>
                      <p className="text-[10px] text-slate-500 italic">
                        {activeContext === 'compare' 
                          ? 'Calculando canastas para Súper del País, Don Juan, Despensa Familiar y PriceSmart...' 
                          : activeContext === 'recipes' 
                          ? 'Ideando pupuserías y almuerzos típicos económicos con ingredientes locales...' 
                          : 'Procesando consulta de ahorro...'}
                      </p>
                    </div>
                  </motion.div>
                ) : errorMessage ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl flex items-start space-x-3 text-xs text-rose-300"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                    <div className="space-y-1">
                      <p className="font-bold">Error del Asistente</p>
                      <p>{errorMessage}</p>
                      <p className="text-[10px] text-rose-450 mt-1">Sugerencia: Asegúrate de tener tu clave API configurada y que el servidor se encuentre encendido.</p>
                    </div>
                  </motion.div>
                ) : response ? (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1 text-slate-200"
                  >
                    {parseMarkdown(response)}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-500 max-w-md mx-auto space-y-4"
                  >
                    <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                      <Sparkles className="w-7 h-7 text-selectos-yellow animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-350">Tu Co-Pilot AI está Listo</p>
                      <p className="text-[10px] leading-relaxed">
                        Haz clic en cualquiera de los botones de arriba o escribe una consulta abajo. El asistente analizará los artículos en tu lista activa y te dará estimaciones detalladas simuladas del mercado salvadoreño.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] w-full pt-2">
                      <div className="border border-slate-800 p-2.5 rounded-xl bg-slate-950/30">
                        <TrendingDown className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <span className="font-semibold block text-slate-300">Descuentos BAC</span>
                        <span>Estimaciones con el 7% de descuento bancario general.</span>
                      </div>
                      <div className="border border-slate-800 p-2.5 rounded-xl bg-slate-950/30">
                        <Scale className="w-4 h-4 text-selectos-cyan mx-auto mb-1" />
                        <span className="font-semibold block text-slate-300">Compare Súper</span>
                        <span>Análisis simulado en tiempo real de cadenas líderes.</span>
                      </div>
                    </div>
                  </motion.div>
                )}
               </AnimatePresence>
             </div>
 
             {/* Custom Banner Brand Seal inside Response */}
             <div className="bg-slate-900 px-4 py-2 text-[9px] text-slate-500 border-t border-slate-800/80 text-right">
               Powered by Gemini 3.5-flash & Mi Súper Intelligent Engines
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
