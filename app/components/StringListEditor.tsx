"use client";

import { Box, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";

interface StringListEditorProps {
	label: string;
	description?: string;
	items: string[];
	onChange: (items: string[]) => void;
	placeholder?: string;
}

export function StringListEditor({
	label,
	description,
	items,
	onChange,
	placeholder = "Add item...",
}: StringListEditorProps) {
	const [newItem, setNewItem] = useState("");

	const addItem = () => {
		const trimmed = newItem.trim();
		if (trimmed && !items.includes(trimmed)) {
			onChange([...items, trimmed]);
			setNewItem("");
		}
	};

	const removeItem = (index: number) => {
		onChange(items.filter((_, i) => i !== index));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addItem();
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
				{items.map((item, index) => (
					<Flex key={`${item}-${index}`} gap="2" align="center">
						<TextField.Root
							size="2"
							value={item}
							onChange={(e) => {
								const updated = [...items];
								updated[index] = e.target.value;
								onChange(updated);
							}}
							style={{ flex: 1, fontFamily: "monospace" }}
						/>
						<IconButton size="2" variant="soft" color="red" onClick={() => removeItem(index)}>
							<Cross2Icon />
						</IconButton>
					</Flex>
				))}
				<Flex gap="2">
					<TextField.Root
						size="2"
						placeholder={placeholder}
						value={newItem}
						onChange={(e) => setNewItem(e.target.value)}
						onKeyDown={handleKeyDown}
						style={{ flex: 1, fontFamily: "monospace" }}
					/>
					<IconButton size="2" variant="soft" onClick={addItem} disabled={!newItem.trim()}>
						<PlusIcon />
					</IconButton>
				</Flex>
			</Flex>
		</Box>
	);
}
