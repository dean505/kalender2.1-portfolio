import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { fetchWithAuth } from "../utils/api";
import { buildAvailableSlots, getWeekDates } from "../utils/appointmentSlots";

export function useBookingSchedule({
  selectedDate,
  selectedCategory,
  busyTimes,
  workdayPath,
  openingHoursPath,
}) {
  const [openInfo, setOpenInfo] = useState(null);
  const [slots, setSlots] = useState([]);
  const [disabledDays, setDisabledDays] = useState(new Set());

  const refreshDisabledForWeek = useCallback(async (anchorDate) => {
    if (!anchorDate) return;

    const weekDates = getWeekDates(anchorDate);
    const results = await Promise.all(
      weekDates.map((date) =>
        fetchWithAuth(workdayPath(date)).catch(() => null)
      )
    );

    const disabled = new Set();
    results.forEach((workday, index) => {
      if (workday?.istGesperrt === true) disabled.add(weekDates[index]);
    });

    setDisabledDays(disabled);
  }, [workdayPath]);

  useEffect(() => {
    let ignore = false;

    async function loadSlots() {
      if (!selectedDate || !selectedCategory) {
        setOpenInfo(null);
        setSlots([]);
        return;
      }

      const workday = await fetchWithAuth(workdayPath(selectedDate)).catch(() => null);
      if (ignore) return;

      if (workday?.istGesperrt) {
        setOpenInfo({ gesperrt: true });
        setSlots([]);
        return;
      }

      const openingHours = await fetchWithAuth(openingHoursPath(selectedDate)).catch(() => null);
      if (ignore) return;

      const start = openingHours?.startUhrzeit;
      const end = openingHours?.endUhrzeit;
      setOpenInfo({ start, end, gesperrt: false });

      if (!start || !end) {
        setSlots([]);
        return;
      }

      setSlots(buildAvailableSlots({
        date: selectedDate,
        openTime: start,
        closeTime: end,
        durationMinutes: selectedCategory.durationMinutes ?? 40,
        busyTimes,
      }));
    }

    loadSlots();
    return () => {
      ignore = true;
    };
  }, [busyTimes, openingHoursPath, selectedCategory, selectedDate, workdayPath]);

  useEffect(() => {
    refreshDisabledForWeek(selectedDate || moment().format("YYYY-MM-DD"));
  }, [refreshDisabledForWeek, selectedDate]);

  return {
    disabledDays,
    openInfo,
    refreshDisabledForWeek,
    slots,
  };
}
