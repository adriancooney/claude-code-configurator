"use client";

import { Box, Flex, Switch, Text } from "@radix-ui/themes";
import type { Sandbox } from "../lib/schema";
import { RuleList } from "./RuleList";
import { ExternalLink } from "./ExternalLink";

interface SandboxSectionProps {
	sandbox: Sandbox;
	onChange: (sandbox: Sandbox) => void;
}

export function SandboxSection({ sandbox, onChange }: SandboxSectionProps) {
	return (
		<Flex direction="column" gap="5">
			<Text size="2" color="gray">
				The sandbox runs bash commands in an isolated environment (macOS Seatbelt / Linux containers)
				that restricts network access and filesystem writes outside the project directory.{" "}
				<ExternalLink href="https://code.claude.com/docs/en/settings#sandbox-mode">
					Learn more
				</ExternalLink>
			</Text>

			<Flex justify="between" align="center">
				<Flex direction="column" gap="1">
					<Text size="2" weight="medium">
						Enable Sandbox
					</Text>
					<Text size="1" color="gray">
						Run bash commands in an isolated environment with restricted access
					</Text>
				</Flex>
				<Switch
					checked={sandbox.enabled || false}
					onCheckedChange={(enabled) => onChange({ ...sandbox, enabled })}
				/>
			</Flex>

			<Flex justify="between" align="center">
				<Flex direction="column" gap="1">
					<Text size="2" weight="medium">
						Auto-allow Bash if Sandboxed
					</Text>
					<Text size="1" color="gray">
						Skip permission prompts for bash commands when sandbox is enabled
					</Text>
				</Flex>
				<Switch
					checked={sandbox.autoAllowBashIfSandboxed || false}
					onCheckedChange={(autoAllowBashIfSandboxed) =>
						onChange({ ...sandbox, autoAllowBashIfSandboxed })
					}
					disabled={!sandbox.enabled}
				/>
			</Flex>

			<Box>
				<Flex direction="column" gap="1" mb="2">
					<Text size="2" weight="medium">
						Excluded Commands
					</Text>
					<Text size="1" color="gray">
						Commands that run outside the sandbox with full system access.
						Use for commands needing network access (e.g., docker, ssh) or files outside the project.
					</Text>
				</Flex>
				<RuleList
					label=""
					rules={sandbox.excludedCommands || []}
					onChange={(excludedCommands) => onChange({ ...sandbox, excludedCommands })}
					placeholder="e.g., docker, ssh, curl"
					skipValidation
				/>
			</Box>
		</Flex>
	);
}
