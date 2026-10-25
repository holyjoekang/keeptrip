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

export default function App() {
  const [trips, setTrips] = useState<TripData[]>(() => {
    const saved = localStorage.getItem('my_travel_trips');
    if (saved) {
      try {
        const parsed: TripData[] = JSON.parse(saved);
        return PRESET_TRIPS.map((preset) => {
          const found = parsed.find((p) => p.id === preset.id);
          return found
            ? {
                ...preset,
                ...found,
                bestMoments: preset.bestMoments || found.bestMoments,
                days: preset.days,
                keyRules: preset.keyRules
              }
            : preset;
        }).concat(parsed.filter((p) => !PRESET_TRIPS.some((pr) => pr.id === p.id)));
      } catch (e) {
        console.error(e);
      }
    }
    return PRESET_TRIPS;
  });

  const [selectedTripId, setSelectedTripId] = useState<string>('trip-china-2026');
  const [activeTab, setActiveTab] = useState<KeepTripTab>('today');

  // Modals state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [activeDocentSpot, setActiveDocentSpot] = useState<ItineraryStop | null>(null);
  const [activeTaxiSpot, setActiveTaxiSpot] = useState<ItineraryStop | null>(null);
  const [currentRecordingSpotTitle, setCurrentRecordingSpotTitle] = useState<string>('수정방 박물관');

  // Active Trip
  const activeTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  // Checklist state
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>(() => {
    const saved = localStorage.getItem('my_travel_checklists');
    if (saved) {
      try {
        return JSON.parse(saved);
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
    setChecklists((prev) => ({
      ...prev,
      [newTrip.id]: newTrip.checklist
    }));
    setVoiceNotesMap((prev) => ({
      ...prev,
      [newTrip.id]: newTrip.initialVoiceNotes || []
    }));
    setSelectedTripId(newTrip.id);
    setActiveTab('today');
  };

  const handleQuickRecord = () => {
    setCurrentRecordingSpotTitle(activeTrip.destinationType === 'CN' ? '수정방 박물관' : 'Durich 두리안 빙수');
    setActiveTab('record');
  };

  const handleGoToVoiceRecordFromDocent = (spotTitle: string) => {
    setCurrentRecordingSpotTitle(spotTitle);
    setActiveTab('record');
  };

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
        currentTrip={activeTrip}
      />

      {/* Main Responsive App Content Area */}
      <div className="keeptrip-container flex-1 w-full relative flex flex-col">
        {/* Screen 1: 오늘 (Today) */}
        {activeTab === 'today' && (
          <TodayScreen
            trip={activeTrip}
            onOpenDocent={(stop) => setActiveDocentSpot(stop)}
            onOpenTaxiAddress={(stop) => setActiveTaxiSpot(stop)}
            onOpenMenu={() => setIsMenuOpen(true)}
            onOpenAdvisor={() => setIsAdvisorOpen(true)}
            onGoToVoiceRecord={handleGoToVoiceRecordFromDocent}
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
          onSelectTrip={(id) => setSelectedTripId(id)}
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
