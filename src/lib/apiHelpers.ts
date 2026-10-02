import type { AxiosResponse } from 'axios';
import i18n from '../i18n/config';

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
    return i18n.t('errors.NETWORK');
  }
  const data = (err as { response?: { data?: { code?: string; message?: string } } })?.response?.data;
  if (data?.code && i18n.exists(`errors.${data.code}`)) {
    return i18n.t(`errors.${data.code}`);
  }
  if (data?.message) return data.message;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as Error).message === 'string') {
    return (err as Error).message;
  }
  return i18n.t('errors.GENERIC');
}
