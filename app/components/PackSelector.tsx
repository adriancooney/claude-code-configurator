"use client";

import { Box, Checkbox, Flex, Text } from "@radix-ui/themes";
import { TOOL_PACKS, getPackState, togglePack } from "../lib/packs";

interface PackSelectorProps {
	rules: string[];
	onChange: (rules: string[]) => void;
}

export function PackSelector({ rules, onChange }: PackSelectorProps) {
	const getState = (id: string) => getPackState(id, rules);

	const handleToggle = (id: string, field: "readOnly" | "readWrite", checked: boolean) => {
		let newRules = [...rules];
		if (checked) {
			// When enabling one, disable the other first
			if (field === "readOnly") {
				newRules = togglePack(id, "readWrite", false, newRules);
			} else {
				newRules = togglePack(id, "readOnly", false, newRules);
			}
		}
		newRules = togglePack(id, field, checked, newRules);
		onChange(newRules);
	};

	// Calculate select-all states
	const packsWithReadOnly = TOOL_PACKS.filter(p => p.readOnly.length > 0);
	const packsWithReadWrite = TOOL_PACKS.filter(p => p.readWrite.length > 0);

	const allReadOnlySelected = packsWithReadOnly.length > 0 && packsWithReadOnly.every(p => getState(p.id).readOnly);
	const allReadWriteSelected = packsWithReadWrite.length > 0 && packsWithReadWrite.every(p => getState(p.id).readWrite);

	const handleSelectAllReadOnly = (checked: boolean) => {
		let newRules = [...rules];
		for (const pack of packsWithReadOnly) {
			if (checked) {
				// Disable read-write first when enabling read-only
				newRules = togglePack(pack.id, "readWrite", false, newRules);
			}
			newRules = togglePack(pack.id, "readOnly", checked, newRules);
		}
		onChange(newRules);
	};

	const handleSelectAllReadWrite = (checked: boolean) => {
		let newRules = [...rules];
		for (const pack of packsWithReadWrite) {
			if (checked) {
				// Disable read-only first when enabling read-write
				newRules = togglePack(pack.id, "readOnly", false, newRules);
			}
			newRules = togglePack(pack.id, "readWrite", checked, newRules);
		}
		onChange(newRules);
	};

	return (
		<Box>
			<Flex
				justify="between"
				align="center"
				mb="3"
				mx="-4"
				mt="-4"
				px="4"
				py="3"
				style={{
					background: "var(--violet-a4)",
					borderTopLeftRadius: "var(--radius-3)",
					borderTopRightRadius: "var(--radius-3)",
				}}
			>
				<Box>
					<Text size="2" weight="medium">
						Tool Packs
					</Text>
					<Text size="1" color="gray" style={{ display: "block" }}>
						Pre-configured permission sets for common tools.
					</Text>
				</Box>
				<Flex gap="4" align="center" px="2" py="1">
					<Text as="label" size="2">
						<Flex gap="2" align="center">
							<Checkbox
								checked={allReadOnlySelected}
								onCheckedChange={(c) => handleSelectAllReadOnly(c === true)}
							/>
							Read-only
						</Flex>
					</Text>
					<Text as="label" size="2">
						<Flex gap="2" align="center">
							<Checkbox
								checked={allReadWriteSelected}
								onCheckedChange={(c) => handleSelectAllReadWrite(c === true)}
							/>
							Read-write
						</Flex>
					</Text>
				</Flex>
			</Flex>
			<Flex direction="column" gap="3">
				{TOOL_PACKS.map((pack) => {
					const state = getState(pack.id);
					const hasReadOnly = pack.readOnly.length > 0;
					const hasReadWrite = pack.readWrite.length > 0;
					return (
						<Flex key={pack.id} justify="between" align="center">
							<Flex direction="column" gap="0">
								<Text size="2" weight="medium">
									{pack.url ? (
										<a href={pack.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
											{pack.name}
										</a>
									) : pack.name}
								</Text>
								<Text size="1" color="gray">{pack.description}</Text>
							</Flex>
							<Flex gap="4" align="center" px="2" py="1">
								<Text as="label" size="2" color={hasReadOnly ? undefined : "gray"}>
									<Flex gap="2" align="center">
										<Checkbox
											checked={state.readOnly}
											disabled={!hasReadOnly}
											onCheckedChange={(c) => handleToggle(pack.id, "readOnly", c === true)}
										/>
										Read-only
									</Flex>
								</Text>
								<Text as="label" size="2" color={hasReadWrite ? undefined : "gray"}>
									<Flex gap="2" align="center">
										<Checkbox
											checked={state.readWrite}
											disabled={!hasReadWrite}
											onCheckedChange={(c) => handleToggle(pack.id, "readWrite", c === true)}
										/>
										Read-write
									</Flex>
								</Text>
							</Flex>
						</Flex>
					);
				})}
			</Flex>
		</Box>
	);
}
