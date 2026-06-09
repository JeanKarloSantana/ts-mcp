#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { assertPermission, authenticate, AuthError, principalFromTransportAuth, type Permission, type Principal } from "./auth.js";
import { auditAccess } from "./audit.js";
import { getMetricsSnapshot, recordMetric } from "./metrics.js";
import { orders, type Order } from "./resource-data/orders.js";
import { products } from "./resource-data/products.js";
import { supportTickets } from "./resource-data/support-tickets.js";

const server = new McpServer({
  name: "ts-mcp",
  version: "0.1.0"
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);
const authInput = {
  apiKey: z.string().optional().describe("API key for RBAC-protected access")
};

type RequestExtra = {
  authInfo?: { token: string; clientId: string; scopes: string[] };
  sessionId?: string;
};

const orderById = new Map(orders.map((order) => [order.orderId, order]));
const ticketById = new Map(supportTickets.map((ticket) => [ticket.ticketId, ticket]));
const productBySku = new Map(products.map((product) => [product.sku, product]));
const ordersByCustomerId = groupBy(orders, (order) => order.customerId);
const ordersByMonth = groupBy(orders, (order) => order.orderDate.slice(0, 7));
const ordersByHighestTotal = [...orders].sort((a, b) => b.total - a.total);
const ordersByLowestTotal = [...orders].sort((a, b) => a.total - b.total);
const productSummaryCache = new Map<string, ProductQuantitySummary[]>();

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  return grouped;
}

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

function jsonToolResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2)
      }
    ]
  };
}

function errorToolResult(message: string) {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: message
      }
    ]
  };
}

function resolvePrincipal(apiKey: string | undefined, extra: RequestExtra): Principal | null {
  return authenticate(apiKey) ?? principalFromTransportAuth(extra) ?? authenticate(process.env.TS_MCP_RESOURCE_API_KEY);
}

function countResults(data: unknown) {
  if (data && typeof data === "object" && "count" in data && typeof data.count === "number") {
    return data.count;
  }

  if (Array.isArray(data)) {
    return data.length;
  }

  return undefined;
}

async function guardedTool(
  action: string,
  permission: Permission,
  apiKey: string | undefined,
  extra: RequestExtra,
  run: (principal: Principal) => unknown | Promise<unknown>
) {
  const startedAt = performance.now();
  let principal: Principal | null = null;

  try {
    principal = assertPermission(resolvePrincipal(apiKey, extra), permission);
    const data = await run(principal);
    const durationMs = Number((performance.now() - startedAt).toFixed(2));

    recordMetric(action, durationMs);
    auditAccess({
      action: "tool.call",
      target: action,
      decision: "allowed",
      principal,
      sessionId: extra.sessionId,
      durationMs,
      resultCount: countResults(data)
    });

    return jsonToolResult(data);
  } catch (error) {
    const durationMs = Number((performance.now() - startedAt).toFixed(2));
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const isAuthError = error instanceof AuthError;

    recordMetric(action, durationMs, true);
    auditAccess({
      action: "tool.call",
      target: action,
      decision: isAuthError ? "denied" : "error",
      principal,
      sessionId: extra.sessionId,
      durationMs,
      error: message
    });

    return errorToolResult(isAuthError ? message : "The server could not complete this request safely.");
  }
}

async function guardedResource(
  resourceName: string,
  permission: Permission,
  uri: URL,
  extra: RequestExtra,
  read: () => unknown
) {
  const startedAt = performance.now();
  let principal: Principal | null = null;

  try {
    principal = assertPermission(resolvePrincipal(undefined, extra), permission);
    const data = read();
    const durationMs = Number((performance.now() - startedAt).toFixed(2));

    recordMetric(resourceName, durationMs);
    auditAccess({
      action: "resource.read",
      target: resourceName,
      decision: "allowed",
      principal,
      sessionId: extra.sessionId,
      durationMs,
      resultCount: countResults(data)
    });

    return jsonResource(uri, data);
  } catch (error) {
    const durationMs = Number((performance.now() - startedAt).toFixed(2));
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    recordMetric(resourceName, durationMs, true);
    auditAccess({
      action: "resource.read",
      target: resourceName,
      decision: error instanceof AuthError ? "denied" : "error",
      principal,
      sessionId: extra.sessionId,
      durationMs,
      error: message
    });

    throw error instanceof AuthError ? error : new Error("The server could not read this resource safely.");
  }
}

function ordersForMonth(month: string) {
  return ordersByMonth.get(month) ?? [];
}

type ProductQuantitySummary = {
  sku: string;
  name: string;
  quantity: number;
  revenue: number;
};

function summarizeProductQuantities(month?: string) {
  const cacheKey = month ?? "all";
  const cached = productSummaryCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const selectedOrders = month ? ordersForMonth(month) : orders;
  const quantities = new Map<string, ProductQuantitySummary>();

  for (const order of selectedOrders) {
    for (const item of order.items) {
      const current = quantities.get(item.sku) ?? {
        sku: item.sku,
        name: productBySku.get(item.sku)?.name ?? item.sku,
        quantity: 0,
        revenue: 0
      };

      current.quantity += item.quantity;
      current.revenue = Number((current.revenue + item.lineTotal).toFixed(2));
      quantities.set(item.sku, current);
    }
  }

  const summary = [...quantities.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);
  productSummaryCache.set(cacheKey, summary);
  return summary;
}

server.registerResource(
  "order-history",
  "mcp://order/order-history",
  {
    title: "Customer Order History",
    description: "Recent customer orders for understanding purchases and fulfillment status.",
    mimeType: "application/json"
  },
  async (uri, extra) => guardedResource("order-history", "orders:read", uri, extra, () => orders)
);

server.registerResource(
  "product-information",
  "mcp://product/product-information",
  {
    title: "Product Information",
    description: "Product catalog details for answering questions about medical instruments, pricing, and availability.",
    mimeType: "application/json"
  },
  async (uri, extra) => guardedResource("product-information", "products:read", uri, extra, () => products)
);

server.registerResource(
  "support-ticket-data",
  "mcp://support/support-ticket",
  {
    title: "Support Ticket Data",
    description: "Customer support ticket history for providing personalized help with medical instrument orders.",
    mimeType: "application/json"
  },
  async (uri, extra) => guardedResource("support-ticket-data", "tickets:read", uri, extra, () => supportTickets)
);

server.registerTool(
  "get_orders_by_date_range",
  {
    description: "Return orders placed within an inclusive date range.",
    inputSchema: {
      ...authInput,
      startDate: dateSchema.describe("Start date in YYYY-MM-DD format"),
      endDate: dateSchema.describe("End date in YYYY-MM-DD format")
    }
  },
  async ({ apiKey, startDate, endDate }, extra) => guardedTool("get_orders_by_date_range", "orders:read", apiKey, extra, () => {
    if (startDate > endDate) {
      throw new Error("startDate must be before or equal to endDate.");
    }

    const matchingOrders = orders.filter((order) => order.orderDate >= startDate && order.orderDate <= endDate);

    return {
      startDate,
      endDate,
      count: matchingOrders.length,
      orders: matchingOrders
    };
  })
);

server.registerTool(
  "get_orders_by_customer_id",
  {
    description: "Return all orders for a specific customer ID.",
    inputSchema: {
      ...authInput,
      customerId: z.string().describe("Customer ID, for example CUS-001")
    }
  },
  async ({ apiKey, customerId }, extra) => guardedTool("get_orders_by_customer_id", "orders:read", apiKey, extra, () => {
    const matchingOrders = ordersByCustomerId.get(customerId) ?? [];

    return {
      customerId,
      count: matchingOrders.length,
      orders: matchingOrders
    };
  })
);

server.registerTool(
  "get_orders_by_price_range",
  {
    description: "Return orders with totals between a minimum and maximum price, inclusive.",
    inputSchema: {
      ...authInput,
      minPrice: z.number().nonnegative().describe("Minimum order total"),
      maxPrice: z.number().nonnegative().describe("Maximum order total")
    }
  },
  async ({ apiKey, minPrice, maxPrice }, extra) => guardedTool("get_orders_by_price_range", "orders:read", apiKey, extra, () => {
    if (minPrice > maxPrice) {
      throw new Error("minPrice must be before or equal to maxPrice.");
    }

    const matchingOrders = orders.filter((order) => order.total >= minPrice && order.total <= maxPrice);

    return {
      minPrice,
      maxPrice,
      count: matchingOrders.length,
      orders: matchingOrders
    };
  })
);

server.registerTool(
  "get_month_order_extremes",
  {
    description: "Return the most expensive and lowest-cost orders for a specific month.",
    inputSchema: {
      ...authInput,
      month: monthSchema.describe("Month in YYYY-MM format, for example 2026-05"),
      limit: z.number().int().positive().max(20).default(5).describe("How many top and lowest orders to return")
    }
  },
  async ({ apiKey, month, limit }, extra) => guardedTool("get_month_order_extremes", "orders:read", apiKey, extra, () => {
    const monthlyOrders = ordersForMonth(month);
    const monthlyHighest = monthlyOrders.length === orders.length ? ordersByHighestTotal : [...monthlyOrders].sort((a, b) => b.total - a.total);
    const monthlyLowest = monthlyOrders.length === orders.length ? ordersByLowestTotal : [...monthlyOrders].sort((a, b) => a.total - b.total);

    return {
      month,
      count: monthlyOrders.length,
      highestCostOrders: monthlyHighest.slice(0, limit),
      lowestCostOrders: monthlyLowest.slice(0, limit)
    };
  })
);

server.registerTool(
  "get_order_by_ticket_id",
  {
    description: "Find the order connected to a support ticket.",
    inputSchema: {
      ...authInput,
      ticketId: z.string().describe("Support ticket ID, for example TCK-9001")
    }
  },
  async ({ apiKey, ticketId }, extra) => guardedTool("get_order_by_ticket_id", "tickets:read", apiKey, extra, () => {
    const ticket = ticketById.get(ticketId);

    if (!ticket) {
      return {
        ticketId,
        ticket: null,
        order: null
      };
    }

    return {
      ticket,
      order: orderById.get(ticket.orderId) ?? null
    };
  })
);

server.registerTool(
  "get_ticket_status_counts",
  {
    description: "Return support ticket statuses ordered from most common to least common.",
    inputSchema: authInput
  },
  async ({ apiKey }, extra) => guardedTool("get_ticket_status_counts", "tickets:read", apiKey, extra, () => {
    const statusCounts = new Map<string, number>();

    for (const ticket of supportTickets) {
      statusCounts.set(ticket.status, (statusCounts.get(ticket.status) ?? 0) + 1);
    }

    return {
      totalTickets: supportTickets.length,
      statuses: [...statusCounts.entries()]
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count)
    };
  })
);

server.registerTool(
  "get_most_ordered_products",
  {
    description: "Return the most ordered products across all orders by quantity.",
    inputSchema: {
      ...authInput,
      limit: z.number().int().positive().max(20).default(5).describe("How many products to return")
    }
  },
  async ({ apiKey, limit }, extra) => guardedTool("get_most_ordered_products", "products:read", apiKey, extra, () => ({
    count: products.length,
    products: summarizeProductQuantities().slice(0, limit)
  }))
);

server.registerTool(
  "get_most_ordered_products_by_month",
  {
    description: "Return the most ordered products in a specific month by quantity.",
    inputSchema: {
      ...authInput,
      month: monthSchema.describe("Month in YYYY-MM format, for example 2026-05"),
      limit: z.number().int().positive().max(20).default(5).describe("How many products to return")
    }
  },
  async ({ apiKey, month, limit }, extra) => guardedTool("get_most_ordered_products_by_month", "products:read", apiKey, extra, () => ({
    month,
    orderCount: ordersForMonth(month).length,
    products: summarizeProductQuantities(month).slice(0, limit)
  }))
);

server.registerTool(
  "get_highest_value_order",
  {
    description: "Return the order that brought the most revenue. Cost data is not available, so this uses order total instead of true profit.",
    inputSchema: authInput
  },
  async ({ apiKey }, extra) => guardedTool("get_highest_value_order", "orders:read", apiKey, extra, () => ({
    metric: "highest_order_total_revenue",
    note: "The data set has prices and totals, but no product cost or margin. This is highest revenue, not true profit.",
    order: ordersByHighestTotal[0] as Order | undefined
  }))
);

server.registerTool(
  "get_health_metrics",
  {
    description: "Return health and metrics for this MCP server.",
    inputSchema: authInput
  },
  async ({ apiKey }, extra) => guardedTool("get_health_metrics", "metrics:read", apiKey, extra, () => getMetricsSnapshot())
);

const transport = new StdioServerTransport();
await server.connect(transport);