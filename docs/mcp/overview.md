# MCP Server

Appwrite ORM includes a Model Context Protocol (MCP) server that provides AI assistants with access to documentation.

## Installation

The MCP server is included with the npm package:

```bash
npx appwrite-orm
```

## Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "appwrite-orm-docs": {
      "command": "npx",
      "args": ["appwrite-orm@latest"],
      "disabled": false
    }
  }
}
```

## Available Tools

Currently, the MCP server is only used for documentation. If you want to add anything to the MCP server, send an issue or implement it and send a request.
