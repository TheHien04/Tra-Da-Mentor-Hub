/** Progress bands sent to the directory API. All three selected means no filter. */
export function progressQuery(filters: Record<string, boolean | string | undefined>): string | undefined {
  const bands = ['just-started', 'in-progress', 'completed'].filter((key) => Boolean(filters[key]));
  if (bands.length === 0 || bands.length === 3) return undefined;
  return bands.join(',');
}
