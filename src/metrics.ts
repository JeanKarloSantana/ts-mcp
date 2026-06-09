type MetricRecord = {
  count: number;
  errors: number;
  totalDurationMs: number;
  lastAccessAt?: string;
};

const startedAt = new Date();
const metrics = new Map<string, MetricRecord>();

export function recordMetric(target: string, durationMs: number, isError = false) {
  const current = metrics.get(target) ?? {
    count: 0,
    errors: 0,
    totalDurationMs: 0
  };

  current.count += 1;
  current.errors += isError ? 1 : 0;
  current.totalDurationMs += durationMs;
  current.lastAccessAt = new Date().toISOString();
  metrics.set(target, current);
}

export function getMetricsSnapshot() {
  const memory = process.memoryUsage();

  return {
    status: "ok",
    startedAt: startedAt.toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external
    },
    access: [...metrics.entries()].map(([target, metric]) => ({
      target,
      count: metric.count,
      errors: metric.errors,
      averageDurationMs: metric.count === 0 ? 0 : Number((metric.totalDurationMs / metric.count).toFixed(2)),
      lastAccessAt: metric.lastAccessAt ?? null
    }))
  };
}