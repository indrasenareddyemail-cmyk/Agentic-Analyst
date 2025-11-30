import { GoogleGenAI, Type } from "@google/genai";
import { 
  SYSTEM_INSTRUCTION_PLANNER, 
  SYSTEM_INSTRUCTION_INSIGHT, 
  SYSTEM_INSTRUCTION_CREATIVE, 
  MODEL_FAST,
  MODEL_CREATIVE
} from '../constants';
import { AgentLog, AgentType, AgentStatus, InsightResult, CreativeRecommendation } from '../types';

const getAiClient = () => {
    // In a real production app, ensure this key is guarded.
    // For this specific environment, we use process.env.API_KEY as per instructions.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const runAgentSimulation = async (
  query: string, 
  dataContext: any,
  onLog: (log: AgentLog) => void
): Promise<{ insights: InsightResult[], recommendations: CreativeRecommendation[] }> => {
  const ai = getAiClient();
  const sessionId = Date.now().toString();

  // --- AGENT 1: PLANNER ---
  onLog({
    id: `log-${Date.now()}-1`,
    agent: AgentType.PLANNER,
    message: "Decomposing user query into analytical subtasks...",
    timestamp: Date.now(),
    status: AgentStatus.WORKING
  });

  let plan: string[] = [];
  try {
    const plannerResponse = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `User Query: "${query}". \n\nCreate a plan to analyze this.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_PLANNER,
        responseMimeType: "application/json",
      }
    });
    
    const parsedPlan = JSON.parse(plannerResponse.text || "{}");
    plan = parsedPlan.plan || ["Analyze global trends", "Check campaign performance"];
    
    onLog({
      id: `log-${Date.now()}-1-done`,
      agent: AgentType.PLANNER,
      message: "Plan generated successfully.",
      timestamp: Date.now(),
      status: AgentStatus.COMPLETED,
      details: { steps: plan }
    });

  } catch (e) {
    console.error("Planner Error", e);
    plan = ["Analyze trend data for anomalies"]; // Fallback
  }

  // --- AGENT 2: DATA AGENT (Simulated) ---
  // In a real system, this would execute SQL or Pandas code. 
  // Here we use the `dataContext` passed from the DataService aggregation.
  onLog({
    id: `log-${Date.now()}-2`,
    agent: AgentType.DATA_ANALYST,
    message: "Executing data retrieval steps...",
    timestamp: Date.now(),
    status: AgentStatus.WORKING
  });

  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing time

  const analysisContext = JSON.stringify(dataContext, null, 2);

  onLog({
    id: `log-${Date.now()}-2-done`,
    agent: AgentType.DATA_ANALYST,
    message: "Data aggregated and structured for analysis.",
    timestamp: Date.now(),
    status: AgentStatus.COMPLETED,
    details: "Processed 30 days of campaign data."
  });

  // --- AGENT 3: INSIGHT GENERATOR ---
  onLog({
    id: `log-${Date.now()}-3`,
    agent: AgentType.INSIGHT_GENERATOR,
    message: "Analyzing patterns to identify root causes...",
    timestamp: Date.now(),
    status: AgentStatus.WORKING
  });

  let insights: InsightResult[] = [];
  try {
    const insightResponse = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Analyze this data summary:\n${analysisContext}\n\nQuery Context: ${query}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_INSIGHT,
        responseMimeType: "application/json",
      }
    });

    const parsedInsights = JSON.parse(insightResponse.text || "{}");
    insights = parsedInsights.insights || [];

    onLog({
      id: `log-${Date.now()}-3-done`,
      agent: AgentType.INSIGHT_GENERATOR,
      message: `Identified ${insights.length} key insights.`,
      timestamp: Date.now(),
      status: AgentStatus.COMPLETED,
      details: insights
    });
  } catch (e) {
     console.error("Insight Error", e);
  }

  // --- AGENT 4: CREATIVE DIRECTOR ---
  onLog({
    id: `log-${Date.now()}-4`,
    agent: AgentType.CREATIVE_DIRECTOR,
    message: "Generating corrective creative assets for low performers...",
    timestamp: Date.now(),
    status: AgentStatus.WORKING
  });

  let recommendations: CreativeRecommendation[] = [];
  try {
    // Filter only low performing creatives from context to send to LLM to save tokens
    const lowPerformers = dataContext.lowPerformingCreatives || [];
    
    if (lowPerformers.length > 0) {
      const creativePrompt = `
        Low Performing Creatives: ${JSON.stringify(lowPerformers)}
        
        Generate improved variations for these.
      `;

      const creativeResponse = await ai.models.generateContent({
        model: MODEL_CREATIVE,
        contents: creativePrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_CREATIVE,
          responseMimeType: "application/json",
        }
      });

      const parsedCreatives = JSON.parse(creativeResponse.text || "{}");
      recommendations = parsedCreatives.recommendations || [];
    }

    onLog({
      id: `log-${Date.now()}-4-done`,
      agent: AgentType.CREATIVE_DIRECTOR,
      message: `Generated ${recommendations.length} new creative concepts.`,
      timestamp: Date.now(),
      status: AgentStatus.COMPLETED,
      details: recommendations
    });

  } catch (e) {
    console.error("Creative Error", e);
  }

  return { insights, recommendations };
};