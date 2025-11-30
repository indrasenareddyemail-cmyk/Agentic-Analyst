import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { AggregatedStats } from '../types';

interface DataVisualizerProps {
  trendData: any[];
  campaignStats: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-lg text-xs text-white">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ trendData, campaignStats }) => {
  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h3 className="text-slate-300 text-sm font-semibold mb-4">Spend vs ROAS (Last 30 Days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                tickFormatter={(value) => value.slice(5)} // Show MM-DD
                stroke="#475569"
              />
              <YAxis yAxisId="left" tick={{fontSize: 10, fill: '#94a3b8'}} stroke="#475569" />
              <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: '#94a3b8'}} stroke="#475569" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize: '12px'}} />
              <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} dot={false} name="Spend ($)" />
              <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#10b981" strokeWidth={2} dot={false} name="ROAS" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Bar Chart */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h3 className="text-slate-300 text-sm font-semibold mb-4">Campaign Performance</h3>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={150} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
                stroke="#475569"
              />
              <Tooltip cursor={{fill: '#334155'}} content={<CustomTooltip />} />
              <Bar dataKey="roas" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="ROAS" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};