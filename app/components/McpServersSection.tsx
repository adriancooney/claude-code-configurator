"use client";

import { Flex, Link, Switch, Text } from "@radix-ui/themes";
import type { ClaudeCodeSettings } from "../lib/schema";
import { StringListEditor } from "./StringListEditor";

interface McpServersSectionProps {
	settings: ClaudeCodeSettings;
	onChange: (settings: ClaudeCodeSettings) => void;
}

export function McpServersSection({ settings, onChange }: McpServersSectionProps) {
	return (
		<Flex direction="column" gap="5">
			<Text size="2" color="gray">
				Configure which MCP (Model Context Protocol) servers Claude Code can connect to.{" "}
				<Link href="https://docs.anthropic.com/en/docs/claude-code/mcp" target="_blank" rel="noopener noreferrer">
					Learn more
				</Link>
			</Text>

			<Flex justify="between" align="center">
				<Flex direction="column" gap="1">
					<Text size="2" weight="medium">
						Enable All Project MCP Servers
					</Text>
					<Text size="1" color="gray">
						Automatically approve all MCP servers defined in project configuration
					</Text>
				</Flex>
				<Switch
					checked={settings.enableAllProjectMcpServers ?? false}
					onCheckedChange={(enableAllProjectMcpServers) =>
						onChange({ ...settings, enableAllProjectMcpServers })
					}
				/>
			</Flex>

			<StringListEditor
				label="Enabled MCP Servers"
				description="List of MCP server names that are approved for use"
				items={settings.enabledMcpjsonServers || []}
				onChange={(enabledMcpjsonServers) =>
					onChange({ ...settings, enabledMcpjsonServers })
				}
				placeholder="e.g., filesystem, github"
			/>

			<StringListEditor
				label="Disabled MCP Servers"
				description="List of MCP server names that are blocked from use"
				items={settings.disabledMcpjsonServers || []}
				onChange={(disabledMcpjsonServers) =>
					onChange({ ...settings, disabledMcpjsonServers })
				}
				placeholder="e.g., untrusted-server"
			/>
		</Flex>
	);
}
