import React, { useState, useEffect } from 'react';
import { generateMockData, aggregateDataForAgent } from '../services/mockDataService';
import { runAgentSimulation } from '../services/geminiService';
import { AdCampaignData, AgentLog, AnalysisSession, InsightResult, CreativeRecommendation } from '../types';
import { AgentWorkflow } from './AgentWorkflow';
import { DataVisualizer } from './DataVisualizer';
import { 
  PlayIcon, 
  ArrowPathIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<AdCampaignData[]>([]);
  const [aggregated, setAggregated] = useState<any>(null);
  const [query, setQuery] = useState('Analyze the drop in ROAS over the last 7 days.');
  const [session, setSession] = useState<AnalysisSession>({
    id: 'init',
    query: '',
    logs: [],
    insights: [],
    recommendations: [],
    isProcessing: false
  });

  useEffect(() => {
    // Initial Load
    const rawData = generateMockData(30);
    setData(rawData);
    setAggregated(aggregateDataForAgent(rawData));
  }, []);

  const handleRunAnalysis = async () => {
    if (!query.trim() || session.isProcessing) return;

    // Reset session for new run
    setSession(prev => ({
      ...prev,
      query,
      logs: [],
      insights: [],
      recommendations: [],
      isProcessing: true
    }));

    try {
      const result = await runAgentSimulation(
        query,
        aggregated,
        (log: AgentLog) => {
          setSession(prev => ({
            ...prev,
            logs: [...prev.logs, log]
          }));
        }
      );

      setSession(prev => ({
        ...prev,
        insights: result.insights,
        recommendations: result.recommendations,
        isProcessing: false
      }));

    } catch (error) {
      console.error(error);
      setSession(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const regenerateData = () => {
    const rawData = generateMockData(30);
    setData(rawData);
    setAggregated(aggregateDataForAgent(rawData));
    setSession({
        id: Date.now().toString(),
        query: '',
        logs: [],
        insights: [],
        recommendations: [],
        isProcessing: false
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full p-6">
      
      {/* LEFT COLUMN: Data & Visuals */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
             <p className="text-slate-400 text-xs uppercase font-bold">Total Spend</p>
             <p className="text-2xl font-bold text-white mt-1">
               ${aggregated?.trendData.reduce((a:any, b:any) => a + b.spend, 0).toLocaleString()}
             </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
             <p className="text-slate-400 text-xs uppercase font-bold">Total Revenue</p>
             <p className="text-2xl font-bold text-emerald-400 mt-1">
               ${aggregated?.trendData.reduce((a:any, b:any) => a + b.revenue, 0).toLocaleString()}
             </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
             <p className="text-slate-400 text-xs uppercase font-bold">Avg ROAS</p>
             <p className="text-2xl font-bold text-blue-400 mt-1">
               {aggregated ? (aggregated.trendData.reduce((a:any, b:any) => a + b.revenue, 0) / aggregated.trendData.reduce((a:any, b:any) => a + b.spend, 0)).toFixed(2) : '0.00'}
             </p>
          </div>
        </div>

        {/* Charts */}
        {aggregated && (
          <DataVisualizer 
            trendData={aggregated.trendData} 
            campaignStats={aggregated.campaignStats} 
          />
        )}

        {/* Action Bar */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              placeholder="Ask the Agentic Analyst..."
            />
            <button 
              onClick={handleRunAnalysis}
              disabled={session.isProcessing}
              className={`px-6 py-2 rounded font-medium flex items-center gap-2 text-white transition-colors ${session.isProcessing ? 'bg-slate-600 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500'}`}
            >
              {session.isProcessing ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                  <PlayIcon className="w-5 h-5" />
              )}
              Analyze
            </button>
            <button onClick={regenerateData} className="p-2 text-slate-400 hover:text-white" title="Refresh Data">
                <ArrowPathIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Agents & Results */}
      <div className="lg:col-span-5 flex flex-col gap-6 h-[calc(100vh-3rem)] sticky top-6">
        
        {/* Agent Logs */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 flex-1 p-4 overflow-hidden flex flex-col shadow-inner">
           <AgentWorkflow logs={session.logs} isProcessing={session.isProcessing} />
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex-1 overflow-y-auto min-h-[300px]">
          <h3 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
             <SparklesIcon className="w-4 h-4 text-purple-400" />
             Strategic Output
          </h3>

          {!session.insights.length && !session.recommendations.length && (
            <p className="text-slate-500 text-sm italic">Run an analysis to see insights and creative suggestions.</p>
          )}

          <div className="space-y-4">
             {/* Insights Card */}
             {session.insights.map((insight, idx) => (
               <div key={`insight-${idx}`} className="bg-slate-700/50 p-3 rounded border-l-4 border-amber-500">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-slate-200 font-medium text-sm">{insight.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${insight.severity === 'high' ? 'bg-rose-900 text-rose-300' : 'bg-slate-600 text-slate-300'}`}>
                      {insight.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-2 leading-relaxed">{insight.description}</p>
                  <div className="flex gap-3 text-xs font-mono text-slate-500">
                    <span>Metric: <span className="text-slate-300">{insight.metric}</span></span>
                    <span>Change: <span className="text-rose-400">{insight.change}</span></span>
                  </div>
               </div>
             ))}

             {/* Recommendations Card */}
             {session.recommendations.map((rec, idx) => (
               <div key={`rec-${idx}`} className="bg-slate-700/50 p-3 rounded border-l-4 border-emerald-500">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-emerald-400 font-medium text-sm">Creative Recommendation</h4>
                  </div>
                  <div className="text-xs text-slate-400 space-y-2">
                    <p><span className="font-bold text-slate-500 uppercase">Issue:</span> {rec.reasoning}</p>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                       <div className="bg-slate-900/50 p-2 rounded">
                          <span className="block text-[10px] text-slate-500 uppercase">Original</span>
                          <span className="text-rose-300 line-through">{rec.original_message}</span>
                       </div>
                       <div className="bg-emerald-900/20 border border-emerald-900/50 p-2 rounded">
                          <span className="block text-[10px] text-emerald-500 uppercase">Suggested</span>
                          <span className="text-emerald-300 font-medium">{rec.suggested_message}</span>
                       </div>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
};