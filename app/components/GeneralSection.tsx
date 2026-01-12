"use client";

import { Box, Button, Flex, Select, Switch, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import type { ClaudeCodeSettings } from "../lib/schema";

const MODELS = [
	{ value: "__default__", label: "Default (no override)" },
	{ value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
	{ value: "claude-opus-4-20250514", label: "Claude Opus 4" },
	{ value: "custom", label: "Custom..." },
];

interface GeneralSectionProps {
	settings: ClaudeCodeSettings;
	onChange: (settings: ClaudeCodeSettings) => void;
}

export function GeneralSection({ settings, onChange }: GeneralSectionProps) {
	const currentModel = settings.model || "";
	const isCustomModel = currentModel && !MODELS.some((m) => m.value === currentModel && m.value !== "custom");
	const [showCustomInput, setShowCustomInput] = useState(isCustomModel);

	const handleModelChange = (value: string) => {
		if (value === "custom") {
			setShowCustomInput(true);
		} else {
			setShowCustomInput(false);
			onChange({ ...settings, model: value === "__default__" ? undefined : value });
		}
	};

	const selectValue = showCustomInput ? "custom" : (currentModel || "__default__");

	return (
		<Flex direction="column" gap="5">
			<Box>
				<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
					Model Override
				</Text>
				<Flex direction="column" gap="2">
					<Select.Root value={selectValue} onValueChange={handleModelChange}>
						<Select.Trigger style={{ width: "100%" }} />
						<Select.Content>
							{MODELS.map((model) => (
								<Select.Item key={model.value} value={model.value}>
									{model.label}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
					{showCustomInput && (
						<TextField.Root
							placeholder="e.g., claude-sonnet-4-20250514"
							value={settings.model || ""}
							onChange={(e) =>
								onChange({ ...settings, model: e.target.value || undefined })
							}
						/>
					)}
				</Flex>
				<Text size="1" color="gray" mt="1">
					Override the default AI model used by Claude Code
				</Text>
			</Box>

			<Box>
				<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
					Cleanup Period (days)
				</Text>
				<TextField.Root
					type="number"
					placeholder="30"
					value={settings.cleanupPeriodDays?.toString() || ""}
					onChange={(e) =>
						onChange({
							...settings,
							cleanupPeriodDays: e.target.value ? Number.parseInt(e.target.value) : undefined,
						})
					}
				/>
				<Text size="1" color="gray" mt="1">
					Days to retain chat transcripts
				</Text>
			</Box>

			<Flex justify="between" align="center">
				<Flex direction="column" gap="1">
					<Text size="2" weight="medium">
						Include Co-Authored-By
					</Text>
					<Text size="1" color="gray">
						Include Claude attribution in git commits
					</Text>
				</Flex>
				<Switch
					checked={settings.includeCoAuthoredBy ?? true}
					onCheckedChange={(includeCoAuthoredBy) =>
						onChange({ ...settings, includeCoAuthoredBy })
					}
				/>
			</Flex>

			<Flex justify="between" align="center">
				<Flex direction="column" gap="1">
					<Text size="2" weight="medium">
						Spinner Tips
					</Text>
					<Text size="1" color="gray">
						Show tips while Claude is thinking
					</Text>
				</Flex>
				<Switch
					checked={settings.spinnerTipsEnabled ?? true}
					onCheckedChange={(spinnerTipsEnabled) =>
						onChange({ ...settings, spinnerTipsEnabled })
					}
				/>
			</Flex>

			<Flex justify="between" align="center">
				<Flex direction="column" gap="1">
					<Text size="2" weight="medium">
						Always Show Thinking
					</Text>
					<Text size="1" color="gray">
						Always display Claude's thinking process
					</Text>
				</Flex>
				<Switch
					checked={settings.alwaysThinkingEnabled ?? false}
					onCheckedChange={(alwaysThinkingEnabled) =>
						onChange({ ...settings, alwaysThinkingEnabled })
					}
				/>
			</Flex>

			<Flex justify="between" align="center">
				<Flex direction="column" gap="1">
					<Text size="2" weight="medium">
						Skip WebFetch Preflight
					</Text>
					<Text size="1" color="gray">
						Skip the HEAD request check before fetching URLs
					</Text>
				</Flex>
				<Switch
					checked={settings.skipWebFetchPreflight ?? false}
					onCheckedChange={(skipWebFetchPreflight) =>
						onChange({ ...settings, skipWebFetchPreflight })
					}
				/>
			</Flex>
		</Flex>
	);
}
