import {
  TOOL_REGISTRY,
  MCP_SERVER_REGISTRY,
  type ToolDefinition,
  type McpServerDefinition,
} from "./tools.js";

export type { ToolDefinition, McpServerDefinition };

export function lookupTool(name: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((t) => t.name === name);
}

export function lookupMcpServer(name: string): McpServerDefinition | undefined {
  return MCP_SERVER_REGISTRY.find((s) => s.name === name);
}

export function getAllTools(): ToolDefinition[] {
  return [...TOOL_REGISTRY];
}

export function getAllMcpServers(): McpServerDefinition[] {
  return [...MCP_SERVER_REGISTRY];
}
