import { useState, useCallback } from 'react';
import { mockDataManager, Availability } from '@/lib/mockData';

export const useCalendar = (bandId?: string) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>(() => 
    mockDataManager.getAvailability()
  );

  const toggleAvailability = useCallback((date: Date, bandId: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const existing = availabilities.find(a => a.bandId === bandId && a.date === dateStr);
    
    const newAvailability: Availability = {
      id: existing?.id || `${bandId}-${dateStr}`,
      bandId,
      date: dateStr,
      available: !existing?.available
    };

    mockDataManager.saveAvailability(newAvailability);
    setAvailabilities(mockDataManager.getAvailability());
  }, [availabilities]);

  const isAvailable = useCallback((date: Date, bandId: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const availability = availabilities.find(a => a.bandId === bandId && a.date === dateStr);
    return availability?.available || false;
  }, [availabilities]);

  const getAvailableDates = useCallback((bandId: string) => {
    return availabilities
      .filter(a => a.bandId === bandId && a.available)
      .map(a => new Date(a.date));
  }, [availabilities]);

  return {
    selectedDate,
    setSelectedDate,
    toggleAvailability,
    isAvailable,
    getAvailableDates
  };
};