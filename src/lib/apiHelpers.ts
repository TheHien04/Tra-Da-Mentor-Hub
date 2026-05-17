import type { AxiosResponse } from 'axios';

/** Backend may return a raw array or `{ data: T[] }` */
export function unwrapList<T>(response: AxiosResponse<unknown>): T[] {
  const payload = response.data;
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

export function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ERR_NETWORK') {
    return 'Không kết nối được máy chủ. Hãy chạy npm run dev:all trong terminal.';
  }
  if (err && typeof err === 'object' && 'message' in err && typeof (err as Error).message === 'string') {
    return (err as Error).message;
  }
  return 'Failed to fetch data';
}
