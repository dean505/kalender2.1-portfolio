import React from "react";
import moment from "moment";
import WeekPicker from "./WeekPicker";

export default function SchedulePicker({
  disabledDays,
  isSlotDisabled,
  label = "Wählen Sie einen Tag und eine Uhrzeit",
  onDateChange,
  onTimeChange,
  onWeekVisible,
  openInfo,
  prompt = "Welche Zeit passt am besten?",
  selectedDate,
  selectedTime,
  slots,
}) {
  const dateValue = selectedDate || moment().format("YYYY-MM-DD");

  return (
    <div>
      <label className="label">{label}</label>
      <WeekPicker
        value={dateValue}
        onChange={(date) => {
          onDateChange(date);
          onTimeChange("");
        }}
        minDate={moment().format("YYYY-MM-DD")}
        disabledDates={disabledDays}
        onWeekVisible={onWeekVisible}
      />

      {selectedDate && <OpeningHoursStatus openInfo={openInfo} />}

      {selectedDate && !openInfo?.gesperrt && openInfo?.start && openInfo?.end && (
        <>
          <div style={{ margin: "8px 0" }}>{prompt}</div>
          <div className="slot-grid">
            {slots.map((time) => {
              const disabled = isSlotDisabled?.(time) ?? false;
              return (
                <button
                  key={time}
                  className={`slot ${selectedTime === time ? "slot--active" : ""}`}
                  disabled={disabled}
                  onClick={() => !disabled && onTimeChange(time)}
                  title={disabled ? "Zeitpunkt ist bereits vorbei" : ""}
                >
                  {time}
                </button>
              );
            })}
            {slots.length === 0 && <div className="muted">Keine freien Zeiten.</div>}
          </div>
        </>
      )}
    </div>
  );
}

function OpeningHoursStatus({ openInfo }) {
  return (
    <div style={{ marginTop: 8, color: openInfo?.gesperrt ? "#b91c1c" : "#6b7280" }}>
      {!openInfo
        ? "Lade Öffnungszeiten..."
        : openInfo.gesperrt
          ? "An diesem Tag sind keine Buchungen möglich (gesperrt)."
          : openInfo.start && openInfo.end
            ? `Geöffnet: ${openInfo.start} - ${openInfo.end}`
            : "Für diesen Tag sind keine Öffnungszeiten hinterlegt."}
    </div>
  );
}
