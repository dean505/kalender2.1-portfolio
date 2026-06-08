import moment from "moment";

export const DEFAULT_CATEGORY_DURATION = 40;
export const SLOT_STEP_MINUTES = 15;

export function getWeekDates(anchorDate) {
  const monday = moment(anchorDate, "YYYY-MM-DD").startOf("isoWeek");
  return Array.from({ length: 7 }, (_, index) =>
    monday.clone().add(index, "day").format("YYYY-MM-DD")
  );
}

export function buildAvailableSlots({
  date,
  openTime,
  closeTime,
  durationMinutes = DEFAULT_CATEGORY_DURATION,
  busyTimes = [],
  busyDurationMinutes = durationMinutes,
}) {
  if (!date || !openTime || !closeTime) return [];

  const day = moment(date, "YYYY-MM-DD");
  const dayStart = withTime(day, openTime);
  const dayEnd = withTime(day, closeTime);

  const possible = [];
  for (let time = dayStart.clone(); ; time.add(SLOT_STEP_MINUTES, "minute")) {
    const end = time.clone().add(durationMinutes, "minute");
    if (end.isAfter(dayEnd) || time.isSameOrAfter(dayEnd)) break;
    possible.push(time.format("HH:mm"));
  }

  const busyThisDay = (busyTimes || [])
    .filter((iso) => String(iso).startsWith(date))
    .map((iso) => moment(iso));

  return possible.filter((hhmm) => {
    const start = moment(`${date}T${hhmm}`, "YYYY-MM-DDTHH:mm");
    const end = start.clone().add(durationMinutes, "minute");

    return !busyThisDay.some((busyStart) => {
      const busyEnd = busyStart.clone().add(busyDurationMinutes, "minute");
      return start.isBefore(busyEnd) && end.isAfter(busyStart);
    });
  });
}

function withTime(day, hhmm) {
  const [hour, minute] = String(hhmm).split(":").map(Number);
  return day.clone().set({ hour, minute, second: 0, millisecond: 0 });
}
