"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
	Box,
	Button,
	Container,
	Dialog,
	Flex,
	Heading,
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
	McpServersSection,
	HooksSection,
	EnvironmentSection,
	AdvancedSection,
	ExternalLink,
} from "./components";
import { Link } from "@radix-ui/themes";
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

const STORAGE_KEY = "claude-code-configurator-settings";

const MAX_HISTORY = 50;

export default function Home() {
	const [settings, setSettings] = useState<ClaudeCodeSettings>(DEFAULT_SETTINGS);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [shareUrl, setShareUrl] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Undo/redo history
	const [history, setHistory] = useState<ClaudeCodeSettings[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const isUndoRedo = useRef(false);

	const updateSettings = useCallback((newSettings: ClaudeCodeSettings) => {
		if (isUndoRedo.current) {
			isUndoRedo.current = false;
			setSettings(newSettings);
			return;
		}

		setHistory(prev => {
			const newHistory = prev.slice(0, historyIndex + 1);
			newHistory.push(settings);
			if (newHistory.length > MAX_HISTORY) {
				newHistory.shift();
				return newHistory;
			}
			return newHistory;
		});
		setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
		setSettings(newSettings);
	}, [settings, historyIndex]);

	const undo = useCallback(() => {
		if (historyIndex >= 0) {
			isUndoRedo.current = true;
			const previousSettings = history[historyIndex];
			setHistory(prev => [...prev, settings]);
			setHistoryIndex(prev => prev - 1);
			setSettings(previousSettings);
		}
	}, [history, historyIndex, settings]);

	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			isUndoRedo.current = true;
			const nextSettings = history[historyIndex + 1];
			setHistoryIndex(prev => prev + 1);
			setSettings(nextSettings);
		}
	}, [history, historyIndex]);

	// Keyboard shortcuts for undo/redo
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "z") {
				e.preventDefault();
				if (e.shiftKey) {
					redo();
				} else {
					undo();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [undo, redo]);

	// Load from URL param or localStorage on mount
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
				return;
			}
		}

		// Load from localStorage if no URL param
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				setSettings({
					$schema: "https://json.schemastore.org/claude-code-settings.json",
					...parsed,
				});
			} catch {
				// Ignore invalid stored data
			}
		}
	}, []);

	// Save to localStorage whenever settings change
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	}, [settings]);

	const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const imported = JSON.parse(e.target?.result as string);
				updateSettings({
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

		// Permissions
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

		// Sandbox
		if (s.sandbox) {
			const sb: typeof s.sandbox = {};
			if (s.sandbox.enabled) sb.enabled = s.sandbox.enabled;
			if (s.sandbox.autoAllowBashIfSandboxed) sb.autoAllowBashIfSandboxed = s.sandbox.autoAllowBashIfSandboxed;
			if (s.sandbox.excludedCommands?.length) sb.excludedCommands = s.sandbox.excludedCommands;
			if (Object.keys(sb).length) clean.sandbox = sb;
		}

		// General
		if (s.model) clean.model = s.model;
		if (s.cleanupPeriodDays !== undefined) clean.cleanupPeriodDays = s.cleanupPeriodDays;
		if (s.includeCoAuthoredBy === false) clean.includeCoAuthoredBy = s.includeCoAuthoredBy;
		if (s.spinnerTipsEnabled === false) clean.spinnerTipsEnabled = s.spinnerTipsEnabled;
		if (s.alwaysThinkingEnabled) clean.alwaysThinkingEnabled = s.alwaysThinkingEnabled;
		if (s.skipWebFetchPreflight) clean.skipWebFetchPreflight = s.skipWebFetchPreflight;

		// MCP Servers
		if (s.enableAllProjectMcpServers) clean.enableAllProjectMcpServers = s.enableAllProjectMcpServers;
		if (s.enabledMcpjsonServers?.length) clean.enabledMcpjsonServers = s.enabledMcpjsonServers;
		if (s.disabledMcpjsonServers?.length) clean.disabledMcpjsonServers = s.disabledMcpjsonServers;

		// Hooks
		if (s.disableAllHooks) clean.disableAllHooks = s.disableAllHooks;
		if (s.hooks && Object.keys(s.hooks).length) clean.hooks = s.hooks;

		// Environment
		if (s.env && Object.keys(s.env).length) clean.env = s.env;
		if (s.outputStyle) clean.outputStyle = s.outputStyle;

		// Plugins
		if (s.enabledPlugins && Object.keys(s.enabledPlugins).length) clean.enabledPlugins = s.enabledPlugins;
		if (s.skippedMarketplaces?.length) clean.skippedMarketplaces = s.skippedMarketplaces;
		if (s.skippedPlugins?.length) clean.skippedPlugins = s.skippedPlugins;

		// Advanced
		if (s.apiKeyHelper) clean.apiKeyHelper = s.apiKeyHelper;
		if (s.awsCredentialExport) clean.awsCredentialExport = s.awsCredentialExport;
		if (s.awsAuthRefresh) clean.awsAuthRefresh = s.awsAuthRefresh;
		if (s.otelHeadersHelper) clean.otelHeadersHelper = s.otelHeadersHelper;
		if (s.forceLoginMethod) clean.forceLoginMethod = s.forceLoginMethod;
		if (s.forceLoginOrgUUID) clean.forceLoginOrgUUID = s.forceLoginOrgUUID;
		if (s.statusLine) clean.statusLine = s.statusLine;

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
						<Heading size="6">Claude Code Configurator</Heading>
						<Text size="2" color="gray">
							Visual configuration tool for{" "}
							<ExternalLink href="https://code.claude.com/docs/en/settings">
								<code>.claude/settings.json</code>
							</ExternalLink>
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
