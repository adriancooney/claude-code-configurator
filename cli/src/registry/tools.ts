export interface ToolDefinition {
  name: string;
  detect: string;
  install: {
    darwin?: string;
    linux?: string;
    win32?: string;
  };
  description?: string;
}

export interface McpServerDefinition {
  name: string;
  instructions: string;
  url?: string;
}

export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    name: "dcg",
    detect: "which dcg",
    install: {
      darwin: 'curl -fsSL "https://raw.githubusercontent.com/adriancooney/claude-code-configurator/refs/heads/main/install.sh" | bash',
      linux: 'curl -fsSL "https://raw.githubusercontent.com/adriancooney/claude-code-configurator/refs/heads/main/install.sh" | bash',
    },
    description: "Destructive Command Guard - blocks dangerous commands",
  },
];

export const MCP_SERVER_REGISTRY: McpServerDefinition[] = [
  {
    name: "next-devtools",
    instructions: "Install Next.js 16+ and run 'next dev' - MCP is enabled by default",
    url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/devTools",
  },
];
