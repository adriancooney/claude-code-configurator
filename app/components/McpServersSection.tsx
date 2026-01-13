"use client";

import { Flex, Switch, Text } from "@radix-ui/themes";
import type { ClaudeCodeSettings } from "../lib/schema";
import { StringListEditor } from "./StringListEditor";
import { ExternalLink } from "./ExternalLink";

interface McpServersSectionProps {
	settings: ClaudeCodeSettings;
	onChange: (settings: ClaudeCodeSettings) => void;
}

export function McpServersSection({ settings, onChange }: McpServersSectionProps) {
	return (
		<Flex direction="column" gap="5">
			<Text size="2" color="gray">
				Configure which MCP (Model Context Protocol) servers Claude Code can connect to.{" "}
				<ExternalLink href="https://code.claude.com/docs/en/mcp">
					Learn more
				</ExternalLink>
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
