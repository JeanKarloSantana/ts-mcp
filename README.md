# ts-mcp

A small TypeScript starter for a Model Context Protocol (MCP) server.

## Setup

```bash
npm install
npm run build
```

## Development

```bash
npm run dev
```

The server currently exposes one tool:

- `hello`: returns a greeting for the supplied name.

## Use With an MCP Client

Build the project first:

```bash
npm run build
```

Then configure your MCP client to run:

```bash
node /absolute/path/to/ts-mcp/dist/index.js
```
