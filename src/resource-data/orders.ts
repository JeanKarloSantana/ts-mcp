import { products } from "./products.js";

export type OrderStatus = "placed" | "on_the_way" | "delivered" | "cancelled";

export type OrderItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  orderId: string;
  customerId: string;
  orderDate: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
};

const productBySku = new Map(products.map((product) => [product.sku, product]));

function createOrder(
  orderId: string,
  customerId: string,
  orderDate: string,
  status: OrderStatus,
  itemQuantities: Array<[sku: string, quantity: number]>
): Order {
  const items = itemQuantities.map(([sku, quantity]) => {
    const product = productBySku.get(sku);

    if (!product) {
      throw new Error(`Unknown product SKU: ${sku}`);
    }

    const lineTotal = Number((product.price * quantity).toFixed(2));

    return {
      sku,
      name: product.name,
      quantity,
      unitPrice: product.price,
      lineTotal
    };
  });

  return {
    orderId,
    customerId,
    orderDate,
    status,
    total: Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)),
    items
  };
}

export const orders: Order[] = [
  createOrder("ORD-1001", "CUS-001", "2025-11-03", "delivered", [["MED-STETH-001", 1], ["MED-THERM-003", 2]]),
  createOrder("ORD-1002", "CUS-002", "2025-11-07", "delivered", [["MED-BP-002", 1]]),
  createOrder("ORD-1003", "CUS-003", "2025-11-12", "cancelled", [["MED-NEB-009", 1], ["MED-PULSE-004", 2]]),
  createOrder("ORD-1004", "CUS-004", "2025-11-18", "delivered", [["MED-SYR-007", 5], ["MED-SCALPEL-008", 2]]),
  createOrder("ORD-1005", "CUS-005", "2025-11-25", "delivered", [["MED-OTOS-005", 1], ["MED-THERM-003", 1]]),
  createOrder("ORD-1006", "CUS-006", "2025-12-02", "delivered", [["MED-GLUCO-006", 2], ["MED-SYR-007", 3]]),
  createOrder("ORD-1007", "CUS-007", "2025-12-06", "cancelled", [["MED-SUTURE-010", 4]]),
  createOrder("ORD-1008", "CUS-008", "2025-12-11", "delivered", [["MED-PULSE-004", 3], ["MED-BP-002", 1]]),
  createOrder("ORD-1009", "CUS-009", "2025-12-18", "delivered", [["MED-STETH-001", 2], ["MED-OTOS-005", 2], ["MED-THERM-003", 4]]),
  createOrder("ORD-1010", "CUS-010", "2025-12-27", "delivered", [["MED-NEB-009", 1], ["MED-GLUCO-006", 1]]),
  createOrder("ORD-1011", "CUS-011", "2026-01-04", "delivered", [["MED-SCALPEL-008", 5]]),
  createOrder("ORD-1012", "CUS-012", "2026-01-08", "delivered", [["MED-SYR-007", 10], ["MED-PULSE-004", 4]]),
  createOrder("ORD-1013", "CUS-013", "2026-01-14", "cancelled", [["MED-BP-002", 2], ["MED-THERM-003", 6]]),
  createOrder("ORD-1014", "CUS-014", "2026-01-21", "delivered", [["MED-SUTURE-010", 2], ["MED-SCALPEL-008", 2]]),
  createOrder("ORD-1015", "CUS-015", "2026-01-29", "delivered", [["MED-OTOS-005", 3]]),
  createOrder("ORD-1016", "CUS-016", "2026-02-03", "delivered", [["MED-NEB-009", 2], ["MED-PULSE-004", 5]]),
  createOrder("ORD-1017", "CUS-017", "2026-02-09", "delivered", [["MED-GLUCO-006", 1], ["MED-SYR-007", 8], ["MED-THERM-003", 3]]),
  createOrder("ORD-1018", "CUS-018", "2026-02-16", "cancelled", [["MED-STETH-001", 1], ["MED-BP-002", 1]]),
  createOrder("ORD-1019", "CUS-019", "2026-02-23", "delivered", [["MED-SUTURE-010", 6], ["MED-SCALPEL-008", 4]]),
  createOrder("ORD-1020", "CUS-020", "2026-03-01", "delivered", [["MED-THERM-003", 10], ["MED-PULSE-004", 10]]),
  createOrder("ORD-1021", "CUS-021", "2026-03-05", "delivered", [["MED-OTOS-005", 1], ["MED-STETH-001", 1], ["MED-BP-002", 1]]),
  createOrder("ORD-1022", "CUS-022", "2026-03-10", "cancelled", [["MED-NEB-009", 3]]),
  createOrder("ORD-1023", "CUS-023", "2026-03-15", "delivered", [["MED-SYR-007", 20], ["MED-SCALPEL-008", 6]]),
  createOrder("ORD-1024", "CUS-024", "2026-03-20", "delivered", [["MED-GLUCO-006", 4], ["MED-PULSE-004", 2]]),
  createOrder("ORD-1025", "CUS-025", "2026-03-27", "delivered", [["MED-SUTURE-010", 1], ["MED-OTOS-005", 1]]),
  createOrder("ORD-1026", "CUS-026", "2026-04-02", "delivered", [["MED-BP-002", 3], ["MED-THERM-003", 5]]),
  createOrder("ORD-1027", "CUS-027", "2026-04-07", "cancelled", [["MED-STETH-001", 2], ["MED-SUTURE-010", 2]]),
  createOrder("ORD-1028", "CUS-028", "2026-04-12", "delivered", [["MED-NEB-009", 1], ["MED-SYR-007", 12]]),
  createOrder("ORD-1029", "CUS-029", "2026-04-17", "delivered", [["MED-PULSE-004", 6], ["MED-GLUCO-006", 2], ["MED-THERM-003", 6]]),
  createOrder("ORD-1030", "CUS-030", "2026-04-22", "delivered", [["MED-SCALPEL-008", 10]]),
  createOrder("ORD-1031", "CUS-031", "2026-04-26", "on_the_way", [["MED-BP-002", 1], ["MED-PULSE-004", 2]]),
  createOrder("ORD-1032", "CUS-032", "2026-04-30", "delivered", [["MED-OTOS-005", 2], ["MED-SUTURE-010", 2]]),
  createOrder("ORD-1033", "CUS-033", "2026-05-03", "cancelled", [["MED-GLUCO-006", 5], ["MED-SYR-007", 10]]),
  createOrder("ORD-1034", "CUS-034", "2026-05-06", "delivered", [["MED-THERM-003", 8], ["MED-PULSE-004", 8]]),
  createOrder("ORD-1035", "CUS-035", "2026-05-09", "on_the_way", [["MED-STETH-001", 1], ["MED-OTOS-005", 1]]),
  createOrder("ORD-1036", "CUS-036", "2026-05-12", "delivered", [["MED-NEB-009", 2]]),
  createOrder("ORD-1037", "CUS-037", "2026-05-15", "placed", [["MED-SYR-007", 25], ["MED-SCALPEL-008", 8]]),
  createOrder("ORD-1038", "CUS-038", "2026-05-18", "delivered", [["MED-BP-002", 2], ["MED-GLUCO-006", 2]]),
  createOrder("ORD-1039", "CUS-039", "2026-05-21", "on_the_way", [["MED-SUTURE-010", 3], ["MED-SCALPEL-008", 3], ["MED-THERM-003", 4]]),
  createOrder("ORD-1040", "CUS-040", "2026-05-24", "cancelled", [["MED-NEB-009", 1], ["MED-BP-002", 1]]),
  createOrder("ORD-1041", "CUS-041", "2026-05-27", "delivered", [["MED-PULSE-004", 12]]),
  createOrder("ORD-1042", "CUS-042", "2026-05-29", "placed", [["MED-OTOS-005", 4], ["MED-STETH-001", 2]]),
  createOrder("ORD-1043", "CUS-043", "2026-05-31", "on_the_way", [["MED-THERM-003", 15], ["MED-SYR-007", 15]]),
  createOrder("ORD-1044", "CUS-044", "2026-06-01", "delivered", [["MED-GLUCO-006", 3], ["MED-SUTURE-010", 3]]),
  createOrder("ORD-1045", "CUS-045", "2026-06-02", "cancelled", [["MED-SCALPEL-008", 4], ["MED-SYR-007", 8]]),
  createOrder("ORD-1046", "CUS-046", "2026-06-03", "placed", [["MED-NEB-009", 2], ["MED-PULSE-004", 4]]),
  createOrder("ORD-1047", "CUS-047", "2026-06-04", "on_the_way", [["MED-BP-002", 2], ["MED-THERM-003", 6]]),
  createOrder("ORD-1048", "CUS-048", "2026-06-06", "placed", [["MED-STETH-001", 3]]),
  createOrder("ORD-1049", "CUS-049", "2026-06-08", "on_the_way", [["MED-OTOS-005", 1], ["MED-GLUCO-006", 1], ["MED-PULSE-004", 2]]),
  createOrder("ORD-1050", "CUS-050", "2026-06-09", "placed", [["MED-SYR-007", 30], ["MED-SUTURE-010", 5]])
];
