# ts-mcp

A TypeScript Model Context Protocol (MCP) server for medical instrument order, product, and support-ticket data.

## Setup

```bash
pnpm.cmd install
pnpm.cmd run build
```

## Development

```bash
pnpm.cmd run dev
```

## MCP Client Command

Build the project first:

```bash
pnpm.cmd run build
```

Then configure your MCP client to run the compiled absolute path:

```json
{
  "mcpServers": {
    "ts-mcp": {
      "command": "node",
      "args": ["C:\\projects\\ts-mcp\\dist\\index.js"]
    }
  }
}
```

## Authentication and Roles

Tools accept an `apiKey` argument. Resources can use transport auth, or `TS_MCP_RESOURCE_API_KEY` for stdio clients that cannot pass per-resource API keys.

Local development keys are available when `TS_MCP_API_KEYS` is not set:

- `admin-dev-key`: full access
- `support-dev-key`: orders, products, and tickets
- `analytics-dev-key`: orders, products, tickets, and metrics

For production, set `TS_MCP_API_KEYS` to a JSON object:

```json
{
  "your-secret-key": {
    "id": "service-name",
    "roles": ["admin"]
  }
}
```

Available roles are `admin`, `support`, `analytics`, and `readonly`.

## Audit Logs

Every allowed, denied, and failed resource/tool access is written as JSON lines to stderr. To also write audit logs to a file, set:

```bash
set TS_MCP_AUDIT_LOG_PATH=C:\projects\ts-mcp\logs\audit.jsonl
```

## Metrics

Use the `get_health_metrics` tool with an API key that has metrics access, such as `admin-dev-key` or `analytics-dev-key`.