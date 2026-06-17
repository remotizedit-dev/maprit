export const agentBranchMap: Record<string, string> = {
  "default_agent": "Main Branch",
  "agent_3601kv308q2jf5m8cagy8v2tfrg9": "Remotized IT Helpdesk",
};

export const getBranchByAgentId = (agentId: string): string => {
  return agentBranchMap[agentId] || "Unknown Branch";
};
