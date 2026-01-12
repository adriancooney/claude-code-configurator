"use client";

import { useState, useRef, useEffect } from "react";
import {
	Box,
	Button,
	Container,
	Dialog,
	Flex,
	Heading,
	Link,
	Section,
	Separator,
	Text,
	TextField,
} from "@radix-ui/themes";
import { CopyIcon, Share1Icon, UploadIcon } from "@radix-ui/react-icons";
import {
	JsonPreview,
	PermissionsSection,
	SandboxSection,
	GeneralSection,
} from "./components";
import { DEFAULT_SETTINGS, type ClaudeCodeSettings } from "./lib/schema";

function encodeSettings(settings: ClaudeCodeSettings): string {
	const json = JSON.stringify(settings);
	return btoa(encodeURIComponent(json));
}

function decodeSettings(encoded: string): ClaudeCodeSettings | null {
	try {
		const json = decodeURIComponent(atob(encoded));
		return JSON.parse(json);
	} catch {
		return null;
	}
}

export default function Home() {
	const [settings, setSettings] = useState<ClaudeCodeSettings>(DEFAULT_SETTINGS);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [shareUrl, setShareUrl] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const config = params.get("config");
		if (config) {
			const decoded = decodeSettings(config);
			if (decoded) {
				setSettings({
					$schema: "https://json.schemastore.org/claude-code-settings.json",
					...decoded,
				});
			}
		}
	}, []);

	const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const imported = JSON.parse(e.target?.result as string);
				setSettings({
					$schema: "https://json.schemastore.org/claude-code-settings.json",
					...imported,
				});
			} catch {
				alert("Invalid JSON file");
			}
		};
		reader.readAsText(file);
		event.target.value = "";
	};

	const handleShare = () => {
		const encoded = encodeSettings(settings);
		const url = new URL(window.location.origin + window.location.pathname);
		url.search = `?config=${encoded}`;
		setShareUrl(url.toString());
		setShareModalOpen(true);
	};

	const handleCopyShareUrl = async () => {
		await navigator.clipboard.writeText(shareUrl);
	};

	const cleanSettings = (s: ClaudeCodeSettings): ClaudeCodeSettings => {
		const clean: ClaudeCodeSettings = { $schema: s.$schema };

		if (s.permissions) {
			const p: typeof s.permissions = {};
			if (s.permissions.defaultMode && s.permissions.defaultMode !== "default") {
				p.defaultMode = s.permissions.defaultMode;
			}
			if (s.permissions.allow?.length) p.allow = s.permissions.allow;
			if (s.permissions.deny?.length) p.deny = s.permissions.deny;
			if (s.permissions.ask?.length) p.ask = s.permissions.ask;
			if (Object.keys(p).length) clean.permissions = p;
		}

		if (s.sandbox) {
			const sb: typeof s.sandbox = {};
			if (s.sandbox.enabled) sb.enabled = s.sandbox.enabled;
			if (s.sandbox.autoAllowBashIfSandboxed) sb.autoAllowBashIfSandboxed = s.sandbox.autoAllowBashIfSandboxed;
			if (s.sandbox.excludedCommands?.length) sb.excludedCommands = s.sandbox.excludedCommands;
			if (Object.keys(sb).length) clean.sandbox = sb;
		}

		if (s.model) clean.model = s.model;
		if (s.cleanupPeriodDays !== undefined) clean.cleanupPeriodDays = s.cleanupPeriodDays;
		if (s.includeCoAuthoredBy === false) clean.includeCoAuthoredBy = s.includeCoAuthoredBy;
		if (s.spinnerTipsEnabled === false) clean.spinnerTipsEnabled = s.spinnerTipsEnabled;
		if (s.alwaysThinkingEnabled) clean.alwaysThinkingEnabled = s.alwaysThinkingEnabled;
		if (s.skipWebFetchPreflight) clean.skipWebFetchPreflight = s.skipWebFetchPreflight;

		return clean;
	};

	return (
		<Box style={{ height: "100vh", overflow: "hidden", background: "var(--gray-1)", display: "flex", flexDirection: "column" }}>
			<Box
				style={{
					borderBottom: "1px solid var(--gray-5)",
					padding: "var(--space-4) var(--space-6)",
					background: "var(--gray-2)",
					flexShrink: 0,
				}}
			>
				<Flex justify="between" align="center">
					<Box>
						<Heading size="6">Claude Code Permissions Configurator</Heading>
						<Text size="2" color="gray">
							Visual configuration tool for{" "}
							<Link href="https://docs.anthropic.com/en/docs/claude-code/settings" target="_blank" rel="noopener noreferrer">
								settings.json
							</Link>.
						</Text>
					</Box>
					<Flex gap="2">
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							onChange={handleImport}
							style={{ display: "none" }}
						/>
						<Button variant="soft" onClick={() => fileInputRef.current?.click()}>
							<UploadIcon />
							Import
						</Button>
						<Button variant="soft" onClick={handleShare}>
							<Share1Icon />
							Share
						</Button>
					</Flex>
				</Flex>
			</Box>

			<Flex style={{ flex: 1, overflow: "hidden" }}>
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
									Permissions
								</Heading>
								<PermissionsSection
									permissions={settings.permissions || {}}
									onChange={(permissions) => setSettings({ ...settings, permissions })}
								/>
							</Section>

							<Separator size="4" />

							<Section size="1">
								<Heading size="3" mb="3">
									Sandbox
								</Heading>
								<SandboxSection
									sandbox={settings.sandbox || {}}
									onChange={(sandbox) => setSettings({ ...settings, sandbox })}
								/>
							</Section>

							<Separator size="4" />

							<Section size="1">
								<Heading size="3" mb="3">
									General Settings
								</Heading>
								<GeneralSection settings={settings} onChange={setSettings} />
							</Section>

							<Box py="4">
								<Text size="1" color="gray" align="center" as="p">
									Created by{" "}
									<Link href="https://x.com/adrian_cooney" target="_blank" rel="noopener noreferrer">
										Adrian Cooney
									</Link>
									{" "}&bull;{" "}
									<Link href="https://github.com/adriancooney/claude-permissions-configurator" target="_blank" rel="noopener noreferrer">
										View source on GitHub
									</Link>
								</Text>
							</Box>
						</Flex>
					</Container>
				</Box>

				<Box
					style={{
						width: 480,
						borderLeft: "1px solid var(--gray-5)",
						padding: "var(--space-6)",
						background: "var(--gray-2)",
						overflow: "auto",
					}}
				>
					<JsonPreview settings={cleanSettings(settings)} />
				</Box>
			</Flex>

			<Dialog.Root open={shareModalOpen} onOpenChange={setShareModalOpen}>
				<Dialog.Content maxWidth="500px">
					<Dialog.Title>Share Configuration</Dialog.Title>
					<Flex gap="2" mt="4">
						<TextField.Root
							value={shareUrl}
							readOnly
							style={{ flex: 1 }}
						/>
						<Button onClick={handleCopyShareUrl}>
							<CopyIcon />
							Copy
						</Button>
					</Flex>
				</Dialog.Content>
			</Dialog.Root>
		</Box>
	);
}
