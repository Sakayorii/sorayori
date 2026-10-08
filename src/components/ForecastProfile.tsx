import { useId, useState, type PointerEvent } from "react";
import type { HourlyWeather, Settings } from "../types";
import { formatTemperature } from "../format";
import { SegmentedControl } from "./SegmentedControl";
import { TransitionSwap } from "./TransitionSwap";

export function ForecastProfile({ hours, settings, selectedTime, onSelect }: { hours: HourlyWeather[]; settings: Settings; selectedTime?: string; onSelect: (time: string) => void }) {
  const [mode, setMode] = useState<"temperature" | "rain">("temperature");
  const id = useId();
  const vi = settings.locale === "vi";
  const values = hours.slice(0, 12);
  if (values.length < 2) return null;
  const low = Math.min(...values.map((hour) => hour.temperature));
  const high = Math.max(...values.map((hour) => hour.temperature));
  const activeIndex = Math.max(0, values.findIndex((hour) => hour.time === selectedTime));
  const activeHour = values[activeIndex];
  const chooseFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, ((event.clientX - rect.left) / rect.width * 320 - 18) / 284));
    onSelect(values[Math.round(fraction * (values.length - 1))].time);
  };
  const title = mode === "temperature" ? vi ? "Nhiệt độ theo giờ" : "Hourly temperature" : vi ? "Khả năng mưa / tuyết" : "Precipitation probability";
  const points = values.map((hour, index) => ({
    x: 18 + index / (values.length - 1) * 284,
    y: 84 - (mode === "temperature" ? (hour.temperature - low) / Math.max(1, high - low) : hour.precipitationProbability / 100) * 62,
  }));
  return <section className="forecast-profile" aria-labelledby={`${id}-heading`}>
    <div className="section-heading"><h2 id={`${id}-heading`}>{vi ? "12 giờ tiếp theo" : "The next 12 hours"}</h2>
      <SegmentedControl value={mode} label={vi ? "Loại dự báo" : "Forecast type"} options={[{ value: "temperature", label: vi ? "Nhiệt độ" : "Temperature" }, { value: "rain", label: vi ? "Mưa" : "Rain" }]} onChange={setMode} />
    </div>
    <div className="profile-reading" aria-live="polite"><time dateTime={activeHour.time}>{activeHour.time.slice(11, 16)}</time><strong>{mode === "temperature" ? formatTemperature(activeHour.temperature, settings.temperatureUnit) : `${activeHour.precipitationProbability}%`}</strong><span>{mode === "temperature" ? vi ? "Nhiệt độ dự báo" : "Forecast temperature" : vi ? "Khả năng mưa / tuyết" : "Precipitation chance"}</span></div>
    <div className="profile-interaction" role="slider" tabIndex={0} aria-label={vi ? "Chọn giờ dự báo" : "Select forecast hour"} aria-valuemin={0} aria-valuemax={values.length - 1} aria-valuenow={activeIndex} aria-valuetext={`${activeHour.time.slice(11, 16)}, ${mode === "temperature" ? formatTemperature(activeHour.temperature, settings.temperatureUnit) : `${activeHour.precipitationProbability}%`}`}
      onPointerDown={(event) => { if (!event.isPrimary || event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); chooseFromPointer(event); }}
      onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) chooseFromPointer(event); }}
      onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onKeyDown={(event) => {
        let next = activeIndex;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") next++;
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next--;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = values.length - 1;
        else return;
        event.preventDefault(); onSelect(values[Math.max(0, Math.min(values.length - 1, next))].time);
      }}>
    <TransitionSwap identity={mode}>
      <svg viewBox="0 0 320 110" className="forecast-plot" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{title}</title><desc id={`${id}-description`}>{values.map((hour) => `${hour.time.slice(11, 16)}: ${mode === "temperature" ? formatTemperature(hour.temperature, settings.temperatureUnit) : `${hour.precipitationProbability}%`}`).join("; ")}</desc>
        {[22, 53, 84].map((y) => <line key={y} x1="18" x2="302" y1={y} y2={y} className="plot-grid" />)}
        {mode === "temperature" ? <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} className="plot-line" /> : points.map((point, index) => <line key={index} x1={point.x} x2={point.x} y1="84" y2={point.y} className="plot-rain" />)}
        {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="2.5" className="plot-dot" />)}
        {[0, Math.floor(values.length / 2), values.length - 1].map((index) => <text key={index} x={points[index].x} y="105" textAnchor={index === 0 ? "start" : index === values.length - 1 ? "end" : "middle"}>{values[index].time.slice(11, 16)}</text>)}
      </svg>
    </TransitionSwap>
    <span className="profile-cursor" style={{ left: `${points[activeIndex].x / 320 * 100}%` }} aria-hidden="true" />
    </div>
    <div className="profile-range"><span>{vi ? "Chạm hoặc kéo trên biểu đồ" : "Touch or drag across the chart"}</span><strong>{mode === "temperature" ? `${formatTemperature(low, settings.temperatureUnit)} – ${formatTemperature(high, settings.temperatureUnit)}` : "0 – 100%"}</strong></div>
  </section>;
}
