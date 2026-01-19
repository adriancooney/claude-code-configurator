"use client";

import {
	Box,
	Container,
	Flex,
	Heading,
	Section,
	Separator,
	Text,
} from "@radix-ui/themes";
import { Link } from "@radix-ui/themes";
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

export default function SettingsJsonPage() {
	const { settings, updateSettings } = useSettings();

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
							<Heading size="3" mb="3">
								General Settings
							</Heading>
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
		</Flex>
	);
}
