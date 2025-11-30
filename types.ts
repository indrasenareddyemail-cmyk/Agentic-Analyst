// Data Types
export interface AdCampaignData {
  date: string; // YYYY-MM-DD
  campaign_name: string;
  adset_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  purchases: number;
  revenue: number;
  ctr: number; // calculated as clicks / impressions
  roas: number; // calculated as revenue / spend
  cpa: number; // calculated as spend / purchases
  creative_type: 'image' | 'video' | 'carousel';
  creative_message: string;
  audience_type: 'broad' | 'lookalike_1pct' | 'retargeting';
}

export interface AggregatedStats {
  totalSpend: number;
  totalRevenue: number;
  totalROAS: number;
  totalPurchases: number;
  avgCTR: number;
}

// Agent Types
export enum AgentType {
  PLANNER = 'PLANNER',
  DATA_ANALYST = 'DATA_ANALYST',
  INSIGHT_GENERATOR = 'INSIGHT_GENERATOR',
  CREATIVE_DIRECTOR = 'CREATIVE_DIRECTOR',
}

export enum AgentStatus {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface AgentLog {
  id: string;
  agent: AgentType;
  message: string;
  timestamp: number;
  status: AgentStatus;
  details?: string | object;
}

export interface InsightResult {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  metric: string;
  change: string; // e.g. "-15%"
}

export interface CreativeRecommendation {
  campaign_name: string;
  original_message: string;
  suggested_message: string;
  reasoning: string;
  type: 'headline' | 'cta' | 'body';
}

export interface AnalysisSession {
  id: string;
  query: string;
  logs: AgentLog[];
  insights: InsightResult[];
  recommendations: CreativeRecommendation[];
  isProcessing: boolean;
}