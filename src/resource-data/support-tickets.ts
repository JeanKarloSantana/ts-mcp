export type SupportTicketStatus = "open" | "pending_customer" | "resolved" | "closed";

export type SupportTicket = {
  ticketId: string;
  orderId: string;
  customerId: string;
  createdAt: string;
  status: SupportTicketStatus;
  priority: "low" | "medium" | "high";
  topic: string;
  summary: string;
};

export const supportTickets: SupportTicket[] = [
  {
    ticketId: "TCK-9001",
    orderId: "ORD-1003",
    customerId: "CUS-003",
    createdAt: "2025-11-13",
    status: "resolved",
    priority: "medium",
    topic: "Cancellation confirmation",
    summary: "Customer requested confirmation that the cancelled nebulizer and oximeter order would not ship."
  },
  {
    ticketId: "TCK-9002",
    orderId: "ORD-1007",
    customerId: "CUS-007",
    createdAt: "2025-12-07",
    status: "resolved",
    priority: "low",
    topic: "Refund timing",
    summary: "Customer asked when the refund for the cancelled suture kit order would post."
  },
  {
    ticketId: "TCK-9003",
    orderId: "ORD-1013",
    customerId: "CUS-013",
    createdAt: "2026-01-15",
    status: "closed",
    priority: "medium",
    topic: "Inventory substitution",
    summary: "Customer cancelled after asking whether blood pressure monitors could be substituted with a different cuff size."
  },
  {
    ticketId: "TCK-9004",
    orderId: "ORD-1018",
    customerId: "CUS-018",
    createdAt: "2026-02-17",
    status: "resolved",
    priority: "high",
    topic: "Billing reversal",
    summary: "Customer needed help confirming the billing reversal for the cancelled stethoscope and monitor order."
  },
  {
    ticketId: "TCK-9005",
    orderId: "ORD-1022",
    customerId: "CUS-022",
    createdAt: "2026-03-11",
    status: "resolved",
    priority: "medium",
    topic: "Cancellation reason",
    summary: "Customer cancelled the nebulizer order because the delivery window was too late."
  },
  {
    ticketId: "TCK-9006",
    orderId: "ORD-1027",
    customerId: "CUS-027",
    createdAt: "2026-04-08",
    status: "closed",
    priority: "low",
    topic: "Duplicate order",
    summary: "Customer reported the cancelled stethoscope and suture kit order was a duplicate purchase."
  },
  {
    ticketId: "TCK-9007",
    orderId: "ORD-1031",
    customerId: "CUS-031",
    createdAt: "2026-04-27",
    status: "open",
    priority: "medium",
    topic: "Delivery ETA",
    summary: "Customer requested tracking details while the blood pressure monitor order is on the way."
  },
  {
    ticketId: "TCK-9008",
    orderId: "ORD-1035",
    customerId: "CUS-035",
    createdAt: "2026-05-10",
    status: "pending_customer",
    priority: "low",
    topic: "Shipping address check",
    summary: "Customer asked to verify the clinic shipping address while the stethoscope and otoscope order is on the way."
  },
  {
    ticketId: "TCK-9009",
    orderId: "ORD-1037",
    customerId: "CUS-037",
    createdAt: "2026-05-16",
    status: "open",
    priority: "medium",
    topic: "Order processing update",
    summary: "Customer asked when the newly placed syringe and scalpel order will leave the warehouse."
  },
  {
    ticketId: "TCK-9010",
    orderId: "ORD-1039",
    customerId: "CUS-039",
    createdAt: "2026-05-22",
    status: "open",
    priority: "high",
    topic: "Sterility documentation",
    summary: "Customer requested sterility certificates while the surgical supply order is on the way."
  },
  {
    ticketId: "TCK-9011",
    orderId: "ORD-1040",
    customerId: "CUS-040",
    createdAt: "2026-05-25",
    status: "resolved",
    priority: "medium",
    topic: "Cancelled order refund",
    summary: "Customer asked for refund status after cancelling the nebulizer and monitor order."
  },
  {
    ticketId: "TCK-9012",
    orderId: "ORD-1042",
    customerId: "CUS-042",
    createdAt: "2026-05-30",
    status: "open",
    priority: "low",
    topic: "Purchase order copy",
    summary: "Customer requested a purchase order copy for the placed otoscope and stethoscope order."
  },
  {
    ticketId: "TCK-9013",
    orderId: "ORD-1045",
    customerId: "CUS-045",
    createdAt: "2026-06-03",
    status: "resolved",
    priority: "medium",
    topic: "Cancellation after backorder",
    summary: "Customer cancelled after learning part of the scalpel and syringe order was backordered."
  },
  {
    ticketId: "TCK-9014",
    orderId: "ORD-1047",
    customerId: "CUS-047",
    createdAt: "2026-06-05",
    status: "open",
    priority: "medium",
    topic: "Package tracking",
    summary: "Customer requested tracking information for the blood pressure monitor and thermometer package on its way."
  },
  {
    ticketId: "TCK-9015",
    orderId: "ORD-1049",
    customerId: "CUS-049",
    createdAt: "2026-06-08",
    status: "open",
    priority: "low",
    topic: "Delivery instructions",
    summary: "Customer asked to add front-desk delivery instructions while the order is on its way."
  },
  {
    ticketId: "TCK-9016",
    orderId: "ORD-1050",
    customerId: "CUS-050",
    createdAt: "2026-06-09",
    status: "open",
    priority: "medium",
    topic: "Tax exemption document",
    summary: "Customer submitted tax exemption paperwork for the newly placed clinical supply order."
  }
];
