import { useState } from 'react';

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availabilities] = useState<{ bandId: string; date: string; available: boolean }[]>([]);

  const isAvailable = (date: Date, _bandId: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return availabilities.some(
      (a) => a.bandId === _bandId && a.date === dateStr && a.available
    );
  };

  return {
    selectedDate,
    setSelectedDate,
    isAvailable,
    availabilities,
  };
}
