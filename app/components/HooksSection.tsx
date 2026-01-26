"use client";

import {
  Box,
  Button,
  Flex,
  IconButton,
  Select,
  Switch,
  Text,
  TextField,
} from "@radix-ui/themes";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import type { ClaudeCodeSettings, Hooks, HookEntry } from "../lib/schema";
import { ExternalLink } from "./ExternalLink";
import { HookPackSelector } from "./HookPackSelector";

const HOOK_TYPES: { value: keyof Hooks; label: string; description: string }[] =
  [
    {
      value: "PreToolUse",
      label: "Pre Tool Use",
      description: "Run before a tool executes",
    },
    {
      value: "PostToolUse",
      label: "Post Tool Use",
      description: "Run after a tool executes",
    },
    {
      value: "Notification",
      label: "Notification",
      description: "Run when a notification is sent",
    },
    {
      value: "UserPromptSubmit",
      label: "User Prompt Submit",
      description: "Run when user submits a prompt",
    },
  ];

interface HookEntryEditorProps {
  entry: HookEntry;
  onChange: (entry: HookEntry) => void;
  onRemove: () => void;
}

function HookEntryEditor({ entry, onChange, onRemove }: HookEntryEditorProps) {
  const [newHook, setNewHook] = useState("");

  const addHook = () => {
    if (newHook.trim()) {
      onChange({ ...entry, hooks: [...entry.hooks, newHook.trim()] });
      setNewHook("");
    }
  };

  const removeHook = (index: number) => {
    onChange({ ...entry, hooks: entry.hooks.filter((_, i) => i !== index) });
  };

  return (
    <Box
      style={{
        border: "1px solid var(--gray-6)",
        borderRadius: "var(--radius-2)",
        padding: "var(--space-3)",
      }}
    >
      <Flex justify="between" align="start" mb="3">
        <Box style={{ flex: 1 }}>
          <Text size="1" color="gray" mb="1" style={{ display: "block" }}>
            Matcher (optional tool pattern)
          </Text>
          <TextField.Root
            size="2"
            placeholder="e.g., Bash, Edit, *"
            value={entry.matcher || ""}
            onChange={(e) =>
              onChange({ ...entry, matcher: e.target.value || undefined })
            }
            style={{ fontFamily: "monospace" }}
          />
        </Box>
        <IconButton
          size="1"
          variant="ghost"
          color="red"
          onClick={onRemove}
          ml="2"
        >
          <Cross2Icon />
        </IconButton>
      </Flex>

      <Text size="1" color="gray" mb="1" style={{ display: "block" }}>
        Commands to run
      </Text>
      <Flex direction="column" gap="2">
        {entry.hooks.map((hook, index) => (
          <Flex key={index} gap="2" align="center">
            <TextField.Root
              size="2"
              value={hook}
              onChange={(e) => {
                const updated = [...entry.hooks];
                updated[index] = e.target.value;
                onChange({ ...entry, hooks: updated });
              }}
              style={{ flex: 1, fontFamily: "monospace" }}
            />
            <IconButton
              size="2"
              variant="soft"
              color="red"
              onClick={() => removeHook(index)}
            >
              <Cross2Icon />
            </IconButton>
          </Flex>
        ))}
        <Flex gap="2">
          <TextField.Root
            size="2"
            placeholder="e.g., ./scripts/lint.sh $FILE"
            value={newHook}
            onChange={(e) => setNewHook(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addHook();
              }
            }}
            style={{ flex: 1, fontFamily: "monospace" }}
          />
          <IconButton
            size="2"
            variant="soft"
            onClick={addHook}
            disabled={!newHook.trim()}
          >
            <PlusIcon />
          </IconButton>
        </Flex>
      </Flex>
    </Box>
  );
}

interface HooksSectionProps {
  settings: ClaudeCodeSettings;
  onChange: (settings: ClaudeCodeSettings) => void;
}

export function HooksSection({ settings, onChange }: HooksSectionProps) {
  const [selectedType, setSelectedType] = useState<keyof Hooks>("PreToolUse");
  const hooks = settings.hooks || {};

  const updateHooks = (newHooks: Hooks) => {
    const cleaned: Hooks = {};
    for (const [key, entries] of Object.entries(newHooks)) {
      if (entries && entries.length > 0) {
        cleaned[key as keyof Hooks] = entries;
      }
    }
    onChange({
      ...settings,
      hooks: Object.keys(cleaned).length > 0 ? cleaned : undefined,
    });
  };

  const addEntry = (type: keyof Hooks) => {
    const current = hooks[type] || [];
    updateHooks({ ...hooks, [type]: [...current, { hooks: [] }] });
  };

  const updateEntry = (type: keyof Hooks, index: number, entry: HookEntry) => {
    const current = [...(hooks[type] || [])];
    current[index] = entry;
    updateHooks({ ...hooks, [type]: current });
  };

  const removeEntry = (type: keyof Hooks, index: number) => {
    const current = (hooks[type] || []).filter((_, i) => i !== index);
    updateHooks({ ...hooks, [type]: current });
  };

  const currentEntries = hooks[selectedType] || [];

  return (
    <Flex direction="column" gap="5">
      <Text size="2" color="gray">
        Configure custom commands that run before or after tool executions.{" "}
        <ExternalLink href="https://code.claude.com/docs/en/hooks">
          Learn more
        </ExternalLink>
      </Text>

      <Flex justify="between" align="center">
        <Flex direction="column" gap="1">
          <Text size="2" weight="medium">
            Disable All Hooks
          </Text>
          <Text size="1" color="gray">
            Prevent all hooks from executing
          </Text>
        </Flex>
        <Switch
          checked={settings.disableAllHooks ?? false}
          onCheckedChange={(disableAllHooks) =>
            onChange({ ...settings, disableAllHooks })
          }
        />
      </Flex>

      <Box
        style={{
          background: "var(--violet-a3)",
          borderRadius: "var(--radius-3)",
          padding: "var(--space-4)",
        }}
      >
        <HookPackSelector
          hooks={hooks}
          onChange={(newHooks) => updateHooks(newHooks)}
        />
      </Box>

      <Box>
        <Text
          as="label"
          size="2"
          weight="medium"
          mb="2"
          style={{ display: "block" }}
        >
          Hook Type
        </Text>
        <Select.Root
          value={selectedType}
          onValueChange={(v) => setSelectedType(v as keyof Hooks)}
        >
          <Select.Trigger style={{ width: "100%" }} />
          <Select.Content>
            {HOOK_TYPES.map((type) => (
              <Select.Item key={type.value} value={type.value}>
                {type.label}
                {(hooks[type.value]?.length || 0) > 0 && (
                  <Text color="gray" ml="2">
                    ({hooks[type.value]?.length})
                  </Text>
                )}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Text size="1" color="gray" mt="1">
          {HOOK_TYPES.find((t) => t.value === selectedType)?.description}
        </Text>
      </Box>

      <Flex direction="column" gap="3">
        {currentEntries.map((entry, index) => (
          <HookEntryEditor
            key={index}
            entry={entry}
            onChange={(updated) => updateEntry(selectedType, index, updated)}
            onRemove={() => removeEntry(selectedType, index)}
          />
        ))}

        <Button variant="soft" onClick={() => addEntry(selectedType)}>
          <PlusIcon />
          Add {HOOK_TYPES.find((t) => t.value === selectedType)?.label} Hook
        </Button>
      </Flex>
    </Flex>
  );
}
