export type PermissionMode =
	| "default"
	| "acceptEdits"
	| "plan"
	| "bypassPermissions";

export interface Permissions {
	defaultMode?: PermissionMode;
	allow?: string[];
	deny?: string[];
	ask?: string[];
}

export interface Sandbox {
	enabled?: boolean;
	autoAllowBashIfSandboxed?: boolean;
	excludedCommands?: string[];
}

export interface HookEntry {
	matcher?: string;
	hooks: string[];
}

export interface Hooks {
	PreToolUse?: HookEntry[];
	PostToolUse?: HookEntry[];
	Notification?: HookEntry[];
	UserPromptSubmit?: HookEntry[];
}

export interface StatusLine {
	type: "command";
	command: string;
	padding?: number;
}

export interface ClaudeCodeSettings {
	$schema?: string;
	permissions?: Permissions;
	sandbox?: Sandbox;
	model?: string;
	cleanupPeriodDays?: number;
	includeCoAuthoredBy?: boolean;
	outputStyle?: string;
	spinnerTipsEnabled?: boolean;
	alwaysThinkingEnabled?: boolean;
	skipWebFetchPreflight?: boolean;
	env?: Record<string, string>;
	apiKeyHelper?: string;
	awsCredentialExport?: string;
	awsAuthRefresh?: string;
	otelHeadersHelper?: string;
	forceLoginMethod?: "claudeai" | "console";
	forceLoginOrgUUID?: string;
	enableAllProjectMcpServers?: boolean;
	enabledMcpjsonServers?: string[];
	disabledMcpjsonServers?: string[];
	hooks?: Hooks;
	disableAllHooks?: boolean;
	statusLine?: StatusLine;
	enabledPlugins?: Record<string, boolean>;
	skippedMarketplaces?: string[];
	skippedPlugins?: string[];
	companyAnnouncements?: string[];
}

export const DEFAULT_SETTINGS: ClaudeCodeSettings = {
	$schema: "https://json.schemastore.org/claude-code-settings.json",
	permissions: {
		defaultMode: "default",
		allow: [],
		deny: [],
	},
};

export const PERMISSION_MODES: { value: PermissionMode; label: string; description: string }[] = [
	{ value: "default", label: "Default", description: "Prompt for first tool use" },
	{ value: "acceptEdits", label: "Accept Edits", description: "Auto-accept file edits" },
	{ value: "plan", label: "Plan Only", description: "Analyze without modification" },
	{ value: "bypassPermissions", label: "Bypass Permissions", description: "Skip all prompts" },
];

export const TOOL_TYPES = [
	"Bash",
	"Read",
	"Write",
	"Edit",
	"Glob",
	"Grep",
	"WebFetch",
	"WebSearch",
	"Task",
	"mcp__",
] as const;
