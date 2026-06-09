import { appendFileSync } from "node:fs";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import type { Principal } from "./auth.js";

export type AuditDecision = "allowed" | "denied" | "error";

export type AuditEvent = {
  action: string;
  target: string;
  decision: AuditDecision;
  principal?: Principal | null;
  sessionId?: string;
  durationMs?: number;
  resultCount?: number;
  error?: string;
};

export function auditAccess(event: AuditEvent) {
  const record = {
    timestamp: new Date().toISOString(),
    action: event.action,
    target: event.target,
    decision: event.decision,
    principalId: event.principal?.id ?? null,
    roles: event.principal?.roles ?? [],
    sessionId: event.sessionId ?? null,
    durationMs: event.durationMs ?? null,
    resultCount: event.resultCount ?? null,
    error: event.error ?? null
  };
  const line = JSON.stringify(record);

  console.error(line);

  const auditPath = process.env.TS_MCP_AUDIT_LOG_PATH;

  if (auditPath) {
    mkdirSync(dirname(auditPath), { recursive: true });
    appendFileSync(auditPath, `${line}\n`, "utf8");
  }
}