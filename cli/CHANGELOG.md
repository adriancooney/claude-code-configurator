# configure-claude-code

## 0.2.0

### Minor Changes

- 60de03c: Initial release of configure-claude-code CLI

  - Parse tool references from Claude Code settings (hooks, permissions, sandbox, MCP servers)
  - Detect installed tools via configurable detect commands
  - Install missing tools with platform-specific install commands
  - Three commands: `ccc install`, `ccc check`, `ccc list`
  - Initial tool registry with dcg (Destructive Command Guard)
  - MCP server support with setup instructions (next-devtools)
