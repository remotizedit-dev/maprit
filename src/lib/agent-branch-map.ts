export const agentBranchMap: Record<string, string> = {
  "default_agent": "Main Branch",
  // Add your ElevenLabs Agent IDs here
};

export const getBranchByAgentId = (agentId: string): string => {
  return agentBranchMap[agentId] || "Unknown Branch";
};
