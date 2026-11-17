import { TripData } from '../types/travel';
import snapshot from './dbSnapshot.json';
import { DbSnapshot, toTrips } from '../lib/db';

// 일정 원본은 Supabase(keepTrip) DB. 이 번들은 DB 스냅샷(오프라인 · 첫 화면용)
// 갱신: python3 scripts/supabase_sync.py pull
export const PRESET_TRIPS: TripData[] = toTrips(snapshot as unknown as DbSnapshot);
