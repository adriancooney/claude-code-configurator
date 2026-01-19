"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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

type DocFilter = "all" | "documented" | "undocumented";

function EnvVarRow({ envVar, isLast }: { envVar: EnvVar; isLast: boolean }) {
	return (
		<Box
			py="2"
			style={isLast ? { paddingBottom: 0 } : { borderBottom: "1px solid var(--gray-4)" }}
		>
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
			<Text size="1" color="gray" as="p" style={{ margin: 0 }}>
				{envVar.description}
			</Text>
			{envVar.example && (
				<Text size="1" color="gray" as="p" style={{ fontFamily: "monospace", margin: 0, marginTop: 2 }}>
					e.g. <code>{envVar.example}</code>
				</Text>
			)}
		</Box>
	);
}

function CategoryCard({ category, searchQuery, docFilter }: { category: typeof ENV_VAR_CATEGORIES[0]; searchQuery: string; docFilter: DocFilter }) {
	const filteredVars = category.vars.filter((v) => {
		const matchesSearch =
			v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			v.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesDocFilter =
			docFilter === "all" ||
			(docFilter === "documented" && v.documented) ||
			(docFilter === "undocumented" && !v.documented);
		return matchesSearch && matchesDocFilter;
	});

	if (filteredVars.length === 0) return null;

	return (
		<Card mb="4">
			<Heading size="3">{category.name}</Heading>
			<Text size="2" color="gray">
				{category.description}
			</Text>
			<Box mt="2">
				{filteredVars.map((envVar, index) => (
					<EnvVarRow key={envVar.name} envVar={envVar} isLast={index === filteredVars.length - 1} />
				))}
			</Box>
		</Card>
	);
}

function EnvPageContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const searchQuery = searchParams.get("q") || "";
	const docFilter = (searchParams.get("filter") as DocFilter) || "all";

	const updateParams = useCallback((updates: { q?: string; filter?: DocFilter }) => {
		const params = new URLSearchParams(searchParams.toString());

		if (updates.q !== undefined) {
			if (updates.q) {
				params.set("q", updates.q);
			} else {
				params.delete("q");
			}
		}

		if (updates.filter !== undefined) {
			if (updates.filter && updates.filter !== "all") {
				params.set("filter", updates.filter);
			} else {
				params.delete("filter");
			}
		}

		const queryString = params.toString();
		router.replace(queryString ? `${pathname}?${queryString}` : pathname);
	}, [router, pathname, searchParams]);

	const totalVars = ENV_VAR_CATEGORIES.reduce((sum, cat) => sum + cat.vars.length, 0);
	const documentedVars = ENV_VAR_CATEGORIES.reduce(
		(sum, cat) => sum + cat.vars.filter((v) => v.documented).length,
		0
	);
	const undocumentedVars = totalVars - documentedVars;

	const filteredCategories = ENV_VAR_CATEGORIES.filter((cat) =>
		cat.vars.some((v) => {
			const matchesSearch =
				v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				v.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesDocFilter =
				docFilter === "all" ||
				(docFilter === "documented" && v.documented) ||
				(docFilter === "undocumented" && !v.documented);
			return matchesSearch && matchesDocFilter;
		})
	);

	const toggleFilter = (filter: DocFilter) => {
		updateParams({ filter: docFilter === filter ? "all" : filter });
	};

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
						<Flex
							align="center"
							gap="1"
							onClick={() => toggleFilter("documented")}
							style={{ cursor: "pointer" }}
						>
							<CheckCircledIcon color="var(--green-9)" />
							<Badge
								size="2"
								color="green"
								variant={docFilter === "documented" ? "solid" : "soft"}
							>
								{documentedVars} documented
							</Badge>
						</Flex>
						<Flex
							align="center"
							gap="1"
							onClick={() => toggleFilter("undocumented")}
							style={{ cursor: "pointer" }}
						>
							<QuestionMarkCircledIcon color="var(--amber-9)" />
							<Badge
								size="2"
								color="amber"
								variant={docFilter === "undocumented" ? "solid" : "soft"}
							>
								{undocumentedVars} undocumented
							</Badge>
						</Flex>
					</Flex>

					<TextField.Root
						placeholder="Search environment variables..."
						value={searchQuery}
						onChange={(e) => updateParams({ q: e.target.value })}
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
									No environment variables found matching your criteria
								</Text>
							</Box>
						) : (
							filteredCategories.map((category) => (
								<CategoryCard
									key={category.id}
									category={category}
									searchQuery={searchQuery}
									docFilter={docFilter}
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

export default function EnvPage() {
	return (
		<Suspense fallback={<Box p="6"><Text color="gray">Loading...</Text></Box>}>
			<EnvPageContent />
		</Suspense>
	);
}
