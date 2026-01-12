"use client";

import { Box, Flex, IconButton, Switch, Text, TextField } from "@radix-ui/themes";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import type { ClaudeCodeSettings } from "../lib/schema";
import { StringListEditor } from "./StringListEditor";

interface PluginToggleEditorProps {
	plugins: Record<string, boolean>;
	onChange: (plugins: Record<string, boolean>) => void;
}

function PluginToggleEditor({ plugins, onChange }: PluginToggleEditorProps) {
	const [newPlugin, setNewPlugin] = useState("");

	const entries = Object.entries(plugins);

	const addPlugin = () => {
		const trimmed = newPlugin.trim();
		if (trimmed && !(trimmed in plugins)) {
			onChange({ ...plugins, [trimmed]: true });
			setNewPlugin("");
		}
	};

	const removePlugin = (key: string) => {
		const updated = { ...plugins };
		delete updated[key];
		onChange(updated);
	};

	const togglePlugin = (key: string, enabled: boolean) => {
		onChange({ ...plugins, [key]: enabled });
	};

	return (
		<Box>
			<Flex direction="column" gap="1" mb="2">
				<Text as="label" size="2" weight="medium">
					Enabled Plugins
				</Text>
				<Text size="1" color="gray">
					Toggle plugins on or off
				</Text>
			</Flex>
			<Flex direction="column" gap="2">
				{entries.map(([key, enabled]) => (
					<Flex key={key} gap="2" align="center" justify="between">
						<Text size="2" style={{ fontFamily: "monospace", flex: 1 }}>
							{key}
						</Text>
						<Flex gap="2" align="center">
							<Switch
								size="1"
								checked={enabled}
								onCheckedChange={(checked) => togglePlugin(key, checked)}
							/>
							<IconButton size="1" variant="ghost" color="red" onClick={() => removePlugin(key)}>
								<Cross2Icon />
							</IconButton>
						</Flex>
					</Flex>
				))}
				<Flex gap="2">
					<TextField.Root
						size="2"
						placeholder="Plugin name"
						value={newPlugin}
						onChange={(e) => setNewPlugin(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPlugin())}
						style={{ flex: 1, fontFamily: "monospace" }}
					/>
					<IconButton size="2" variant="soft" onClick={addPlugin} disabled={!newPlugin.trim()}>
						<PlusIcon />
					</IconButton>
				</Flex>
			</Flex>
		</Box>
	);
}

interface PluginsSectionProps {
	settings: ClaudeCodeSettings;
	onChange: (settings: ClaudeCodeSettings) => void;
}

export function PluginsSection({ settings, onChange }: PluginsSectionProps) {
	return (
		<Flex direction="column" gap="5">
			<Text size="2" color="gray">
				Configure plugin availability and marketplace preferences.
			</Text>

			<PluginToggleEditor
				plugins={settings.enabledPlugins || {}}
				onChange={(enabledPlugins) =>
					onChange({
						...settings,
						enabledPlugins: Object.keys(enabledPlugins).length > 0 ? enabledPlugins : undefined,
					})
				}
			/>

			<StringListEditor
				label="Skipped Marketplaces"
				description="Marketplaces you've chosen not to install from"
				items={settings.skippedMarketplaces || []}
				onChange={(skippedMarketplaces) =>
					onChange({
						...settings,
						skippedMarketplaces: skippedMarketplaces.length > 0 ? skippedMarketplaces : undefined,
					})
				}
				placeholder="Marketplace name"
			/>

			<StringListEditor
				label="Skipped Plugins"
				description="Plugins you've chosen not to install"
				items={settings.skippedPlugins || []}
				onChange={(skippedPlugins) =>
					onChange({
						...settings,
						skippedPlugins: skippedPlugins.length > 0 ? skippedPlugins : undefined,
					})
				}
				placeholder="Plugin name"
			/>
		</Flex>
	);
}
