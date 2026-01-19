"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
	Box,
	Button,
	Dialog,
	Flex,
	Heading,
	Text,
	TextField,
} from "@radix-ui/themes";
import { CopyIcon, Share1Icon, UploadIcon } from "@radix-ui/react-icons";
import { SettingsProvider, useSettings } from "../lib/settings-context";

function TabLink({ href, children }: { href: string; children: React.ReactNode }) {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<NextLink
			href={href}
			style={{
				padding: "var(--space-2) var(--space-3)",
				borderBottom: isActive ? "2px solid var(--accent-9)" : "2px solid transparent",
				color: isActive ? "var(--gray-12)" : "var(--gray-11)",
				textDecoration: "none",
				fontSize: "var(--font-size-2)",
				fontWeight: isActive ? 500 : 400,
				marginBottom: "-1px",
			}}
		>
			{children}
		</NextLink>
	);
}

function ConfigLayoutInner({ children }: { children: React.ReactNode }) {
	const {
		handleImport,
		handleShare,
		shareModalOpen,
		setShareModalOpen,
		shareUrl,
		handleCopyShareUrl,
		fileInputRef,
	} = useSettings();

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
							Visual configuration tool for Claude
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

			<Flex style={{ background: "var(--gray-2)", borderBottom: "1px solid var(--gray-5)", paddingLeft: "var(--space-6)", gap: "var(--space-1)" }}>
				<TabLink href="/settings.json">settings.json</TabLink>
				<TabLink href="/claude.md">CLAUDE.md</TabLink>
			</Flex>

			<Box style={{ flex: 1, overflow: "hidden" }}>
				{children}
			</Box>

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

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
	return (
		<SettingsProvider>
			<ConfigLayoutInner>{children}</ConfigLayoutInner>
		</SettingsProvider>
	);
}
