import React, { useEffect, useRef } from 'react';
import { AgentLog, AgentType, AgentStatus } from '../types';
import { 
  BeakerIcon, 
  CpuChipIcon, 
  DocumentChartBarIcon, 
  PaintBrushIcon 
} from '@heroicons/react/24/outline';

const AgentIcon = ({ type }: { type: AgentType }) => {
  switch (type) {
    case AgentType.PLANNER: return <CpuChipIcon className="w-4 h-4" />;
    case AgentType.DATA_ANALYST: return <DocumentChartBarIcon className="w-4 h-4" />;
    case AgentType.INSIGHT_GENERATOR: return <BeakerIcon className="w-4 h-4" />;
    case AgentType.CREATIVE_DIRECTOR: return <PaintBrushIcon className="w-4 h-4" />;
    default: return <CpuChipIcon className="w-4 h-4" />;
  }
};

const StatusDot = ({ status }: { status: AgentStatus }) => {
  const colors = {
    [AgentStatus.IDLE]: 'bg-slate-600',
    [AgentStatus.WORKING]: 'bg-amber-400 animate-pulse',
    [AgentStatus.COMPLETED]: 'bg-emerald-500',
    [AgentStatus.ERROR]: 'bg-rose-500',
  };
  return <div className={`w-2 h-2 rounded-full ${colors[status]} mr-2`} />;
};

interface AgentWorkflowProps {
  logs: AgentLog[];
  isProcessing: boolean;
}

export const AgentWorkflow: React.FC<AgentWorkflowProps> = ({ logs, isProcessing }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0 && !isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
        <CpuChipIcon className="w-8 h-8 mb-2 opacity-50" />
        <p>System Idle. Ready for instructions.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-300 font-semibold text-sm">Agent Activity Log</h3>
        {isProcessing && <span className="text-xs text-amber-400 font-mono animate-pulse">SYSTEM ACTIVE</span>}
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="bg-slate-800 border border-slate-700 p-3 rounded-md text-sm shadow-sm animate-fadeIn">
             <div className="flex items-center justify-between mb-1">
               <div className="flex items-center text-xs font-bold text-slate-300 uppercase tracking-wide">
                 <StatusDot status={log.status} />
                 <span className="mr-2">{log.agent.replace('_', ' ')}</span>
                 <AgentIcon type={log.agent} />
               </div>
               <span className="text-xs text-slate-500 font-mono">
                 {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
               </span>
             </div>
             <p className="text-slate-400 pl-4">{log.message}</p>
             {log.details && typeof log.details === 'object' && (
                <div className="mt-2 ml-4 p-2 bg-slate-900/50 rounded text-xs font-mono text-emerald-400 overflow-x-auto">
                   <pre>{JSON.stringify(log.details, null, 2)}</pre>
                </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};