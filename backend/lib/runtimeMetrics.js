const startedAt = Date.now();
const state = {
  requests: 0,
  inFlight: 0,
  durationMs: 0,
  maxDurationMs: 0,
  statuses: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
};

function statusFamily(statusCode) {
  const family = `${Math.floor(Number(statusCode) / 100)}xx`;
  return Object.hasOwn(state.statuses, family) ? family : null;
}

export function runtimeMetrics(req, res, next) {
  const started = performance.now();
  state.requests += 1;
  state.inFlight += 1;

  res.once('finish', () => {
    const duration = performance.now() - started;
    state.inFlight = Math.max(0, state.inFlight - 1);
    state.durationMs += duration;
    state.maxDurationMs = Math.max(state.maxDurationMs, duration);
    const family = statusFamily(res.statusCode);
    if (family) state.statuses[family] += 1;
  });
  next();
}

export function getRuntimeMetrics() {
  return {
    startedAt: new Date(startedAt).toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    requests: state.requests,
    inFlight: state.inFlight,
    averageDurationMs:
      state.requests > state.inFlight
        ? Number((state.durationMs / (state.requests - state.inFlight)).toFixed(2))
        : 0,
    maxDurationMs: Number(state.maxDurationMs.toFixed(2)),
    statuses: { ...state.statuses },
    memory: {
      rssBytes: process.memoryUsage().rss,
      heapUsedBytes: process.memoryUsage().heapUsed,
    },
  };
}

export function resetRuntimeMetrics() {
  state.requests = 0;
  state.inFlight = 0;
  state.durationMs = 0;
  state.maxDurationMs = 0;
  Object.keys(state.statuses).forEach((key) => {
    state.statuses[key] = 0;
  });
}
