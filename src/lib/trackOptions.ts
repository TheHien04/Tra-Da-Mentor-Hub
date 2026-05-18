import { TRACK_IDS, type TrackId } from './trackTheme';

type TFn = (key: string) => string;

export function getTrackOptions(t: TFn, includeAll = false) {
  const options = TRACK_IDS.map((id) => ({
    value: id,
    label: t(`form.tracks.${id}` as 'form.tracks.tech'),
  }));
  if (includeAll) {
    return [{ value: '', label: t('common.all') }, ...options];
  }
  return options;
}

export function trackOptionLabel(t: TFn, track?: string) {
  const id = TRACK_IDS.includes(track as TrackId) ? (track as TrackId) : 'tech';
  return t(`form.tracks.${id}` as 'form.tracks.tech');
}
