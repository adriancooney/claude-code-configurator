"use client";

import { Box, Flex, Select, Text } from "@radix-ui/themes";
import type { Permissions, PermissionMode } from "../lib/schema";
import { PERMISSION_MODES } from "../lib/schema";
import { getPackRules } from "../lib/packs";
import { RuleList, ALLOW_QUICK_ACTIONS, DENY_QUICK_ACTIONS } from "./RuleList";
import { PackSelector } from "./PackSelector";
import { WebPackSelector } from "./WebPackSelector";
import { ExternalLink } from "./ExternalLink";

interface PermissionsSectionProps {
	permissions: Permissions;
	onChange: (permissions: Permissions) => void;
}

export function PermissionsSection({ permissions, onChange }: PermissionsSectionProps) {
	const allAllowRules = permissions.allow || [];
	const packRules = getPackRules(allAllowRules);
	const nonPackAllowRules = allAllowRules.filter(r => !packRules.has(r));

	const handleAllowChange = (newNonPackRules: string[]) => {
		const packRulesArray = allAllowRules.filter(r => packRules.has(r));
		onChange({ ...permissions, allow: [...packRulesArray, ...newNonPackRules] });
	};

	return (
		<Flex direction="column" gap="5">
			<Text size="2" color="gray">
				Control which actions Claude can perform automatically, which require confirmation, and which are blocked entirely.{" "}
				<ExternalLink href="https://code.claude.com/docs/en/settings#permissions">
					Learn more
				</ExternalLink>
			</Text>

			<Box>
				<Flex direction="column" gap="1" mb="2">
					<Text as="label" size="2" weight="medium">
						Default Mode
					</Text>
					<Text size="1" color="gray">
						How Claude handles tool permissions when no specific rule matches.
					</Text>
				</Flex>
				<Select.Root
					value={permissions.defaultMode || "default"}
					onValueChange={(value) =>
						onChange({ ...permissions, defaultMode: value as PermissionMode })
					}
				>
					<Select.Trigger style={{ width: "100%" }} />
					<Select.Content>
						{PERMISSION_MODES.map((mode) => (
							<Select.Item key={mode.value} value={mode.value}>
								{mode.label} <Text color="gray" ml="2">{mode.description}</Text>
							</Select.Item>
						))}
					</Select.Content>
				</Select.Root>
			</Box>

			<RuleList
				label="Allow Rules"
				description="Patterns for actions that are automatically approved without prompting."
				rules={nonPackAllowRules}
				onChange={handleAllowChange}
				placeholder="e.g., Bash(npm *), Read(**/*.ts)"
				quickActions={ALLOW_QUICK_ACTIONS}
			/>

			<RuleList
				label="Deny Rules"
				description="Patterns for actions that are always blocked, even if they match an allow rule."
				rules={permissions.deny || []}
				onChange={(deny) => onChange({ ...permissions, deny })}
				placeholder="e.g., Bash(rm -rf *), Read(~/.ssh/*)"
				quickActions={DENY_QUICK_ACTIONS}
			/>

			<RuleList
				label="Ask Rules"
				description="Patterns for actions that require explicit confirmation each time."
				rules={permissions.ask || []}
				onChange={(ask) => onChange({ ...permissions, ask })}
				placeholder="e.g., Bash(git push *)"
			/>

			<Box
				style={{
					background: "var(--violet-a3)",
					borderRadius: "var(--radius-3)",
					padding: "var(--space-4)",
				}}
			>
				<PackSelector
					rules={permissions.allow || []}
					onChange={(allow) => onChange({ ...permissions, allow })}
				/>
			</Box>

			<Box
				style={{
					background: "var(--violet-a3)",
					borderRadius: "var(--radius-3)",
					padding: "var(--space-4)",
				}}
			>
				<WebPackSelector
					rules={permissions.allow || []}
					onChange={(allow) => onChange({ ...permissions, allow })}
				/>
			</Box>
		</Flex>
	);
}
