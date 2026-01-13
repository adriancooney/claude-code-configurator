"use client";

import { Box, Flex, Select, Switch, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import type { ClaudeCodeSettings } from "../lib/schema";
import { ExternalLink } from "./ExternalLink";

const MODELS = [
	{ value: "__default__", label: "Default (no override)", token: null },
	{ value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5", token: "claude-sonnet-4-5" },
	{ value: "claude-opus-4-5", label: "Claude Opus 4.5", token: "claude-opus-4-5" },
	{ value: "claude-haiku-4-5", label: "Claude Haiku 4.5", token: "claude-haiku-4-5" },
	{ value: "claude-sonnet-4-0", label: "Claude Sonnet 4", token: "claude-sonnet-4-0" },
	{ value: "claude-opus-4-0", label: "Claude Opus 4", token: "claude-opus-4-0" },
	{ value: "claude-opus-4-1", label: "Claude Opus 4.1", token: "claude-opus-4-1" },
	{ value: "custom", label: "Custom...", token: null },
];

const OUTPUT_STYLES = [
	{ value: "__default__", label: "Default", description: "Concise, direct responses" },
	{ value: "explanatory", label: "Explanatory", description: "More detailed with context" },
	{ value: "learning", label: "Learning", description: "Educational explanations" },
	{ value: "custom", label: "Custom..." },
];

interface GeneralSectionProps {
	settings: ClaudeCodeSettings;
	onChange: (settings: ClaudeCodeSettings) => void;
}

export function GeneralSection({ settings, onChange }: GeneralSectionProps) {
	const currentModel = settings.model || "";
	const isCustomModel = currentModel && !MODELS.some((m) => m.value === currentModel && m.value !== "custom");
	const [showCustomModelInput, setShowCustomModelInput] = useState(isCustomModel);

	const currentOutputStyle = settings.outputStyle || "";
	const isCustomOutputStyle = currentOutputStyle && !OUTPUT_STYLES.some((s) => s.value === currentOutputStyle && s.value !== "custom");
	const [showCustomOutputStyleInput, setShowCustomOutputStyleInput] = useState(isCustomOutputStyle);

	const handleModelChange = (value: string) => {
		if (value === "custom") {
			setShowCustomModelInput(true);
		} else {
			setShowCustomModelInput(false);
			onChange({ ...settings, model: value === "__default__" ? undefined : value });
		}
	};

	const handleOutputStyleChange = (value: string) => {
		if (value === "custom") {
			setShowCustomOutputStyleInput(true);
		} else {
			setShowCustomOutputStyleInput(false);
			onChange({ ...settings, outputStyle: value === "__default__" ? undefined : value });
		}
	};

	const modelSelectValue = showCustomModelInput ? "custom" : (currentModel || "__default__");
	const outputStyleSelectValue = showCustomOutputStyleInput ? "custom" : (currentOutputStyle || "__default__");

	return (
		<Flex direction="column" gap="5">
			<Text size="2" color="gray">
				Configure model, output style, and general behavior.
			</Text>

			<Box>
				<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
					Model Override
				</Text>
				<Flex direction="column" gap="2">
					<Select.Root value={modelSelectValue} onValueChange={handleModelChange}>
						<Select.Trigger style={{ width: "100%" }} />
						<Select.Content>
							{MODELS.map((model) => (
								<Select.Item key={model.value} value={model.value}>
									{model.label}
									{model.token && <code style={{ opacity: 0.7, marginLeft: 8 }}>{model.token}</code>}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
					{showCustomModelInput && (
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
					Override the default AI model used by Claude Code.{" "}
					<ExternalLink href="https://platform.claude.com/docs/en/about-claude/models/overview">
						View available models
					</ExternalLink>
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

			<Box>
				<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
					Output Style
				</Text>
				<Flex direction="column" gap="2">
					<Select.Root value={outputStyleSelectValue} onValueChange={handleOutputStyleChange}>
						<Select.Trigger style={{ width: "100%" }} />
						<Select.Content>
							{OUTPUT_STYLES.map((style) => (
								<Select.Item key={style.value} value={style.value}>
									{style.label}
									{style.description && <span style={{ opacity: 0.7, marginLeft: 8 }}>— {style.description}</span>}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
					{showCustomOutputStyleInput && (
						<TextField.Root
							placeholder="Enter custom output style..."
							value={settings.outputStyle || ""}
							onChange={(e) =>
								onChange({ ...settings, outputStyle: e.target.value || undefined })
							}
						/>
					)}
				</Flex>
				<Text size="1" color="gray" mt="1">
					Controls the style of Claude's responses.{" "}
					<ExternalLink href="https://code.claude.com/docs/en/output-styles">
						Learn more
					</ExternalLink>
				</Text>
			</Box>

			<Box>
				<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
					Status Line Command
				</Text>
				<TextField.Root
					placeholder="e.g., ~/.claude/statusline.sh"
					value={settings.statusLine?.command || ""}
					onChange={(e) =>
						onChange({
							...settings,
							statusLine: e.target.value
								? { type: "command", command: e.target.value, padding: settings.statusLine?.padding }
								: undefined,
						})
					}
					style={{ fontFamily: "monospace" }}
				/>
				<Text size="1" color="gray" mt="1">
					Custom command to display in the status line.{" "}
					<ExternalLink href="https://code.claude.com/docs/en/statusline">
						Learn more
					</ExternalLink>
				</Text>
			</Box>

		</Flex>
	);
}
