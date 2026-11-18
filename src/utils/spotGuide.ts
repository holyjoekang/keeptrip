import snapshot from '../data/dbSnapshot.json';
import { DbSnapshot, toGuides } from '../lib/db';
import { ItineraryStop } from '../types/travel';

export interface SpotGuide {
  name: string;
  localName: string;
  address: string;
  summary: string;
  info: { label: string; value: string }[];
  good: string[];
  caution: string[];
  sources: { label: string; url: string }[];
  photos: { src: string; credit: string; page: string }[];
  photoNote?: string;
}

let G: Record<string, SpotGuide> = toGuides(snapshot as unknown as DbSnapshot);
export const setSpotGuides = (g: Record<string, SpotGuide>) => { G = g; };
export const getSpotGuide = (stop: ItineraryStop | null): SpotGuide | null =>
  (stop?.guideId && G[stop.guideId]) || null;

/** 택시용 현지 이름 · 주소: 일정 데이터 → 장소 가이드 순 */
export const getTaxiAddress = (stop: ItineraryStop | null) => {
  const g = getSpotGuide(stop);
  return { localName: stop?.localName ?? g?.localName, address: stop?.address ?? g?.address };
};

export const photoUrl = (src: string) =>
  ((window as unknown as { __KT_IMG__?: Record<string, string> }).__KT_IMG__?.[src]) || `${import.meta.env.BASE_URL}${src}`;
