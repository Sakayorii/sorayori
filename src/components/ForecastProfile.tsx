import { useId, useState } from "react";
import type { HourlyWeather, Settings } from "../types";
import { formatTemperature } from "../format";
import { SegmentedControl } from "./SegmentedControl";
import { TransitionSwap } from "./TransitionSwap";

export function ForecastProfile({ hours, settings }: { hours: HourlyWeather[]; settings: Settings }) {
  const [mode, setMode] = useState<"temperature" | "rain">("temperature");
  const [selected, setSelected] = useState(0);
  const id = useId();
  const vi = settings.locale === "vi";
  const values = hours.slice(0, 12);
  if (values.length < 2) return null;
  const low = Math.min(...values.map((hour) => hour.temperature));
  const high = Math.max(...values.map((hour) => hour.temperature));
  const activeIndex = Math.min(selected, values.length - 1);
  const activeHour = values[activeIndex];
  const title = mode === "temperature" ? vi ? "Nhiệt độ theo giờ" : "Hourly temperature" : vi ? "Khả năng mưa / tuyết" : "Precipitation probability";
  const points = values.map((hour, index) => ({
    x: 18 + index / (values.length - 1) * 284,
    y: 84 - (mode === "temperature" ? (hour.temperature - low) / Math.max(1, high - low) : hour.precipitationProbability / 100) * 62,
  }));
  return <section className="forecast-profile" aria-labelledby={`${id}-heading`}>
    <div className="section-heading"><h2 id={`${id}-heading`}>{vi ? "Nhịp thời tiết" : "Weather rhythm"}</h2>
      <SegmentedControl value={mode} label={vi ? "Loại dự báo" : "Forecast type"} options={[{ value: "temperature", label: vi ? "Nhiệt độ" : "Temperature" }, { value: "rain", label: vi ? "Mưa" : "Rain" }]} onChange={setMode} />
    </div>
    <TransitionSwap identity={mode}>
      <svg viewBox="0 0 320 110" className="forecast-plot" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{title}</title><desc id={`${id}-description`}>{values.map((hour) => `${hour.time.slice(11, 16)}: ${mode === "temperature" ? formatTemperature(hour.temperature, settings.temperatureUnit) : `${hour.precipitationProbability}%`}`).join("; ")}</desc>
        {[22, 53, 84].map((y) => <line key={y} x1="18" x2="302" y1={y} y2={y} className="plot-grid" />)}
        {mode === "temperature" ? <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} className="plot-line" /> : points.map((point, index) => <line key={index} x1={point.x} x2={point.x} y1="84" y2={point.y} className="plot-rain" />)}
        {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="2.5" className="plot-dot" />)}
        <line x1={points[activeIndex].x} x2={points[activeIndex].x} y1="15" y2="88" className="plot-cursor" />
        <circle cx={points[activeIndex].x} cy={points[activeIndex].y} r="5" className="plot-selected" />
        {[0, Math.floor(values.length / 2), values.length - 1].map((index) => <text key={index} x={points[index].x} y="105" textAnchor={index === 0 ? "start" : index === values.length - 1 ? "end" : "middle"}>{values[index].time.slice(11, 16)}</text>)}
      </svg>
    </TransitionSwap>
    <label className="forecast-scrubber">
      <span>{vi ? "Khám phá từng giờ" : "Explore each hour"}</span>
      <input type="range" min="0" max={values.length - 1} step="1" value={activeIndex} onChange={(event) => setSelected(Number(event.target.value))}
        aria-valuetext={`${activeHour.time.slice(11, 16)}, ${formatTemperature(activeHour.temperature, settings.temperatureUnit)}, ${activeHour.precipitationProbability}%`} />
    </label>
    <div className="profile-selected" aria-live="polite"><time dateTime={activeHour.time}>{activeHour.time.slice(11, 16)}</time><strong>{formatTemperature(activeHour.temperature, settings.temperatureUnit)}</strong><span>{vi ? "Khả năng mưa / tuyết" : "Precipitation chance"} {activeHour.precipitationProbability}%</span></div>
    <div className="profile-range"><span>{title}</span><strong>{mode === "temperature" ? `${formatTemperature(low, settings.temperatureUnit)} – ${formatTemperature(high, settings.temperatureUnit)}` : `0 – ${Math.max(...values.map((hour) => hour.precipitationProbability))}%`}</strong></div>
  </section>;
}
