import React from 'react';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-brand-500/30">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="font-bold text-white text-lg">K</span>
             </div>
             <div>
               <h1 className="font-bold text-lg text-slate-100 tracking-tight">Kasparro Agentic Analyst</h1>
               <p className="text-xs text-slate-500 font-medium">Automated Facebook Ads Diagnostics</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               System Online
            </span>
            <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">v1.0.0</span>
          </div>
        </div>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;