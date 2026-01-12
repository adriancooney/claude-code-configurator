"use client";

import { useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { CheckCircledIcon, CopyIcon, CrossCircledIcon, DownloadIcon } from "@radix-ui/react-icons";
import type { ClaudeCodeSettings } from "../lib/schema";
import { validateSettings, type ValidationResult } from "../lib/validate";

interface JsonPreviewProps {
	settings: ClaudeCodeSettings;
}

export function JsonPreview({ settings }: JsonPreviewProps) {
	const json = JSON.stringify(settings, null, 2);
	const [validation, setValidation] = useState<ValidationResult | null>(null);
	const [isValidating, setIsValidating] = useState(false);

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

	return (
		<Flex direction="column" gap="3" style={{ height: "100%" }}>
			<Flex justify="between" align="center">
				<Flex gap="2" align="center">
					<Text size="2" weight="bold" color="gray">
						settings.json
					</Text>
					{validation && !isValidating && (
						validation.valid ? (
							<CheckCircledIcon color="var(--green-9)" />
						) : (
							<CrossCircledIcon color="var(--red-9)" />
						)
					)}
				</Flex>
				<Flex gap="2">
					<Button size="1" variant="soft" onClick={handleCopy}>
						<CopyIcon />
						Copy
					</Button>
					<Button size="1" variant="soft" onClick={handleDownload}>
						<DownloadIcon />
						Download
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
		</Flex>
	);
}
