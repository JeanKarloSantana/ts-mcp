#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { orders } from "./resource-data/orders.js";
import { products } from "./resource-data/products.js";
import { supportTickets } from "./resource-data/support-tickets.js";

const server = new McpServer({
  name: "ts-mcp",
  version: "0.1.0"
});

function jsonResource(uri: URL, data: unknown) {
  return {
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2)
      }
    ]
  };
}

server.registerResource(
  "order-history",
  "mcp://order/order-history",
  {
    title: "Customer Order History",
    description: "Recent customer orders for understanding purchases and fulfillment status.",
    mimeType: "application/json"
  },
  async (uri) => jsonResource(uri, orders)
);

server.registerResource(
  "product-information",
  "mcp://product/product-information",
  {
    title: "Product Information",
    description: "Product catalog details for answering questions about medical instruments, pricing, and availability.",
    mimeType: "application/json"
  },
  async (uri) => jsonResource(uri, products)
);

server.registerResource(
  "support-ticket-data",
  "mcp://support/support-ticket",
  {
    title: "Support Ticket Data",
    description: "Customer support ticket history for providing personalized help with medical instrument orders.",
    mimeType: "application/json"
  },
  async (uri) => jsonResource(uri, supportTickets)
);

server.registerTool(
  "hello",
  {
    description: "Return a friendly greeting.",
    inputSchema: {
      name: z.string().default("world").describe("Name to greet")
    }
  },
  async ({ name }) => ({
    content: [
      {
        type: "text",
        text: `Hello, ${name}!`
      }
    ]
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);