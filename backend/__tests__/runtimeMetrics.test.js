import { EventEmitter } from 'node:events';
import { jest } from '@jest/globals';
import { getRuntimeMetrics, resetRuntimeMetrics, runtimeMetrics } from '../lib/runtimeMetrics.js';

describe('runtime metrics', () => {
  beforeEach(() => resetRuntimeMetrics());

  it('tracks in-flight requests, status families and latency', () => {
    const response = new EventEmitter();
    response.statusCode = 200;
    const next = jest.fn();

    runtimeMetrics({}, response, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(getRuntimeMetrics()).toEqual(expect.objectContaining({ requests: 1, inFlight: 1 }));

    response.emit('finish');
    const snapshot = getRuntimeMetrics();
    expect(snapshot.inFlight).toBe(0);
    expect(snapshot.statuses['2xx']).toBe(1);
    expect(snapshot.averageDurationMs).toBeGreaterThanOrEqual(0);
    expect(snapshot.memory.rssBytes).toBeGreaterThan(0);
  });

  it('tracks server failures without allowing a negative in-flight count', () => {
    const response = new EventEmitter();
    response.statusCode = 503;
    runtimeMetrics({}, response, () => {});
    response.emit('finish');
    response.emit('finish');
    expect(getRuntimeMetrics()).toEqual(
      expect.objectContaining({ inFlight: 0, statuses: expect.objectContaining({ '5xx': 1 }) })
    );
  });
});
