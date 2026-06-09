#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "ts-mcp",
  version: "0.1.0"
});

const customerOrderHistory = [
  {
    orderId: "ORD-1001",
    customerId: "CUS-001",
    orderDate: "2026-05-18",
    status: "delivered",
    total: 129.97,
    items: [
      { sku: "PRD-KEYBOARD-01", name: "Mechanical Keyboard", quantity: 1 },
      { sku: "PRD-MOUSE-02", name: "Wireless Mouse", quantity: 1 }
    ]
  },
  {
    orderId: "ORD-1002",
    customerId: "CUS-001",
    orderDate: "2026-06-02",
    status: "processing",
    total: 49.99,
    items: [{ sku: "PRD-HEADSET-03", name: "USB-C Headset", quantity: 1 }]
  }
];

const productInformation = [
  {
    sku: "PRD-KEYBOARD-01",
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 89.99,
    inventory: 42,
    description: "Compact mechanical keyboard with hot-swappable switches."
  },
  {
    sku: "PRD-MOUSE-02",
    name: "Wireless Mouse",
    category: "Accessories",
    price: 39.98,
    inventory: 85,
    description: "Ergonomic wireless mouse with rechargeable battery."
  },
  {
    sku: "PRD-HEADSET-03",
    name: "USB-C Headset",
    category: "Audio",
    price: 49.99,
    inventory: 18,
    description: "Noise-reducing USB-C headset for calls and support workflows."
  }
];

const supportTicketData = [
  {
    ticketId: "TCK-9001",
    customerId: "CUS-001",
    createdAt: "2026-06-04",
    status: "open",
    priority: "medium",
    topic: "Order status",
    summary: "Customer asked for an update on order ORD-1002."
  },
  {
    ticketId: "TCK-9002",
    customerId: "CUS-001",
    createdAt: "2026-05-22",
    status: "resolved",
    priority: "low",
    topic: "Product setup",
    summary: "Customer needed help pairing the wireless mouse."
  }
];

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
  "customer-order-history",
  "mcp://customer/order-history",
  {
    title: "Customer Order History",
    description: "Recent customer orders for understanding purchases and fulfillment status.",
    mimeType: "application/json"
  },
  async (uri) => jsonResource(uri, customerOrderHistory)
);

server.registerResource(
  "product-information",
  "mcp://customer/product-information",
  {
    title: "Product Information",
    description: "Product catalog details for answering questions about items, pricing, and availability.",
    mimeType: "application/json"
  },
  async (uri) => jsonResource(uri, productInformation)
);

server.registerResource(
  "support-ticket-data",
  "mcp://customer/support-ticket-data",
  {
    title: "Support Ticket Data",
    description: "Customer support ticket history for providing personalized help.",
    mimeType: "application/json"
  },
  async (uri) => jsonResource(uri, supportTicketData)
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