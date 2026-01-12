import type { ClaudeCodeSettings } from "./schema";

export interface Template {
	id: string;
	name: string;
	description: string;
	settings: ClaudeCodeSettings;
}

export const TEMPLATES: Template[] = [
	{
		id: "locked-down",
		name: "Locked Down",
		description: "Read-only mode. Claude can only read files and search.",
		settings: {
			$schema: "https://json.schemastore.org/claude-code-settings.json",
			permissions: {
				defaultMode: "plan",
				deny: ["Bash(*)", "WebFetch(*)", "Write(*)", "Edit(*)"],
				allow: ["Read(**/*)", "Glob(**/*)", "Grep(*)"],
			},
		},
	},
	{
		id: "conservative",
		name: "Conservative",
		description: "Safe development workflow. Package managers and read-only git only.",
		settings: {
			$schema: "https://json.schemastore.org/claude-code-settings.json",
			permissions: {
				defaultMode: "default",
				allow: [
					"Read(**/*)",
					"Glob(**/*)",
					"Grep(*)",
					"Bash(npm run *)",
					"Bash(pnpm *)",
					"Bash(yarn *)",
					"Bash(git status)",
					"Bash(git diff *)",
					"Bash(git log *)",
				],
				deny: ["Bash(rm -rf *)", "Bash(sudo *)", "WebFetch(*)"],
			},
		},
	},
	{
		id: "standard",
		name: "Standard Development",
		description: "Full development workflow with file editing auto-accepted.",
		settings: {
			$schema: "https://json.schemastore.org/claude-code-settings.json",
			permissions: {
				defaultMode: "acceptEdits",
				allow: [
					"Read(**/*)",
					"Write(**/*)",
					"Edit(**/*)",
					"Glob(**/*)",
					"Grep(*)",
					"Bash(npm *)",
					"Bash(pnpm *)",
					"Bash(yarn *)",
					"Bash(git *)",
					"Bash(node *)",
					"Bash(npx *)",
					"Bash(tsx *)",
					"Bash(tsc *)",
					"Task(*)",
				],
				deny: [
					"Bash(rm -rf /)",
					"Bash(sudo *)",
					"Read(~/.ssh/*)",
					"Read(*.env.local)",
				],
			},
		},
	},
	{
		id: "full-trust-sandboxed",
		name: "Full Trust (Sandboxed)",
		description: "Maximum freedom within a sandbox. All actions auto-approved but contained.",
		settings: {
			$schema: "https://json.schemastore.org/claude-code-settings.json",
			permissions: {
				defaultMode: "bypassPermissions",
			},
			sandbox: {
				enabled: true,
				autoAllowBashIfSandboxed: true,
			},
		},
	},
	{
		id: "web-research",
		name: "Web Research Enabled",
		description: "Enables web access for common development resources.",
		settings: {
			$schema: "https://json.schemastore.org/claude-code-settings.json",
			permissions: {
				defaultMode: "default",
				allow: [
					"WebFetch(domain:github.com)",
					"WebFetch(domain:stackoverflow.com)",
					"WebFetch(domain:npmjs.com)",
					"WebFetch(domain:docs.anthropic.com)",
					"WebSearch(*)",
				],
			},
		},
	},
];
