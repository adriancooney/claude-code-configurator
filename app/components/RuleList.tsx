"use client";

import { Box, Button, Checkbox, Flex, IconButton, Text, TextField, Dialog } from "@radix-ui/themes";
import { Cross2Icon, PlusIcon, GlobeIcon, LightningBoltIcon, FileIcon } from "@radix-ui/react-icons";
import { useState } from "react";

const VALID_TOOLS = ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch", "WebSearch", "Task", "TodoRead", "TodoWrite", "NotebookEdit"];

function validateRule(rule: string): { valid: boolean; error?: string } {
	const trimmed = rule.trim();
	if (!trimmed) return { valid: false, error: "Rule cannot be empty" };

	// Check for MCP tool pattern: mcp__servername__toolname or mcp__servername__toolname(...)
	if (trimmed.startsWith("mcp__")) {
		const mcpPattern = /^mcp__[a-zA-Z0-9_-]+__[a-zA-Z0-9_-]+(\(.*\))?$/;
		if (mcpPattern.test(trimmed)) return { valid: true };
		return { valid: false, error: "MCP tools should be: mcp__server__tool or mcp__server__tool(...)" };
	}

	// Check for tool pattern: ToolName or ToolName(...)
	const toolMatch = trimmed.match(/^([A-Za-z]+)(\(.*\))?$/);
	if (!toolMatch) {
		return { valid: false, error: "Rule should be: ToolName or ToolName(...)" };
	}

	const toolName = toolMatch[1];
	if (!VALID_TOOLS.includes(toolName)) {
		return { valid: false, error: `Unknown tool "${toolName}". Valid: ${VALID_TOOLS.join(", ")}` };
	}

	// Check parentheses are balanced
	const hasOpen = trimmed.includes("(");
	const hasClose = trimmed.includes(")");
	if (hasOpen !== hasClose) {
		return { valid: false, error: "Unbalanced parentheses" };
	}

	if (hasOpen) {
		const content = trimmed.slice(trimmed.indexOf("(") + 1, trimmed.lastIndexOf(")"));
		if (!content && toolName !== "WebSearch") {
			return { valid: false, error: "Empty parentheses - specify a pattern or remove them" };
		}
	}

	return { valid: true };
}

interface QuickAction {
	id: string;
	label: string;
	icon: React.ReactNode;
	placeholder: string;
	description?: string;
	hasFileOptions?: boolean;
	generate: (input: string, options?: { read?: boolean; edit?: boolean }) => string[];
}

interface RuleListProps {
	label: string;
	rules: string[];
	onChange: (rules: string[]) => void;
	placeholder?: string;
	quickActions?: QuickAction[];
	description?: string;
}

export function RuleList({
	label,
	rules,
	onChange,
	placeholder = "e.g., Bash(npm *)",
	quickActions,
	description,
	skipValidation = false,
}: RuleListProps & { skipValidation?: boolean }) {
	const [newRule, setNewRule] = useState("");

	const validation = skipValidation ? { valid: !!newRule.trim() } : validateRule(newRule);
	const canAdd = newRule.trim() && validation.valid;

	const addRule = (e: React.MouseEvent) => {
		e.preventDefault();
		if (canAdd) {
			onChange([...rules, newRule.trim()]);
			setNewRule("");
		}
	};

	const addRules = (newRules: string[]) => {
		onChange([...rules, ...newRules]);
	};

	const removeRule = (index: number) => {
		onChange(rules.filter((_, i) => i !== index));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (canAdd) {
				onChange([...rules, newRule.trim()]);
				setNewRule("");
			}
		}
	};

	const getValidationForRule = (rule: string) => skipValidation ? { valid: true } : validateRule(rule);

	return (
		<Box>
			{label && (
				<Flex direction="column" gap="1" mb="2">
					<Text as="label" size="2" weight="medium">
						{label}
					</Text>
					{description && (
						<Text size="1" color="gray">
							{description}
						</Text>
					)}
				</Flex>
			)}
			<Flex direction="column" gap="2">
				{rules.map((rule, index) => {
					const ruleValidation = getValidationForRule(rule);
					return (
						<Box key={`${rule}-${index}`}>
							<Flex gap="2" align="center">
								<TextField.Root
									size="2"
									value={rule}
									color={!ruleValidation.valid ? "red" : undefined}
									onChange={(e) => {
										const updated = [...rules];
										updated[index] = e.target.value;
										onChange(updated);
									}}
									style={{ flex: 1, fontFamily: "monospace" }}
								/>
								<IconButton size="2" variant="soft" color="red" onClick={() => removeRule(index)}>
									<Cross2Icon />
								</IconButton>
							</Flex>
							{!ruleValidation.valid && ruleValidation.error && (
								<Text size="1" color="red" mt="1" style={{ display: "block" }}>
									{ruleValidation.error}
								</Text>
							)}
						</Box>
					);
				})}
				<Box>
					<Flex gap="2">
						<TextField.Root
							size="2"
							placeholder={placeholder}
							value={newRule}
							color={newRule.trim() && !validation.valid ? "red" : undefined}
							onChange={(e) => setNewRule(e.target.value)}
							onKeyDown={handleKeyDown}
							style={{ flex: 1, fontFamily: "monospace" }}
						/>
						<Button size="2" variant="soft" type="button" onClick={addRule} disabled={!canAdd}>
							<PlusIcon />
							Add
						</Button>
					</Flex>
					{newRule.trim() && !validation.valid && validation.error && (
						<Text size="1" color="red" mt="1" style={{ display: "block" }}>
							{validation.error}
						</Text>
					)}
				</Box>
				{quickActions && quickActions.length > 0 && (
					<Flex gap="4" wrap="wrap" mt="1">
						{quickActions.map((action) => (
							<QuickActionButton
								key={action.id}
								action={action}
								onAdd={addRules}
							/>
						))}
					</Flex>
				)}
			</Flex>
		</Box>
	);
}

function QuickActionButton({
	action,
	onAdd
}: {
	action: QuickAction;
	onAdd: (rules: string[]) => void;
}) {
	const [input, setInput] = useState("");
	const [open, setOpen] = useState(false);
	const [readChecked, setReadChecked] = useState(true);
	const [editChecked, setEditChecked] = useState(true);

	const handleApply = () => {
		if (input.trim()) {
			const options = action.hasFileOptions ? { read: readChecked, edit: editChecked } : undefined;
			onAdd(action.generate(input.trim(), options));
			setInput("");
			setReadChecked(true);
			setEditChecked(true);
			setOpen(false);
		}
	};

	const options = action.hasFileOptions ? { read: readChecked, edit: editChecked } : undefined;
	const preview = input.trim() ? action.generate(input.trim(), options) : action.generate(action.placeholder, options);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger>
				<Button size="1" variant="ghost" color="gray">
					{action.icon}
					{action.label}
				</Button>
			</Dialog.Trigger>
			<Dialog.Content style={{ maxWidth: 400 }}>
				<Dialog.Title size="3">{action.label}</Dialog.Title>
				<Flex direction="column" gap="3" mt="3">
					<Box>
						<TextField.Root
							placeholder={action.placeholder}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !action.hasFileOptions) handleApply();
							}}
							autoFocus
						/>
						{action.description && (
							<Text size="1" color="gray" mt="1" style={{ display: "block" }}>
								{action.description}
							</Text>
						)}
					</Box>
					{action.hasFileOptions && (
						<Flex gap="4">
							<Text as="label" size="2">
								<Flex gap="2" align="center">
									<Checkbox checked={readChecked} onCheckedChange={(c) => setReadChecked(c === true)} />
									Read
								</Flex>
							</Text>
							<Text as="label" size="2">
								<Flex gap="2" align="center">
									<Checkbox checked={editChecked} onCheckedChange={(c) => setEditChecked(c === true)} />
									Edit
								</Flex>
							</Text>
						</Flex>
					)}
					<Box>
						<Text size="1" color="gray" mb="1" style={{ display: "block" }}>
							Will add:
						</Text>
						<Box
							style={{
								background: "var(--gray-3)",
								borderRadius: "var(--radius-2)",
								padding: "var(--space-2)",
								fontFamily: "monospace",
								fontSize: "12px",
							}}
						>
							{preview.map((rule) => (
								<Text key={rule} as="div" size="1">
									{rule}
								</Text>
							))}
						</Box>
					</Box>
				</Flex>
				<Flex gap="3" mt="4" justify="end">
					<Dialog.Close>
						<Button variant="soft" color="gray">
							Cancel
						</Button>
					</Dialog.Close>
					<Button onClick={handleApply} disabled={!input.trim()}>
						Add
					</Button>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
}

export const ALLOW_QUICK_ACTIONS: QuickAction[] = [
	{
		id: "webfetch",
		label: "Allow domain",
		icon: <GlobeIcon />,
		placeholder: "github.com",
		description: "Supports wildcards like *.example.com",
		generate: (domain) => [`WebFetch(domain:${domain})`],
	},
	{
		id: "bash",
		label: "Allow command",
		icon: <LightningBoltIcon />,
		placeholder: "docker",
		description: "For subcommands, use 'cmd subcommand' (e.g., 'npm install')",
		generate: (cmd) => [`Bash(${cmd}:*)`],
	},
	{
		id: "files",
		label: "Allow files",
		icon: <FileIcon />,
		placeholder: "src/**/*.ts",
		hasFileOptions: true,
		generate: (pattern, options) => {
			const rules: string[] = [];
			if (options?.read !== false) rules.push(`Read(${pattern})`);
			if (options?.edit !== false) rules.push(`Edit(${pattern})`);
			return rules;
		},
	},
];

export const DENY_QUICK_ACTIONS: QuickAction[] = [
	{
		id: "protect-files",
		label: "Protect files",
		icon: <FileIcon />,
		placeholder: "*.env*",
		description: "Blocks access to matching files",
		hasFileOptions: true,
		generate: (pattern, options) => {
			const rules: string[] = [];
			if (options?.read !== false) rules.push(`Read(${pattern})`);
			if (options?.edit !== false) rules.push(`Edit(${pattern})`);
			return rules;
		},
	},
	{
		id: "block-command",
		label: "Block command",
		icon: <LightningBoltIcon />,
		placeholder: "rm -rf",
		description: "For subcommands, use 'cmd subcommand' (e.g., 'git push')",
		generate: (cmd) => [`Bash(${cmd}:*)`],
	},
];
