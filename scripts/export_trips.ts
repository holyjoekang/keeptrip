// 번들 일정 데이터(presetTrips.ts)를 JSON으로 내보내기 → scripts/data/trips_export.json
import { writeFileSync } from 'fs';
import { PRESET_TRIPS } from '../src/data/presetTrips';
writeFileSync(new URL('./data/trips_export.json', import.meta.url), JSON.stringify(PRESET_TRIPS, null, 1));
console.log(PRESET_TRIPS.length, 'trips');
