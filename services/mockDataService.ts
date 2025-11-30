import { AdCampaignData } from '../types';

const CAMPAIGNS = [
  { name: 'Prospecting_Broad_US', type: 'broad' },
  { name: 'Retargeting_Visitors_30D', type: 'retargeting' },
  { name: 'LAL_1pct_Purchasers', type: 'lookalike_1pct' },
];

const CREATIVES = [
  { msg: "Get 50% Off - Limited Time Only!", type: 'image' },
  { msg: "The Solution You've Been Waiting For.", type: 'video' },
  { msg: "Why 10,000+ Customers Love Us.", type: 'carousel' },
  { msg: "Stop Wasting Time. Start Saving Today.", type: 'image' },
];

export const generateMockData = (days = 30): AdCampaignData[] => {
  const data: AdCampaignData[] = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    CAMPAIGNS.forEach((camp) => {
      // Simulate a "fatigue" curve: performance drops as time goes on for some
      const isFatigued = i < 10 && camp.name === 'Prospecting_Broad_US'; 
      const fatigueFactor = isFatigued ? 0.6 : 1.0; 
      
      const baseSpend = Math.floor(Math.random() * 500) + 200;
      const cpm = 20 + Math.random() * 5;
      const impressions = Math.floor((baseSpend / cpm) * 1000);
      
      // CTR calculation with fatigue
      let ctr = 0.015 + (Math.random() * 0.01);
      if (camp.name === 'Prospecting_Broad_US') ctr *= fatigueFactor;

      const clicks = Math.floor(impressions * ctr);
      
      // Conversion Rate
      const cvr = 0.02 + (Math.random() * 0.01);
      const purchases = Math.floor(clicks * cvr);
      
      // AOV
      const aov = 60 + (Math.random() * 20);
      const revenue = purchases * aov;

      data.push({
        date: dateStr,
        campaign_name: camp.name,
        adset_name: `${camp.name}_AdSet_1`,
        spend: Number(baseSpend.toFixed(2)),
        impressions,
        clicks,
        purchases,
        revenue: Number(revenue.toFixed(2)),
        ctr: Number(ctr.toFixed(4)),
        roas: Number((revenue / baseSpend).toFixed(2)),
        cpa: purchases > 0 ? Number((baseSpend / purchases).toFixed(2)) : 0,
        creative_type: CREATIVES[Math.floor(Math.random() * CREATIVES.length)].type as any,
        creative_message: CREATIVES[Math.floor(Math.random() * CREATIVES.length)].msg,
        audience_type: camp.type as any,
      });
    });
  }

  return data;
};

// Simple aggregation for the agents
export const aggregateDataForAgent = (data: AdCampaignData[]) => {
  // Group by Date
  const byDate = data.reduce((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = { date: curr.date, spend: 0, revenue: 0, roas: 0 };
    }
    acc[curr.date].spend += curr.spend;
    acc[curr.date].revenue += curr.revenue;
    return acc;
  }, {} as Record<string, any>);

  const trendData = Object.values(byDate).map((d: any) => ({
    date: d.date,
    spend: Math.round(d.spend),
    revenue: Math.round(d.revenue),
    roas: Number((d.revenue / d.spend).toFixed(2))
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Top Performing Campaigns
  const byCampaign = data.reduce((acc, curr) => {
     if (!acc[curr.campaign_name]) {
       acc[curr.campaign_name] = { name: curr.campaign_name, spend: 0, revenue: 0, clicks: 0, impressions: 0 };
     }
     acc[curr.campaign_name].spend += curr.spend;
     acc[curr.campaign_name].revenue += curr.revenue;
     acc[curr.campaign_name].clicks += curr.clicks;
     acc[curr.campaign_name].impressions += curr.impressions;
     return acc;
  }, {} as Record<string, any>);

  const campaignStats = Object.values(byCampaign).map((c: any) => ({
    name: c.name,
    roas: Number((c.revenue / c.spend).toFixed(2)),
    ctr: Number((c.clicks / c.impressions).toFixed(4))
  }));

  // Identify worst performing creative
  const byCreative = data.reduce((acc, curr) => {
    if (!acc[curr.creative_message]) {
        acc[curr.creative_message] = { msg: curr.creative_message, spend: 0, revenue: 0, clicks: 0, impressions: 0 };
    }
    acc[curr.creative_message].spend += curr.spend;
    acc[curr.creative_message].revenue += curr.revenue;
    acc[curr.creative_message].clicks += curr.clicks;
    acc[curr.creative_message].impressions += curr.impressions;
    return acc;
  }, {} as Record<string, any>);

  const creativeStats = Object.values(byCreative).map((c:any) => ({
      message: c.msg,
      roas: Number((c.revenue / c.spend).toFixed(2)),
      ctr: Number((c.clicks / c.impressions).toFixed(4))
  })).sort((a, b) => a.ctr - b.ctr); // Ascending order (lowest CTR first)

  return {
    trendData,
    campaignStats,
    lowPerformingCreatives: creativeStats.slice(0, 3) // Bottom 3
  };
};