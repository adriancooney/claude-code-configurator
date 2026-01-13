"use client";

import { Box, Flex, Heading, Link, Select, Separator, Switch, Text, TextField } from "@radix-ui/themes";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import type { ClaudeCodeSettings } from "../lib/schema";
import { PluginsSection } from "./PluginsSection";

const LOGIN_METHODS = [
	{ value: "__none__", label: "No override" },
	{ value: "claudeai", label: "Claude AI" },
	{ value: "console", label: "Console" },
];

interface AdvancedSectionProps {
	settings: ClaudeCodeSettings;
	onChange: (settings: ClaudeCodeSettings) => void;
}

export function AdvancedSection({ settings, onChange }: AdvancedSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<Box>
			<Flex
				align="center"
				gap="2"
				onClick={() => setIsExpanded(!isExpanded)}
				style={{ cursor: "pointer", userSelect: "none" }}
				mb={isExpanded ? "4" : "0"}
			>
				{isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
				<Text size="3" weight="medium">
					Advanced Settings
				</Text>
				<Text size="2" color="gray">
					Authentication, scripts, and other advanced options
				</Text>
			</Flex>

			{isExpanded && (
				<Flex direction="column" gap="5">
					<Text size="2" color="gray">
						These settings are typically used for enterprise or custom deployments.
					</Text>

					<Flex justify="between" align="center">
						<Flex direction="column" gap="1">
							<Text size="2" weight="medium">
								Skip WebFetch Preflight
							</Text>
							<Text size="1" color="gray">
								Skip the HEAD request check before fetching URLs
							</Text>
						</Flex>
						<Switch
							checked={settings.skipWebFetchPreflight ?? false}
							onCheckedChange={(skipWebFetchPreflight) =>
								onChange({ ...settings, skipWebFetchPreflight })
							}
						/>
					</Flex>

					<Box>
						<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
							Cleanup Period (days)
						</Text>
						<TextField.Root
							type="number"
							placeholder="30"
							value={settings.cleanupPeriodDays?.toString() || ""}
							onChange={(e) =>
								onChange({
									...settings,
									cleanupPeriodDays: e.target.value ? Number.parseInt(e.target.value) : undefined,
								})
							}
						/>
						<Text size="1" color="gray" mt="1">
							Days to retain chat transcripts
						</Text>
					</Box>

					{settings.statusLine?.command && (
						<Box>
							<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
								Status Line Padding
							</Text>
							<TextField.Root
								type="number"
								placeholder="0"
								value={settings.statusLine?.padding?.toString() || ""}
								onChange={(e) =>
									onChange({
										...settings,
										statusLine: {
											type: "command",
											command: settings.statusLine!.command,
											padding: e.target.value ? Number.parseInt(e.target.value) : undefined,
										},
									})
								}
							/>
							<Text size="1" color="gray" mt="1">
								Padding for the status line output
							</Text>
						</Box>
					)}

					<Separator size="4" my="2" />

					<Heading size="3">
						Authentication
					</Heading>

					<Box>
						<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
							API Key Helper
						</Text>
						<TextField.Root
							placeholder="/path/to/api-key-helper.sh"
							value={settings.apiKeyHelper || ""}
							onChange={(e) =>
								onChange({ ...settings, apiKeyHelper: e.target.value || undefined })
							}
							style={{ fontFamily: "monospace" }}
						/>
						<Text size="1" color="gray" mt="1">
							Path to a script that outputs authentication values
						</Text>
					</Box>

					<Box>
						<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
							AWS Credential Export
						</Text>
						<TextField.Root
							placeholder="/path/to/aws-creds.sh"
							value={settings.awsCredentialExport || ""}
							onChange={(e) =>
								onChange({ ...settings, awsCredentialExport: e.target.value || undefined })
							}
							style={{ fontFamily: "monospace" }}
						/>
						<Text size="1" color="gray" mt="1">
							Path to a script that exports AWS credentials
						</Text>
					</Box>

					<Box>
						<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
							AWS Auth Refresh
						</Text>
						<TextField.Root
							placeholder="/path/to/aws-refresh.sh"
							value={settings.awsAuthRefresh || ""}
							onChange={(e) =>
								onChange({ ...settings, awsAuthRefresh: e.target.value || undefined })
							}
							style={{ fontFamily: "monospace" }}
						/>
						<Text size="1" color="gray" mt="1">
							Path to a script that refreshes AWS authentication
						</Text>
					</Box>

					<Box>
						<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
							OpenTelemetry Headers Helper
						</Text>
						<TextField.Root
							placeholder="/path/to/otel-headers.sh"
							value={settings.otelHeadersHelper || ""}
							onChange={(e) =>
								onChange({ ...settings, otelHeadersHelper: e.target.value || undefined })
							}
							style={{ fontFamily: "monospace" }}
						/>
						<Text size="1" color="gray" mt="1">
							Path to a script that outputs OpenTelemetry headers
						</Text>
					</Box>

					<Box>
						<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
							Force Login Method
						</Text>
						<Select.Root
							value={settings.forceLoginMethod || "__none__"}
							onValueChange={(value) =>
								onChange({
									...settings,
									forceLoginMethod: value === "__none__" ? undefined : (value as "claudeai" | "console"),
								})
							}
						>
							<Select.Trigger style={{ width: "100%" }} />
							<Select.Content>
								{LOGIN_METHODS.map((method) => (
									<Select.Item key={method.value} value={method.value}>
										{method.label}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Root>
						<Text size="1" color="gray" mt="1">
							Force a specific authentication method
						</Text>
					</Box>

					{settings.forceLoginMethod && (
						<Box>
							<Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
								Force Login Org UUID
							</Text>
							<TextField.Root
								placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
								value={settings.forceLoginOrgUUID || ""}
								onChange={(e) =>
									onChange({ ...settings, forceLoginOrgUUID: e.target.value || undefined })
								}
								style={{ fontFamily: "monospace" }}
							/>
							<Text size="1" color="gray" mt="1">
								Organization UUID for OAuth login
							</Text>
						</Box>
					)}

					<Separator size="4" my="2" />

					<Heading size="3">
						Plugins
					</Heading>

					<PluginsSection settings={settings} onChange={onChange} />
				</Flex>
			)}
		</Box>
	);
}
