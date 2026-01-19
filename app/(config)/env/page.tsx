"use client";

import { useState } from "react";
import {
	Badge,
	Box,
	Card,
	Container,
	Flex,
	Heading,
	ScrollArea,
	Text,
	TextField,
	Tooltip,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, CheckCircledIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { ENV_VAR_CATEGORIES, type EnvVar } from "../../lib/env-vars";

function EnvVarRow({ envVar }: { envVar: EnvVar }) {
	return (
		<Flex
			justify="between"
			align="start"
			py="2"
			style={{ borderBottom: "1px solid var(--gray-4)" }}
		>
			<Box style={{ flex: 1 }}>
				<Flex gap="2" align="center" mb="1">
					<Text size="2" weight="medium" style={{ fontFamily: "monospace" }}>
						{envVar.name}
					</Text>
					{envVar.documented ? (
						<Tooltip content="Documented in official Claude Code docs">
							<CheckCircledIcon color="var(--green-9)" style={{ cursor: "help" }} />
						</Tooltip>
					) : (
						<Tooltip content="Undocumented - found in source code">
							<QuestionMarkCircledIcon color="var(--amber-9)" style={{ cursor: "help" }} />
						</Tooltip>
					)}
				</Flex>
				<Text size="1" color="gray">
					{envVar.description}
				</Text>
				{envVar.example && (
					<Text size="1" color="gray" style={{ fontFamily: "monospace" }}>
						Example: {envVar.example}
					</Text>
				)}
			</Box>
		</Flex>
	);
}

function CategoryCard({ category, searchQuery }: { category: typeof ENV_VAR_CATEGORIES[0]; searchQuery: string }) {
	const filteredVars = category.vars.filter(
		(v) =>
			v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			v.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (filteredVars.length === 0) return null;

	return (
		<Card mb="4">
			<Flex justify="between" align="center" mb="2">
				<Heading size="3">{category.name}</Heading>
				<Badge color="gray" variant="soft">
					{filteredVars.length} {filteredVars.length === 1 ? "variable" : "variables"}
				</Badge>
			</Flex>
			<Text size="2" color="gray" mb="3">
				{category.description}
			</Text>
			<Box>
				{filteredVars.map((envVar) => (
					<EnvVarRow key={envVar.name} envVar={envVar} />
				))}
			</Box>
		</Card>
	);
}

export default function EnvPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const totalVars = ENV_VAR_CATEGORIES.reduce((sum, cat) => sum + cat.vars.length, 0);
	const documentedVars = ENV_VAR_CATEGORIES.reduce(
		(sum, cat) => sum + cat.vars.filter((v) => v.documented).length,
		0
	);
	const undocumentedVars = totalVars - documentedVars;

	const filteredCategories = ENV_VAR_CATEGORIES.filter((cat) =>
		cat.vars.some(
			(v) =>
				v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				v.description.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	return (
		<ScrollArea style={{ height: "100%" }}>
			<Container size="2" py="6">
				<Flex direction="column" gap="4">
					<Box>
						<Heading size="5" mb="2">
							Environment Variables
						</Heading>
						<Text size="2" color="gray">
							Configure Claude Code using environment variables. Set these in your shell profile,
							<code style={{ margin: "0 4px" }}>.env</code> file, or system environment.
						</Text>
					</Box>

					<Flex gap="3" wrap="wrap">
						<Badge size="2" color="gray" variant="soft">
							{totalVars} total variables
						</Badge>
						<Flex align="center" gap="1">
							<CheckCircledIcon color="var(--green-9)" />
							<Badge size="2" color="green" variant="soft">
								{documentedVars} documented
							</Badge>
						</Flex>
						<Flex align="center" gap="1">
							<QuestionMarkCircledIcon color="var(--amber-9)" />
							<Badge size="2" color="amber" variant="soft">
								{undocumentedVars} undocumented
							</Badge>
						</Flex>
					</Flex>

					<TextField.Root
						placeholder="Search environment variables..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						size="2"
					>
						<TextField.Slot>
							<MagnifyingGlassIcon />
						</TextField.Slot>
					</TextField.Root>

					<Box>
						{filteredCategories.length === 0 ? (
							<Box py="6">
								<Text color="gray" align="center" as="p">
									No environment variables found matching &quot;{searchQuery}&quot;
								</Text>
							</Box>
						) : (
							filteredCategories.map((category) => (
								<CategoryCard
									key={category.id}
									category={category}
									searchQuery={searchQuery}
								/>
							))
						)}
					</Box>

					<Box py="4">
						<Text size="1" color="gray" align="center" as="p">
							Environment variables discovered from{" "}
							<Text style={{ fontFamily: "monospace" }}>@anthropic-ai/claude-code</Text> v2.1.12
							and official documentation.
						</Text>
					</Box>
				</Flex>
			</Container>
		</ScrollArea>
	);
}
