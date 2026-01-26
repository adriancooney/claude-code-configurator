"use client";

import { Box, Checkbox, Flex, Text } from "@radix-ui/themes";
import type { Hooks, HookEntry } from "../lib/schema";

interface HookPack {
  id: string;
  name: string;
  url: string;
  description: string;
  hookType: keyof Hooks;
  matcher?: string;
  command: string;
}

const HOOK_PACKS: HookPack[] = [
  {
    id: "dcg",
    name: "Destructive Command Guard",
    url: "https://github.com/Dicklesworthstone/destructive_command_guard",
    description:
      "Blocks destructive commands (rm -rf, git reset --hard, DROP TABLE, etc.)",
    hookType: "PreToolUse",
    matcher: "Bash",
    command: "dcg",
  },
];

interface HookPackSelectorProps {
  hooks: Hooks;
  onChange: (hooks: Hooks) => void;
}

function isHookPackEnabled(pack: HookPack, hooks: Hooks): boolean {
  const entries = hooks[pack.hookType] || [];
  return entries.some(
    (entry) =>
      entry.matcher === pack.matcher && entry.hooks.includes(pack.command),
  );
}

function toggleHookPack(pack: HookPack, enabled: boolean, hooks: Hooks): Hooks {
  const entries = [...(hooks[pack.hookType] || [])];

  if (enabled) {
    const existingEntry = entries.find((e) => e.matcher === pack.matcher);
    if (existingEntry) {
      if (!existingEntry.hooks.includes(pack.command)) {
        existingEntry.hooks = [...existingEntry.hooks, pack.command];
      }
    } else {
      entries.push({
        matcher: pack.matcher,
        hooks: [pack.command],
      });
    }
  } else {
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.matcher === pack.matcher) {
        entry.hooks = entry.hooks.filter((h) => h !== pack.command);
        if (entry.hooks.length === 0) {
          entries.splice(i, 1);
        }
      }
    }
  }

  return {
    ...hooks,
    [pack.hookType]: entries.length > 0 ? entries : undefined,
  };
}

export function HookPackSelector({ hooks, onChange }: HookPackSelectorProps) {
  const handleToggle = (pack: HookPack, checked: boolean) => {
    onChange(toggleHookPack(pack, checked, hooks));
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
            Hook Packs
          </Text>
          <Text size="1" color="gray" style={{ display: "block" }}>
            Pre-configured hooks for common use cases.
          </Text>
        </Box>
        <Flex gap="4" align="center" px="2" py="1">
          <Text as="label" size="2">
            <Flex gap="2" align="center">
              Enabled
            </Flex>
          </Text>
        </Flex>
      </Flex>
      <Flex direction="column" gap="3">
        {HOOK_PACKS.map((pack) => {
          const enabled = isHookPackEnabled(pack, hooks);
          return (
            <Flex key={pack.id} justify="between" align="center">
              <Flex direction="column" gap="0">
                <Text size="2" weight="medium">
                  <a
                    href={pack.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", textDecoration: "underline" }}
                  >
                    {pack.name}
                  </a>
                </Text>
                <Text size="1" color="gray">
                  {pack.description}
                </Text>
              </Flex>
              <Flex gap="4" align="center" px="2" py="1">
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <Checkbox
                      checked={enabled}
                      onCheckedChange={(c) => handleToggle(pack, c === true)}
                    />
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
