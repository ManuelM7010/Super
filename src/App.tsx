/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getStores, 
  getCategories, 
  getPayments, 
  getHistory, 
  getActiveList, 
  getActiveStoreId, 
  getMonthlyBudgetGlobal, 
  saveStores, 
  saveActiveList, 
  saveActiveStoreId, 
  saveMonthlyBudgetGlobal,
  saveCategories,
  savePayments
} from './utils/data';
import { Tienda, Categoria, Articulo, CompraHistorica, MetodoPago } from './types';
import BudgetDashboard from './components/BudgetDashboard';
import SideShoppingDesk from './components/SideShoppingDesk';
import SupermarketMode from './components/SupermarketMode';
import CheckoutOptimizer from './components/CheckoutOptimizer';
import InflationAnalytics from './components/InflationAnalytics';
import AsistenteSelectosAI from './components/AsistenteSelectosAI';

import { 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard, 
  LineChart, 
  Sparkles, 
  Layers, 
  ChevronRight,
  Menu,
  X,
  Info,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'asistente_ai', 'pre_compras_budget', 'dia_super', 'asistente_pago', 'graficos'
  const [activeTab, setActiveTab] = useState<string>('pre_compras_budget');

  // Theme state persisted in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('super_theme_v1') as 'light' | 'dark') || 'dark';
  });

  // Apply theme class on body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('super_theme_v1', theme);
  }, [theme]);

  // Core state synced to localStorage
  const [globalBudget, setGlobalBudget] = useState<number>(() => getMonthlyBudgetGlobal());
  const [stores, setStores] = useState<Tienda[]>(() => getStores());
  const [categories, setCategories] = useState<Categoria[]>(() => getCategories());
  const [payments, setPayments] = useState<MetodoPago[]>(() => getPayments());
  const [history, setHistory] = useState<CompraHistorica[]>(() => getHistory());
  const [activeList, setActiveList] = useState<Articulo[]>(() => getActiveList());
  const [activeStoreId, setActiveStoreId] = useState<string>(() => getActiveStoreId());

  // Mobile navigation state
  const [showMobileCarretilla, setShowMobileCarretilla] = useState<boolean>(false);

  // Save changes to local storage reactively
  useEffect(() => {
    saveMonthlyBudgetGlobal(globalBudget);
  }, [globalBudget]);

  useEffect(() => {
    saveStores(stores);
  }, [stores]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    savePayments(payments);
  }, [payments]);

  useEffect(() => {
    saveActiveList(activeList);
  }, [activeList]);

  useEffect(() => {
    saveActiveStoreId(activeStoreId);
  }, [activeStoreId]);

  // Total sums for active feedback
  const cartItemsCount = activeList.filter(item => item.estado === 'en_carrito').length;
  const listItemsCount = activeList.length;
  const activeListEstimate = activeList.reduce((sum, item) => sum + (item.cantidadPlanificada * item.precioEstimadoUnitario), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between">
      
      {/* Top Professional Header Bar - Súper Selectos Theme */}
      <header className="bg-selectos-navy border-b border-selectos-blue sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            {/* Visual Branded Indicator (Súper Selectos Yellow Star + Cart) */}
            <div className="w-10.5 h-10.5 rounded-xl bg-selectos-blue flex items-center justify-center shadow-lg shadow-blue-500/10 border border-selectos-cyan/30 relative">
              <ShoppingCart className="text-white w-5 h-5" />
              <span className="absolute -top-1 -right-1 text-selectos-yellow text-[11px] font-black animate-pulse">★</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center space-x-1.5 uppercase">
                <span className="text-white">MI SÚPER</span>
                <span className="text-selectos-yellow">INTELIGENTE</span>
              </h1>
              <p className="text-[10px] text-slate-300 font-bold tracking-wide uppercase">Workspace de Presupuesto & Co-Pilot AI</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Active Store quick stats */}
            <div className="hidden md:flex text-right flex-col mr-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-black">Presupuesto Mensual</span>
              <span className="text-xs font-black text-selectos-yellow">
                ${globalBudget.toLocaleString('es-SV')} USD
              </span>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            {/* Dynamic Theme Selector */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 px-2.5 rounded-xl text-white hover:text-selectos-yellow bg-slate-900/80 hover:bg-slate-800 border border-selectos-blue hover:border-selectos-cyan transition-all flex items-center space-x-1.5 cursor-pointer shadow-md select-none text-[10px] font-bold uppercase tracking-wider active:scale-95"
              id="theme-toggle-btn"
              title="Alternar entre Tema Claro y Tema Slate Oscuro"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-selectos-yellow" />
                  <span className="hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline">Modo Oscuro</span>
                </>
              )}
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            {/* Offline Shield Indicator */}
            <span className="text-[9px] bg-slate-900/80 border border-selectos-blue text-selectos-cyan font-black px-3 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider shadow-inner">
              <span className="w-1.5 h-1.5 bg-selectos-cyan rounded-full inline-block animate-pulse mr-1" />
              <span>Conexión El Salvador</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Split Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-grow w-full space-y-6">
        
        {/* Banner with Mobile Cart Toggle */}
        <div className="lg:hidden bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-bold">Carretilla:</span>
            <span className="bg-selectos-blue/30 border border-selectos-blue text-selectos-cyan text-xs font-black px-2.5 py-0.5 rounded-full">
              {listItemsCount} Artículos • ${activeListEstimate.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={() => setShowMobileCarretilla(true)}
            className="bg-selectos-yellow hover:bg-yellow-400 text-selectos-navy text-[11px] font-black uppercase px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
          >
            <span>Ver Carretilla</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dual-Pane Grid Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Persistent Side-Desk Basket Panel (Desktop block, Mobile slide-up) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-20">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-1 mb-3 text-center text-[10px] text-slate-450 font-bold flex items-center justify-center space-x-1.5 uppercase tracking-wide">
              <Info className="w-3.5 h-3.5 text-selectos-cyan shrink-0" />
              <span>Agrega y edita aquí • Sincroniza al instante</span>
            </div>
            
            <SideShoppingDesk
              activeList={activeList}
              setActiveList={setActiveList}
              history={history}
              categories={categories}
              stores={stores}
            />
          </div>

          {/* Column 2: Dashboard Workspace and Tab Switcher */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Navigation Tabs bar */}
            <div id="navigation-tabs" className="bg-slate-900 border border-slate-800/80 p-1.5 rounded-2xl flex flex-wrap gap-1.5 shadow-xl">
              
              <button
                onClick={() => setActiveTab('pre_compras_budget')}
                className={`flex-1 min-w-[125px] py-3 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 select-none ${activeTab === 'pre_compras_budget' ? 'bg-selectos-blue text-white shadow-xl border border-selectos-cyan/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'}`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>📊 Presupuesto & Metas</span>
              </button>

              <button
                onClick={() => setActiveTab('dia_super')}
                className={`flex-1 min-w-[125px] py-3 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 select-none relative ${activeTab === 'dia_super' ? 'bg-selectos-blue text-white shadow-xl border border-selectos-cyan/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'}`}
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span>🛍️ Día de Súper</span>
                {cartItemsCount > 0 ? (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold animate-bounce shrink-0">
                    {cartItemsCount}
                  </span>
                ) : null}
              </button>

              <button
                onClick={() => setActiveTab('asistente_pago')}
                className={`flex-1 min-w-[125px] py-3 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 select-none ${activeTab === 'asistente_pago' ? 'bg-selectos-blue text-white shadow-xl border border-selectos-cyan/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'}`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>💳 Optimizar Pago</span>
              </button>

              <button
                onClick={() => setActiveTab('graficos')}
                className={`flex-1 min-w-[125px] py-3 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 select-none ${activeTab === 'graficos' ? 'bg-selectos-blue text-white shadow-xl border border-selectos-cyan/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'}`}
              >
                <LineChart className="w-4 h-4 shrink-0" />
                <span>📈 Inflación & Historial</span>
              </button>

            </div>

            {/* Dynamic Tab Body Rendered with Fade Entrance */}
            <div id="tab-viewport" className="min-h-[460px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  
                  {activeTab === 'pre_compras_budget' && (
                    <BudgetDashboard
                      globalBudget={globalBudget}
                      setGlobalBudget={setGlobalBudget}
                      stores={stores}
                      setStores={setStores}
                      categories={categories}
                      setCategories={setCategories}
                      history={history}
                      setHistory={setHistory}
                      activeList={activeList}
                      setActiveList={setActiveList}
                      activeStoreId={activeStoreId}
                      setActiveStoreId={setActiveStoreId}
                      payments={payments}
                      setPayments={setPayments}
                    />
                  )}

                  {activeTab === 'dia_super' && (
                    <SupermarketMode
                      activeList={activeList}
                      setActiveList={setActiveList}
                      categories={categories}
                      stores={stores}
                      activeStoreId={activeStoreId}
                      setActiveStoreId={setActiveStoreId}
                      onFinishShopping={() => setActiveTab('asistente_pago')}
                    />
                  )}

                  {activeTab === 'asistente_pago' && (
                    <CheckoutOptimizer
                      activeList={activeList}
                      setActiveList={setActiveList}
                      categories={categories}
                      stores={stores}
                      activeStoreId={activeStoreId}
                      payments={payments}
                      history={history}
                      setHistory={setHistory}
                      onCheckoutComplete={() => {
                        setActiveTab('graficos');
                        // Scroll nicely
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}

                  {activeTab === 'graficos' && (
                    <InflationAnalytics
                      history={history}
                      setHistory={setHistory}
                      categories={categories}
                      stores={stores}
                    />
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>

      </main>

      {/* Slide-Up Overlay Sheet Modal for Mobile Carretilla */}
      <AnimatePresence>
        {showMobileCarretilla && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden flex items-end">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-slate-900 border-t border-slate-700/60 rounded-t-3xl w-full max-h-[85vh] overflow-y-auto outline-none shadow-2xl flex flex-col"
            >
              <div className="p-4 bg-selectos-navy flex justify-between items-center border-b border-selectos-blue">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-selectos-yellow animate-pulse" />
                  <span className="text-sm font-black text-white uppercase tracking-wider">Mi Carretilla Salvador</span>
                </div>
                
                <button
                  onClick={() => setShowMobileCarretilla(false)}
                  className="p-1 px-3 bg-slate-800 text-slate-300 font-extrabold text-xs rounded-lg uppercase"
                >
                  Cerrar ✕
                </button>
              </div>

              <div className="p-4 flex-1">
                <SideShoppingDesk
                  activeList={activeList}
                  setActiveList={setActiveList}
                  history={history}
                  categories={categories}
                  stores={stores}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant minimalist footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-5 text-center text-xs text-slate-500 mt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Mi Súper Inteligente • Workspace de El Salvador 2026</span>
          <span className="flex items-center space-x-1.5 hover:text-slate-350 transition cursor-help">
            <Sparkles className="w-3.5 h-3.5 text-selectos-yellow animate-spin" style={{ animationDuration: '4s' }} />
            <span>Optimizador de Canastas de Compra en USD</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
