"use client";

import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import pako from "pako";
import { DEFAULT_SETTINGS, type ClaudeCodeSettings } from "./schema";

const STORAGE_KEY = "claude-code-configurator-settings";
const MAX_HISTORY = 50;

function encodeSettings(settings: ClaudeCodeSettings): string {
	const json = JSON.stringify(settings);
	const compressed = pako.deflate(json);
	const binary = String.fromCharCode(...compressed);
	return btoa(binary);
}

function decodeSettings(encoded: string): ClaudeCodeSettings | null {
	try {
		const binary = atob(encoded);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		const json = pako.inflate(bytes, { to: "string" });
		return JSON.parse(json);
	} catch {
		try {
			const json = decodeURIComponent(atob(encoded));
			return JSON.parse(json);
		} catch {
			return null;
		}
	}
}

export function cleanSettings(s: ClaudeCodeSettings): ClaudeCodeSettings {
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

	if (s.enableAllProjectMcpServers) clean.enableAllProjectMcpServers = s.enableAllProjectMcpServers;
	if (s.enabledMcpjsonServers?.length) clean.enabledMcpjsonServers = s.enabledMcpjsonServers;
	if (s.disabledMcpjsonServers?.length) clean.disabledMcpjsonServers = s.disabledMcpjsonServers;

	if (s.disableAllHooks) clean.disableAllHooks = s.disableAllHooks;
	if (s.hooks && Object.keys(s.hooks).length) clean.hooks = s.hooks;

	if (s.env && Object.keys(s.env).length) clean.env = s.env;
	if (s.outputStyle) clean.outputStyle = s.outputStyle;

	if (s.enabledPlugins && Object.keys(s.enabledPlugins).length) clean.enabledPlugins = s.enabledPlugins;
	if (s.skippedMarketplaces?.length) clean.skippedMarketplaces = s.skippedMarketplaces;
	if (s.skippedPlugins?.length) clean.skippedPlugins = s.skippedPlugins;

	if (s.apiKeyHelper) clean.apiKeyHelper = s.apiKeyHelper;
	if (s.awsCredentialExport) clean.awsCredentialExport = s.awsCredentialExport;
	if (s.awsAuthRefresh) clean.awsAuthRefresh = s.awsAuthRefresh;
	if (s.otelHeadersHelper) clean.otelHeadersHelper = s.otelHeadersHelper;
	if (s.forceLoginMethod) clean.forceLoginMethod = s.forceLoginMethod;
	if (s.forceLoginOrgUUID) clean.forceLoginOrgUUID = s.forceLoginOrgUUID;
	if (s.statusLine) clean.statusLine = s.statusLine;

	return clean;
}

interface SettingsContextType {
	settings: ClaudeCodeSettings;
	updateSettings: (settings: ClaudeCodeSettings) => void;
	handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleShare: () => void;
	shareModalOpen: boolean;
	setShareModalOpen: (open: boolean) => void;
	shareUrl: string;
	handleCopyShareUrl: () => Promise<void>;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<ClaudeCodeSettings>(DEFAULT_SETTINGS);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [shareUrl, setShareUrl] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

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
				alert("Invalid JSON file. Please ensure the file contains valid JSON settings.");
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

	return (
		<SettingsContext.Provider value={{
			settings,
			updateSettings,
			handleImport,
			handleShare,
			shareModalOpen,
			setShareModalOpen,
			shareUrl,
			handleCopyShareUrl,
			fileInputRef,
		}}>
			{children}
		</SettingsContext.Provider>
	);
}
