import React, { useState, useEffect } from 'react';
import { TripData, ChecklistItem, VoiceJournalEntry, ItineraryStop } from './types/travel';
import { PRESET_TRIPS } from './data/presetTrips';
import { BottomNav, KeepTripTab } from './components/BottomNav';
import { DesktopNav } from './components/DesktopNav';
import { TodayScreen } from './components/TodayScreen';
import { PrepScreen } from './components/PrepScreen';
import { VoiceRecordScreen } from './components/VoiceRecordScreen';
import { StoryScreen } from './components/StoryScreen';
import { SpotDocentModal } from './components/SpotDocentModal';
import { TaxiAddressModal } from './components/TaxiAddressModal';
import { MenuDrawer } from './components/MenuDrawer';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { CustomTripModal } from './components/CustomTripModal';
import { TripHome } from './components/TripHome';
import { TripOverview } from './components/TripOverview';
import { getTripClock } from './utils/tripClock';
import { fetchSnapshot, toTrips, toGuides, saveNewTrip } from './lib/db';
import { setSpotGuides } from './utils/spotGuide';

export default function App() {
  const [trips, setTrips] = useState<TripData[]>(() => {
    const saved = localStorage.getItem('my_travel_trips');
    if (saved) {
      try {
        const parsed: TripData[] = JSON.parse(saved);
        return PRESET_TRIPS.map((preset) => {
          const found = parsed.find((p) => p.id === preset.id);
          // 미리 등록된 일정은 항상 최신 데이터 사용 (예전 저장본이 내용을 덮지 않도록)
          return found ? { ...found, ...preset } : preset;
        }).concat(parsed.filter((p) => !PRESET_TRIPS.some((pr) => pr.id === p.id)));
      } catch (e) {
        console.error(e);
      }
    }
    return PRESET_TRIPS;
  });

  // 해시 라우팅: #trip=<id> 이면 일정 화면, 없으면 첫 화면(일정 선택)
  const readHashTrip = () => {
    const m = window.location.hash.match(/trip=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  };
  const [selectedTripId, setSelectedTripId] = useState<string>(
    () => readHashTrip() || localStorage.getItem('my_travel_last_trip') || 'trip-china-2026'
  );
  const [view, setView] = useState<'home' | 'trip'>(() => (readHashTrip() ? 'trip' : 'home'));
  // 접속 시각 기준 첫 화면: 출발 전 → 준비, 여행 중 → 오늘(현재 DAY), 다녀온 뒤 → 스토리
  const startViewFor = (id: string): { tab: KeepTripTab; day: number } => {
    const t = trips.find((x) => x.id === id);
    const c = t ? getTripClock(t) : null;
    if (!c || c.phase === 'unknown') return { tab: 'overview', day: 0 };
    if (c.phase === 'before') return { tab: 'prep', day: 0 };
    if (c.phase === 'after') return { tab: 'story', day: 0 };
    return { tab: 'today', day: c.dayIndex };
  };
  const [activeTab, setActiveTab] = useState<KeepTripTab>(() => startViewFor(selectedTripId).tab);
  const [dayIndex, setDayIndex] = useState<number>(() => startViewFor(selectedTripId).day);

  useEffect(() => {
    const onHash = () => {
      const id = readHashTrip();
      if (id) {
        const sv = startViewFor(id);
        setSelectedTripId(id);
        setActiveTab(sv.tab);
        setDayIndex(sv.day);
        setView('trip');
      } else {
        setView('home');
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const enterTrip = (id: string) => {
    const sv = startViewFor(id);
    setDayIndex(sv.day);
    setSelectedTripId(id);
    setActiveTab(sv.tab);
    setView('trip');
    localStorage.setItem('my_travel_last_trip', id);
    if (readHashTrip() !== id) window.location.hash = `trip=${encodeURIComponent(id)}`;
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setView('home');
    if (window.location.hash) history.pushState(null, '', window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
  };

  // Modals state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [activeDocentSpot, setActiveDocentSpot] = useState<ItineraryStop | null>(null);
  const [activeTaxiSpot, setActiveTaxiSpot] = useState<ItineraryStop | null>(null);
  const [currentRecordingSpotTitle, setCurrentRecordingSpotTitle] = useState<string>('');

  // Active Trip
  const activeTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  // Checklist state
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>(() => {
    const saved = localStorage.getItem('my_travel_checklists');
    if (saved) {
      try {
        const parsed: Record<string, ChecklistItem[]> = JSON.parse(saved);
        // 최신 체크리스트에 완료 여부만 이어 붙임
        PRESET_TRIPS.forEach((t) => {
          const done = new Set((parsed[t.id] || []).filter((i) => i.completed).map((i) => i.id));
          parsed[t.id] = t.checklist.map((i) => ({ ...i, completed: done.has(i.id) }));
        });
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    const initialMap: Record<string, ChecklistItem[]> = {};
    PRESET_TRIPS.forEach((t) => {
      initialMap[t.id] = t.checklist;
    });
    return initialMap;
  });

  // Voice notes state
  const [voiceNotesMap, setVoiceNotesMap] = useState<Record<string, VoiceJournalEntry[]>>(() => {
    const saved = localStorage.getItem('my_travel_voice_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const initialNotes: Record<string, VoiceJournalEntry[]> = {};
    PRESET_TRIPS.forEach((t) => {
      initialNotes[t.id] = t.initialVoiceNotes || [];
    });
    return initialNotes;
  });

  useEffect(() => {
    localStorage.setItem('my_travel_trips', JSON.stringify(trips));
  }, [trips]);

  // DB(keepTrip)에서 최신 일정 · 장소 안내 불러오기 (실패하면 번들 스냅샷 유지)
  useEffect(() => {
    let alive = true;
    fetchSnapshot()
      .then((snap) => {
        if (!alive) return;
        setSpotGuides(toGuides(snap));
        const fresh = toTrips(snap);
        setTrips((prev) => [...fresh, ...prev.filter((p) => !fresh.some((f) => f.id === p.id) && !PRESET_TRIPS.some((pr) => pr.id === p.id))]);
        setChecklists((prev) => {
          const next = { ...prev };
          fresh.forEach((t) => {
            const done = new Set((prev[t.id] || []).filter((i) => i.completed).map((i) => i.id));
            next[t.id] = t.checklist.map((i) => ({ ...i, completed: done.has(i.id) }));
          });
          return next;
        });
      })
      .catch((e) => console.warn('DB 불러오기 실패, 저장된 데이터 사용', e));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem('my_travel_checklists', JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem('my_travel_voice_notes', JSON.stringify(voiceNotesMap));
  }, [voiceNotesMap]);

  const currentChecklist = checklists[activeTrip.id] || activeTrip.checklist;
  const currentVoiceNotes = voiceNotesMap[activeTrip.id] || activeTrip.initialVoiceNotes || [];

  const handleToggleChecklistItem = (itemId: string) => {
    setChecklists((prev) => {
      const list = prev[activeTrip.id] || activeTrip.checklist;
      const updated = list.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return {
        ...prev,
        [activeTrip.id]: updated
      };
    });
  };

  const handleSaveVoiceNote = (newNote: VoiceJournalEntry) => {
    setVoiceNotesMap((prev) => ({
      ...prev,
      [activeTrip.id]: [newNote, ...(prev[activeTrip.id] || [])]
    }));
    setActiveTab('today');
  };

  const handleAddTrip = (newTrip: TripData) => {
    setTrips((prev) => [newTrip, ...prev]);
    saveNewTrip(newTrip).catch((e) => console.warn('새 일정 DB 저장 실패 (이 기기에는 저장됨)', e));
    setChecklists((prev) => ({
      ...prev,
      [newTrip.id]: newTrip.checklist
    }));
    setVoiceNotesMap((prev) => ({
      ...prev,
      [newTrip.id]: newTrip.initialVoiceNotes || []
    }));
    enterTrip(newTrip.id);
  };

  const handleQuickRecord = () => {
    const day = activeTrip.days[dayIndex] || activeTrip.days[0];
    const stop = day?.stops.find((s) => s.docent) || day?.stops[0];
    setCurrentRecordingSpotTitle(stop ? stop.title.replace(/\(.*\)/, '').trim() : activeTrip.title);
    setActiveTab('record');
  };

  const handleGoToVoiceRecordFromDocent = (spotTitle: string) => {
    setCurrentRecordingSpotTitle(spotTitle);
    setActiveTab('record');
  };

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#F4F6F8]">
        <TripHome
          trips={trips}
          lastTripId={localStorage.getItem('my_travel_last_trip') || undefined}
          onEnterTrip={enterTrip}
          onOpenCustomModal={() => setIsCustomModalOpen(true)}
        />
        <CustomTripModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onAddTrip={handleAddTrip}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col selection:bg-[#EFA03D]/20 selection:text-[#1E2856]">
      {/* Desktop & Tablet Top Navigation */}
      <DesktopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickRecord={handleQuickRecord}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onGoHome={goHome}
        currentTrip={activeTrip}
      />

      {/* Main Responsive App Content Area */}
      <div className="keeptrip-container flex-1 w-full relative flex flex-col">
        {/* Screen 0: 첫 안내 · 일정 개요 */}
        {activeTab === 'overview' && (
          <TripOverview
            key={activeTrip.id}
            trip={activeTrip}
            onGoHome={goHome}
            onStartToday={() => setActiveTab('today')}
            onOpenDay={(i) => {
              setDayIndex(i);
              setActiveTab('today');
              window.scrollTo(0, 0);
            }}
            onOpenPrep={() => setActiveTab('prep')}
          />
        )}

        {/* Screen 1: 오늘 (Today) */}
        {activeTab === 'today' && (
          <TodayScreen
            key={activeTrip.id}
            trip={activeTrip}
            onOpenDocent={(stop) => setActiveDocentSpot(stop)}
            onOpenTaxiAddress={(stop) => setActiveTaxiSpot(stop)}
            onOpenMenu={() => setIsMenuOpen(true)}
            onOpenAdvisor={() => setIsAdvisorOpen(true)}
            onGoToVoiceRecord={handleGoToVoiceRecordFromDocent}
            dayIndex={dayIndex}
            onDayChange={setDayIndex}
          />
        )}

        {/* Screen 2: 준비 (Prep & Fee Optimization) */}
        {activeTab === 'prep' && (
          <PrepScreen
            trip={activeTrip}
            checklist={currentChecklist}
            onToggleItem={handleToggleChecklistItem}
            onOpenAdvisor={() => setIsAdvisorOpen(true)}
          />
        )}

        {/* Screen 3: 기록 (Voice Journal) */}
        {activeTab === 'record' && (
          <VoiceRecordScreen
            trip={activeTrip}
            activeSpotTitle={currentRecordingSpotTitle}
            key={`${activeTrip.id}-${currentRecordingSpotTitle}`}
            voiceNotes={currentVoiceNotes}
            onSaveVoiceNote={handleSaveVoiceNote}
            onClose={() => setActiveTab('today')}
          />
        )}

        {/* Screen 4: 스토리 (Story & Album) */}
        {activeTab === 'story' && (
          <StoryScreen
            trip={activeTrip}
            voiceNotes={currentVoiceNotes}
          />
        )}

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onQuickRecord={handleQuickRecord}
        />

        {/* Modals */}
        <SpotDocentModal
          isOpen={!!activeDocentSpot}
          spot={activeDocentSpot}
          onClose={() => setActiveDocentSpot(null)}
          onGoToVoiceRecord={handleGoToVoiceRecordFromDocent}
        />

        <TaxiAddressModal
          isOpen={!!activeTaxiSpot}
          spot={activeTaxiSpot}
          destinationType={activeTrip.destinationType}
          onClose={() => setActiveTaxiSpot(null)}
        />

        <MenuDrawer
          isOpen={isMenuOpen}
          trips={trips}
          selectedTripId={selectedTripId}
          onClose={() => setIsMenuOpen(false)}
          onSelectTrip={enterTrip}
          onGoHome={goHome}
          onOpenCustomModal={() => setIsCustomModalOpen(true)}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
        />

        <AiAdvisorModal
          isOpen={isAdvisorOpen}
          trip={activeTrip}
          onClose={() => setIsAdvisorOpen(false)}
        />

        <CustomTripModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onAddTrip={handleAddTrip}
        />
      </div>
    </div>
  );
}
