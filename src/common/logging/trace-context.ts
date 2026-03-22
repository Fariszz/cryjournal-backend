import { AsyncLocalStorage } from 'async_hooks';

interface TraceContext {
  traceId: string;
}

export const traceStorage = new AsyncLocalStorage<TraceContext>();

export function getTraceId(): string | undefined {
  return traceStorage.getStore()?.traceId;
}
