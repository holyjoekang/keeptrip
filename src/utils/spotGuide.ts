import guides from '../data/spotGuides.json';
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

const G = guides as Record<string, SpotGuide>;
export const getSpotGuide = (stop: ItineraryStop | null): SpotGuide | null =>
  (stop?.guideId && G[stop.guideId]) || null;

/** 택시용 현지 이름 · 주소: 일정 데이터 → 장소 가이드 순 */
export const getTaxiAddress = (stop: ItineraryStop | null) => {
  const g = getSpotGuide(stop);
  return { localName: stop?.localName ?? g?.localName, address: stop?.address ?? g?.address };
};

export const photoUrl = (src: string) => `${import.meta.env.BASE_URL}${src}`;
