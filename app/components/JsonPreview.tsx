"use client";

import { useEffect, useState, useRef } from "react";
import { AlertDialog, Box, Button, Flex, Text, Tooltip } from "@radix-ui/themes";
import { CheckCircledIcon, CheckIcon, ClipboardIcon, CopyIcon, CrossCircledIcon, DownloadIcon, UploadIcon } from "@radix-ui/react-icons";
import type { ClaudeCodeSettings } from "../lib/schema";
import { DEFAULT_SETTINGS } from "../lib/schema";
import { validateSettings, type ValidationResult } from "../lib/validate";

interface JsonPreviewProps {
	settings: ClaudeCodeSettings;
	onSettingsChange: (settings: ClaudeCodeSettings) => void;
}

export function JsonPreview({ settings, onSettingsChange }: JsonPreviewProps) {
	const json = JSON.stringify(settings, null, 2);
	const [validation, setValidation] = useState<ValidationResult | null>(null);
	const [isValidating, setIsValidating] = useState(false);
	const [pasteDialogOpen, setPasteDialogOpen] = useState(false);
	const [clipboardContent, setClipboardContent] = useState("");
	const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
	const [importDialogOpen, setImportDialogOpen] = useState(false);
	const [importContent, setImportContent] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		let cancelled = false;
		setIsValidating(true);

		validateSettings(settings).then((result) => {
			if (!cancelled) {
				setValidation(result);
				setIsValidating(false);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [settings]);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(json);
		setCopyState("copied");
		setTimeout(() => setCopyState("idle"), 2000);
	};

	const handleDownload = () => {
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "settings.json";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handlePaste = async () => {
		try {
			const text = await navigator.clipboard.readText();
			setClipboardContent(text);
			setPasteDialogOpen(true);
		} catch {
			alert("Unable to read clipboard. Please check browser permissions.");
		}
	};

	const confirmPaste = () => {
		try {
			const parsed = JSON.parse(clipboardContent);
			onSettingsChange(parsed);
			setPasteDialogOpen(false);
		} catch {
			alert("Invalid JSON in clipboard. Please ensure you've copied valid JSON settings.");
		}
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			setImportContent(content);
			setImportDialogOpen(true);
		};
		reader.readAsText(file);
		event.target.value = "";
	};

	const confirmImport = () => {
		try {
			const parsed = JSON.parse(importContent);
			onSettingsChange({
				$schema: "https://json.schemastore.org/claude-code-settings.json",
				...parsed,
			});
			setImportDialogOpen(false);
		} catch {
			alert("Invalid JSON file. Please ensure the file contains valid JSON settings.");
		}
	};

	return (
		<Flex direction="column" gap="3" style={{ height: "100%" }}>
			<Flex justify="between" align="center">
				<Flex gap="2" align="center">
					<Text size="2" weight="bold" color="gray">
						settings.json
					</Text>
					{validation && !isValidating && (
						validation.valid ? (
							<Tooltip content="Valid settings.json schema">
								<CheckCircledIcon color="var(--green-9)" style={{ cursor: "help" }} />
							</Tooltip>
						) : (
							<Tooltip content="Invalid settings.json schema">
								<CrossCircledIcon color="var(--red-9)" style={{ cursor: "help" }} />
							</Tooltip>
						)
					)}
				</Flex>
				<Flex gap="2">
					<Button size="1" variant="soft" onClick={handleCopy}>
						{copyState === "copied" ? <CheckIcon /> : <CopyIcon />}
						{copyState === "copied" ? "Copied" : "Copy"}
					</Button>
					<Button size="1" variant="soft" onClick={handlePaste}>
						<ClipboardIcon />
						Paste
					</Button>
					<Button size="1" variant="soft" onClick={handleDownload}>
						<DownloadIcon />
						Download
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".json"
						onChange={handleFileSelect}
						style={{ display: "none" }}
					/>
					<Button size="1" variant="soft" onClick={() => fileInputRef.current?.click()}>
						<UploadIcon />
						Import
					</Button>
				</Flex>
			</Flex>

			{validation && !validation.valid && validation.errors.length > 0 && (
				<Box
					style={{
						background: "var(--red-3)",
						borderRadius: "var(--radius-2)",
						padding: "var(--space-3)",
						border: "1px solid var(--red-6)",
					}}
				>
					<Flex gap="2" align="start">
						<CrossCircledIcon color="var(--red-9)" style={{ marginTop: 2 }} />
						<Box>
							<Text size="1" weight="medium" color="red">Validation errors:</Text>
							<Box mt="1">
								{validation.errors.map((error, i) => (
									<Text key={i} size="1" as="div" style={{ fontFamily: "monospace" }} color="red">
										{error.path}: {error.message}
									</Text>
								))}
							</Box>
						</Box>
					</Flex>
				</Box>
			)}

			<Box
				style={{
					flex: 1,
					overflow: "auto",
					background: "var(--gray-2)",
					borderRadius: "var(--radius-2)",
					padding: "var(--space-3)",
					fontFamily: "monospace",
					fontSize: "13px",
					whiteSpace: "pre",
					lineHeight: 1.5,
				}}
			>
				{json}
			</Box>

			<AlertDialog.Root open={pasteDialogOpen} onOpenChange={setPasteDialogOpen}>
				<AlertDialog.Content maxWidth="500px">
					<AlertDialog.Title>Replace Settings</AlertDialog.Title>
					<AlertDialog.Description size="2">
						This will replace your current settings with the contents of your clipboard.
					</AlertDialog.Description>
					<Box
						mt="3"
						style={{
							maxHeight: "200px",
							overflow: "auto",
							background: "var(--gray-2)",
							borderRadius: "var(--radius-2)",
							padding: "var(--space-2)",
							fontFamily: "monospace",
							fontSize: "12px",
							whiteSpace: "pre",
						}}
					>
						{clipboardContent}
					</Box>
					<Flex gap="3" mt="4" justify="end">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button variant="solid" color="red" onClick={confirmPaste}>
								Replace Settings
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>

			<AlertDialog.Root open={importDialogOpen} onOpenChange={setImportDialogOpen}>
				<AlertDialog.Content maxWidth="500px">
					<AlertDialog.Title>Import Settings</AlertDialog.Title>
					<AlertDialog.Description size="2">
						This will replace your current settings with the imported file.
					</AlertDialog.Description>
					<Box
						mt="3"
						style={{
							maxHeight: "200px",
							overflow: "auto",
							background: "var(--gray-2)",
							borderRadius: "var(--radius-2)",
							padding: "var(--space-2)",
							fontFamily: "monospace",
							fontSize: "12px",
							whiteSpace: "pre",
						}}
					>
						{importContent}
					</Box>
					<Flex gap="3" mt="4" justify="end">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button variant="solid" color="red" onClick={confirmImport}>
								Import Settings
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Flex>
	);
}
