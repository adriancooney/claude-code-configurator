"use client";

import {
	AlertDialog,
	Box,
	Button,
	Container,
	Flex,
	Heading,
	Section,
	Separator,
	Text,
} from "@radix-ui/themes";
import { Link } from "@radix-ui/themes";
import { ResetIcon, Share1Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import {
	JsonPreview,
	PermissionsSection,
	SandboxSection,
	GeneralSection,
	McpServersSection,
	HooksSection,
	EnvironmentSection,
	AdvancedSection,
} from "../../components";
import { useSettings, cleanSettings } from "../../lib/settings-context";
import { DEFAULT_SETTINGS } from "../../lib/schema";

export default function SettingsJsonPage() {
	const { settings, updateSettings, handleShare } = useSettings();
	const [resetDialogOpen, setResetDialogOpen] = useState(false);

	return (
		<Flex style={{ flex: 1, overflow: "hidden", height: "100%" }}>
			<Box
				style={{
					flex: 1,
					overflow: "auto",
					padding: "var(--space-6)",
				}}
			>
				<Container size="2">
					<Flex direction="column" gap="5">
						<Section size="1">
							<Flex justify="between" align="center" mb="3">
								<Heading size="3">General Settings</Heading>
								<Flex gap="2">
									<Button variant="soft" color="red" onClick={() => setResetDialogOpen(true)}>
										<ResetIcon />
										Reset
									</Button>
									<Button variant="soft" onClick={handleShare}>
										<Share1Icon />
										Share
									</Button>
								</Flex>
							</Flex>
							<GeneralSection settings={settings} onChange={updateSettings} />
						</Section>

						<Separator size="4" />

						<Section size="1">
							<Heading size="3" mb="3">
								Permissions
							</Heading>
							<PermissionsSection
								permissions={settings.permissions || {}}
								onChange={(permissions) => updateSettings({ ...settings, permissions })}
							/>
						</Section>

						<Separator size="4" />

						<Section size="1">
							<Heading size="3" mb="3">
								Sandbox
							</Heading>
							<SandboxSection
								sandbox={settings.sandbox || {}}
								onChange={(sandbox) => updateSettings({ ...settings, sandbox })}
							/>
						</Section>

						<Separator size="4" />

						<Section size="1">
							<Heading size="3" mb="3">
								MCP Servers
							</Heading>
							<McpServersSection settings={settings} onChange={updateSettings} />
						</Section>

						<Separator size="4" />

						<Section size="1">
							<Heading size="3" mb="3">
								Hooks
							</Heading>
							<HooksSection settings={settings} onChange={updateSettings} />
						</Section>

						<Separator size="4" />

						<Section size="1">
							<Heading size="3" mb="3">
								Environment
							</Heading>
							<EnvironmentSection settings={settings} onChange={updateSettings} />
						</Section>

						<Separator size="4" />

						<Section size="1">
							<AdvancedSection settings={settings} onChange={updateSettings} />
						</Section>

						<Box py="4">
							<Text size="1" color="gray" align="center" as="p">
								Created by{" "}
								<Link href="https://claude.ai/code" target="_blank" rel="noopener noreferrer">
									Claude Code
								</Link>
								{" & "}
								<Link href="https://x.com/adrian_cooney" target="_blank" rel="noopener noreferrer">
									Adrian Cooney
								</Link>
								{" "}&bull;{" "}
								<Link href="https://github.com/adriancooney/claude-code-configurator" target="_blank" rel="noopener noreferrer">
									View source on GitHub
								</Link>
								{" "}&bull;{" "}
								Deployed on{" "}
								<Link href="https://vercel.com" target="_blank" rel="noopener noreferrer">
									Vercel
								</Link>
							</Text>
						</Box>
					</Flex>
				</Container>
			</Box>

			<Box
				style={{
					width: 540,
					borderLeft: "1px solid var(--gray-5)",
					padding: "var(--space-6)",
					background: "var(--gray-2)",
					overflow: "auto",
				}}
			>
				<JsonPreview settings={cleanSettings(settings)} onSettingsChange={updateSettings} />
			</Box>

			<AlertDialog.Root open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
				<AlertDialog.Content maxWidth="400px">
					<AlertDialog.Title>Reset Settings</AlertDialog.Title>
					<AlertDialog.Description size="2">
						This will reset all settings to their defaults.
					</AlertDialog.Description>
					<Flex gap="3" mt="4" justify="end">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button variant="solid" color="red" onClick={() => updateSettings(DEFAULT_SETTINGS)}>
								Reset Settings
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Flex>
	);
}
