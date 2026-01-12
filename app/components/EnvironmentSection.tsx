"use client";

import { Flex, Text } from "@radix-ui/themes";
import type { ClaudeCodeSettings } from "../lib/schema";
import { KeyValueEditor } from "./KeyValueEditor";

interface EnvironmentSectionProps {
	settings: ClaudeCodeSettings;
	onChange: (settings: ClaudeCodeSettings) => void;
}

export function EnvironmentSection({ settings, onChange }: EnvironmentSectionProps) {
	return (
		<Flex direction="column" gap="5">
			<Text size="2" color="gray">
				Configure environment variables for Claude Code sessions.
			</Text>

			<KeyValueEditor
				label="Environment Variables"
				description="Custom environment variables available during Claude Code sessions"
				entries={settings.env || {}}
				onChange={(env) =>
					onChange({ ...settings, env: Object.keys(env).length > 0 ? env : undefined })
				}
				keyPlaceholder="VARIABLE_NAME"
				valuePlaceholder="value"
			/>
		</Flex>
	);
}
