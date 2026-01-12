"use client";

import { Box, Checkbox, Flex, Text } from "@radix-ui/themes";
import { WEB_PACKS, getWebPackState, toggleWebPack } from "../lib/packs";

interface WebPackSelectorProps {
	rules: string[];
	onChange: (rules: string[]) => void;
}

export function WebPackSelector({ rules, onChange }: WebPackSelectorProps) {
	const isEnabled = (id: string) => getWebPackState(id, rules);

	const handleToggle = (id: string, checked: boolean) => {
		onChange(toggleWebPack(id, checked, rules));
	};

	const allEnabled = WEB_PACKS.every(pack => isEnabled(pack.id));
	const someEnabled = WEB_PACKS.some(pack => isEnabled(pack.id));

	const toggleAll = (checked: boolean) => {
		let newRules = [...rules];
		for (const pack of WEB_PACKS) {
			newRules = toggleWebPack(pack.id, checked, newRules);
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
						Web Research Packs
					</Text>
					<Text size="1" color="gray" style={{ display: "block" }}>
						Pre-configured domain allowlists for web fetching.
					</Text>
				</Box>
				<Checkbox
					checked={allEnabled ? true : someEnabled ? "indeterminate" : false}
					onCheckedChange={(c) => toggleAll(c === true)}
				/>
			</Flex>
			<Flex direction="column" gap="3">
				{WEB_PACKS.map((pack) => (
					<Flex key={pack.id} justify="between" align="center">
						<Flex direction="column" gap="0">
							<Text size="2" weight="medium">{pack.name}</Text>
							<Text size="1" color="gray">{pack.description}</Text>
						</Flex>
						<Checkbox
							checked={isEnabled(pack.id)}
							onCheckedChange={(c) => handleToggle(pack.id, c === true)}
						/>
					</Flex>
				))}
			</Flex>
		</Box>
	);
}
