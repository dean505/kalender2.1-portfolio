// src/components/WeekPicker.jsx
import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import "moment/locale/de";

moment.locale("de");

export default function WeekPicker({
  value,
  onChange,
  minDate,
  disabledDates,
  disabledDays,
  onWeekVisible,
}) {
  const initial = value && moment(value, "YYYY-MM-DD", true).isValid()
    ? value
    : moment().format("YYYY-MM-DD");

  const [cursor, setCursor] = useState(moment(initial, "YYYY-MM-DD"));

  useEffect(() => {
    if (value && moment(value, "YYYY-MM-DD", true).isValid()) {
      setCursor(moment(value, "YYYY-MM-DD"));
    }
  }, [value]);

  const externalDisabled = disabledDates ?? disabledDays ?? null;
  const weekStartIso = useMemo(
    () => cursor.clone().startOf("isoWeek").format("YYYY-MM-DD"),
    [cursor]
  );

  const week = useMemo(() => {
    const start = moment(weekStartIso, "YYYY-MM-DD");
    return Array.from({ length: 7 }, (_, index) => start.clone().add(index, "day"));
  }, [weekStartIso]);

  useEffect(() => {
    onWeekVisible?.(weekStartIso);
  }, [onWeekVisible, weekStartIso]);

  const min = minDate ? moment(minDate, "YYYY-MM-DD").startOf("day") : null;
  const selected = value ? moment(value, "YYYY-MM-DD").format("YYYY-MM-DD") : "";

  function isDisabled(day) {
    if (min && day.isBefore(min)) return true;
    if (!externalDisabled) return false;
    if (typeof externalDisabled === "function") return !!externalDisabled(day.toDate());
    if (externalDisabled instanceof Set) return externalDisabled.has(day.format("YYYY-MM-DD"));
    return false;
  }

  return (
    <div className="week-picker">
      <div className="wp-header">
        <button
          type="button"
          className="wp-nav"
          onClick={() => setCursor((current) => current.clone().subtract(1, "week"))}
          aria-label="Vorherige Woche"
        >
          &lsaquo;
        </button>
        <div className="wp-month">{cursor.clone().startOf("isoWeek").format("MMMM YYYY")}</div>
        <button
          type="button"
          className="wp-nav"
          onClick={() => setCursor((current) => current.clone().add(1, "week"))}
          aria-label="Naechste Woche"
        >
          &rsaquo;
        </button>
      </div>

      <div className="wp-row wp-weekdays">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((dayLabel) => (
          <div key={dayLabel} className="wp-col">{dayLabel}</div>
        ))}
      </div>

      <div className="wp-row">
        {week.map((day) => {
          const iso = day.format("YYYY-MM-DD");
          const disabled = isDisabled(day);
          const isSelected = selected === iso;

          return (
            <button
              key={iso}
              type="button"
              className={`wp-day ${isSelected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
              onClick={() => !disabled && onChange(iso)}
              disabled={disabled}
              title={disabled ? "Nicht buchbar" : ""}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
