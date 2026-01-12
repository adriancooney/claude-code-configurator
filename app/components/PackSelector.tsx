"use client";

import { Box, Checkbox, Flex, Text } from "@radix-ui/themes";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { TOOL_PACKS, getPackState, togglePack } from "../lib/packs";

interface PackSelectorProps {
	rules: string[];
	onChange: (rules: string[]) => void;
}

export function PackSelector({ rules, onChange }: PackSelectorProps) {
	const getState = (id: string) => getPackState(id, rules);

	const handleToggle = (id: string, field: "read" | "write", checked: boolean) => {
		onChange(togglePack(id, field, checked, rules));
	};

	const allReadEnabled = TOOL_PACKS.every(pack => getState(pack.id).read);
	const allWriteEnabled = TOOL_PACKS.every(pack => getState(pack.id).write);
	const someReadEnabled = TOOL_PACKS.some(pack => getState(pack.id).read);
	const someWriteEnabled = TOOL_PACKS.some(pack => getState(pack.id).write);

	const toggleAllRead = (checked: boolean) => {
		let newRules = [...rules];
		for (const pack of TOOL_PACKS) {
			newRules = togglePack(pack.id, "read", checked, newRules);
		}
		onChange(newRules);
	};

	const toggleAllWrite = (checked: boolean) => {
		let newRules = [...rules];
		for (const pack of TOOL_PACKS) {
			newRules = togglePack(pack.id, "write", checked, newRules);
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
				<Flex gap="4" px="2" py="1">
					<Text as="label" size="2">
						<Flex gap="2" align="center">
							<Checkbox
								checked={allReadEnabled ? true : someReadEnabled ? "indeterminate" : false}
								onCheckedChange={(c) => toggleAllRead(c === true)}
							/>
							Read
						</Flex>
					</Text>
					<Text as="label" size="2">
						<Flex gap="2" align="center">
							<Checkbox
								checked={allWriteEnabled ? true : someWriteEnabled ? "indeterminate" : false}
								onCheckedChange={(c) => toggleAllWrite(c === true)}
							/>
							Write
						</Flex>
					</Text>
				</Flex>
			</Flex>
			<Flex direction="column" gap="3">
				{TOOL_PACKS.map((pack) => {
					const state = getState(pack.id);
					const isLinked = pack.singleToggle;
					return (
						<Flex key={pack.id} justify="between" align="center">
							<Flex direction="column" gap="0">
								<Text size="2" weight="medium">{pack.name}</Text>
								<Text size="1" color="gray">{pack.description}</Text>
							</Flex>
							<Flex
								gap="3"
								align="center"
								px="2"
								py="1"
								style={isLinked ? {
									background: "var(--gray-a3)",
									borderRadius: "var(--radius-2)",
								} : undefined}
							>
								{isLinked && (
									<LockClosedIcon color="var(--gray-9)" style={{ width: 12, height: 12 }} />
								)}
								<Flex gap="4" align="center">
									<Text as="label" size="2">
										<Flex gap="2" align="center">
											<Checkbox
												checked={state.read}
												onCheckedChange={(c) => handleToggle(pack.id, "read", c === true)}
											/>
											Read
										</Flex>
									</Text>
									<Text as="label" size="2">
										<Flex gap="2" align="center">
											<Checkbox
												checked={state.write}
												onCheckedChange={(c) => handleToggle(pack.id, "write", c === true)}
											/>
											Write
										</Flex>
									</Text>
								</Flex>
							</Flex>
						</Flex>
					);
				})}
			</Flex>
		</Box>
	);
}
