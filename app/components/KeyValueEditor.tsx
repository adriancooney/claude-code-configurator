"use client";

import { Box, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";

interface KeyValueEditorProps {
	label: string;
	description?: string;
	entries: Record<string, string>;
	onChange: (entries: Record<string, string>) => void;
	keyPlaceholder?: string;
	valuePlaceholder?: string;
}

export function KeyValueEditor({
	label,
	description,
	entries,
	onChange,
	keyPlaceholder = "Key",
	valuePlaceholder = "Value",
}: KeyValueEditorProps) {
	const [newKey, setNewKey] = useState("");
	const [newValue, setNewValue] = useState("");

	const entryList = Object.entries(entries);

	const addEntry = () => {
		const trimmedKey = newKey.trim();
		if (trimmedKey && !(trimmedKey in entries)) {
			onChange({ ...entries, [trimmedKey]: newValue });
			setNewKey("");
			setNewValue("");
		}
	};

	const removeEntry = (key: string) => {
		const updated = { ...entries };
		delete updated[key];
		onChange(updated);
	};

	const updateValue = (key: string, value: string) => {
		onChange({ ...entries, [key]: value });
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addEntry();
		}
	};

	return (
		<Box>
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
			<Flex direction="column" gap="2">
				{entryList.map(([key, value]) => (
					<Flex key={key} gap="2" align="center">
						<TextField.Root
							size="2"
							value={key}
							readOnly
							style={{ flex: 1, fontFamily: "monospace" }}
						/>
						<TextField.Root
							size="2"
							value={value}
							onChange={(e) => updateValue(key, e.target.value)}
							style={{ flex: 2, fontFamily: "monospace" }}
						/>
						<IconButton size="2" variant="soft" color="red" onClick={() => removeEntry(key)}>
							<Cross2Icon />
						</IconButton>
					</Flex>
				))}
				<Flex gap="2">
					<TextField.Root
						size="2"
						placeholder={keyPlaceholder}
						value={newKey}
						onChange={(e) => setNewKey(e.target.value)}
						onKeyDown={handleKeyDown}
						style={{ flex: 1, fontFamily: "monospace" }}
					/>
					<TextField.Root
						size="2"
						placeholder={valuePlaceholder}
						value={newValue}
						onChange={(e) => setNewValue(e.target.value)}
						onKeyDown={handleKeyDown}
						style={{ flex: 2, fontFamily: "monospace" }}
					/>
					<IconButton size="2" variant="soft" onClick={addEntry} disabled={!newKey.trim()}>
						<PlusIcon />
					</IconButton>
				</Flex>
			</Flex>
		</Box>
	);
}
