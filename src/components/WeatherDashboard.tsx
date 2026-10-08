import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Cloud, CloudRain, Compass, Droplets, RefreshCw, Sun, Sunrise, Sunset, Wind } from "lucide-react";
import { AnimatedTemperature } from "./AnimatedTemperature";
import { formatSpeed, formatTemperature, formatUpdated, nextHours } from "../format";
import { translate, weatherLabel } from "../i18n";
import type { Settings, WeatherReport } from "../types";
import { WeatherIcon } from "../weather";
import { Disclosure } from "./Disclosure";
import { forecastEvents, forecastInsight } from "../forecast";
import { DailyForecast } from "./DailyForecast";
import { TransitionSwap } from "./TransitionSwap";
import { useReducedMotion } from "../motion";
import { ForecastProfile } from "./ForecastProfile";

interface WeatherDashboardProps {
  report: WeatherReport;
  settings: Settings;
  error: string;
  loading: boolean;
  onRefresh: () => void;
}

export function WeatherDashboard({ report, settings, error, loading, onRefresh }: WeatherDashboardProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(settings.locale, key);
  const today = report.daily[0];
  const hours = nextHours(report);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const selectedHour = hours.find((hour) => hour.time === selectedTime) ?? hours[0];
  const events = forecastEvents(report, settings.locale);
  const insight = forecastInsight(hours, settings.locale);
  const hourlyRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const markerAnimation = useRef<Animation | null>(null);
  const markerReady = useRef(false);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const list = hourlyRef.current!;
    const marker = markerRef.current!;
    const measure = (animate: boolean) => {
      const item = list.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (!item) { marker.hidden = true; return; }
      marker.hidden = false;
      const oldTransform = getComputedStyle(marker).transform;
      markerAnimation.current?.cancel();
      const transform = `translateX(${item.offsetLeft}px)`;
      marker.style.transform = transform;
      marker.style.width = `${item.offsetWidth}px`;
      marker.style.height = `${item.offsetHeight}px`;
      if (animate && markerReady.current && !reduced) markerAnimation.current = marker.animate([
        { transform: oldTransform }, { transform },
      ], { duration: 320, easing: "cubic-bezier(0.2, 0.75, 0.25, 1)" });
      markerReady.current = true;
    };
    measure(true);
    const observer = new ResizeObserver(() => measure(false));
    observer.observe(list);
    return () => { observer.disconnect(); };
  }, [selectedHour?.time, settings.locale, settings.temperatureUnit, reduced]);
  useLayoutEffect(() => () => markerAnimation.current?.cancel(), []);

  return (
    <div className="weather-content" aria-busy={loading}>
      <section className="current-block" aria-labelledby="current-condition">
        <TransitionSwap identity={`${report.locationName}-${report.current.weatherCode}`} className="current-condition">
          <WeatherIcon code={report.current.weatherCode} isDay={report.current.isDay} size={25} />
          <span id="current-condition">{t(weatherLabel(report.current.weatherCode))}</span>
        </TransitionSwap>
        <AnimatedTemperature value={report.current.temperature} unit={settings.temperatureUnit} />
        <p className="feels-like">
          {t("feelsLike")} {formatTemperature(report.current.apparentTemperature, settings.temperatureUnit)}
        </p>
        <p className="high-low">
          {formatTemperature(today?.temperatureMax ?? report.current.temperature, settings.temperatureUnit)}
          <span />
          {formatTemperature(today?.temperatureMin ?? report.current.temperature, settings.temperatureUnit)}
        </p>
      </section>

      {(error || report.fromCache) && (
        <div className="status-strip" role="status">
          <span>{error || t("cached")} · {formatUpdated(report.fetchedAt, settings.locale)}</span>
          <button onClick={onRefresh} disabled={loading} aria-label={t("retry")}><RefreshCw size={15} /></button>
        </div>
      )}

      <section className="forecast-section timeline-surface">
        <div className="section-heading">
          <h2>{t("hourly")}</h2>
          <button className={`refresh-button${loading ? " is-loading" : ""}`} disabled={loading} onClick={onRefresh} aria-label={t("retry")}><RefreshCw size={17} /></button>
        </div>
        <div className="hourly-list" ref={hourlyRef}>
          <span ref={markerRef} className="hour-marker" aria-hidden="true" />
          {hours.slice(0, 12).map((hour, index) => (
            <button type="button" className={`hour-item${selectedHour?.time === hour.time ? " is-current" : ""}`} key={hour.time} aria-pressed={selectedHour?.time === hour.time} onClick={(event) => { setSelectedTime(hour.time); event.currentTarget.scrollIntoView({ behavior: reduced ? "auto" : "smooth", inline: "nearest", block: "nearest" }); }}>
              <time dateTime={hour.time}>{index === 0 ? t("now") : hour.time.slice(11, 16)}</time>
              <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} size={40} />
              <strong>{formatTemperature(hour.temperature, settings.temperatureUnit)}</strong>
              <small>{hour.precipitationProbability}%</small>
            </button>
          ))}
        </div>
        <div aria-live="polite">{selectedHour ? <TransitionSwap identity={`${selectedHour.time}-${settings.locale}`} className="hour-summary"><span>{selectedHour.time.slice(11, 16)} · {t(weatherLabel(selectedHour.weatherCode))}</span><span>{t("rain")} {selectedHour.precipitationProbability}%</span></TransitionSwap> : <p className="forecast-empty">{t("hourlyUnavailable")}</p>}</div>
      </section>

      <section className="insight-strip" aria-label={t("outlook")}>
        <h2>{t("outlook")}</h2>
        <TransitionSwap identity={insight}><p>{insight}</p></TransitionSwap>
        {events.length > 0 && <ol className="weather-events">{events.map((event) => <li key={`${event.kind}-${event.time}`}><time dateTime={event.time}>{event.time.slice(11, 16)}</time>{event.kind === "rain" ? <CloudRain size={17} aria-hidden="true" /> : event.kind === "temperature" ? <Wind size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}<span>{event.label}</span></li>)}</ol>}
      </section>

      <section className="details-section">
        <ForecastProfile hours={hours} settings={settings} />
        <div className="section-heading">
          <h2>{t("details")}</h2>
          <button type="button" className="details-toggle" aria-expanded={detailsOpen} aria-controls="expanded-weather-details" onClick={() => setDetailsOpen((open) => !open)}>
            {detailsOpen ? t("hideDetails") : t("showDetails")}
            <ChevronDown size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="metrics-ribbon">
          <Metric icon={<Droplets />} label={t("humidity")} value={`${report.current.humidity}%`} />
          <Metric icon={<Wind />} label={t("wind")} value={formatSpeed(report.current.windSpeed, settings.speedUnit)} />
          <Metric icon={<CloudRain />} label={t("rain")} value={today ? `${today.precipitationProbability}%` : "—"} />
          <Metric icon={<Sun />} label={t("uv")} value={today ? String(Math.round(today.uvIndexMax)) : "—"} />
        </div>
        <Disclosure open={detailsOpen} id="expanded-weather-details">
          <div className="expanded-details">
            <Metric icon={<Cloud />} label={t("cloudCover")} value={`${report.current.cloudCover}%`} />
            <Metric icon={<Compass />} label={t("direction")} value={`${report.current.windDirection}°`} />
            <Metric icon={<CloudRain />} label={t("precipitation")} value={`${report.current.precipitation} mm`} />
            <Metric icon={<Sun />} label={t("feelsLike")} value={formatTemperature(report.current.apparentTemperature, settings.temperatureUnit)} />
          </div>
        </Disclosure>
      </section>

      <section className="sun-times">
        <div><Sunrise /><span>{t("sunrise")}</span><strong>{today?.sunrise?.slice(11, 16) || "—"}</strong></div>
        <div><Sunset /><span>{t("sunset")}</span><strong>{today?.sunset?.slice(11, 16) || "—"}</strong></div>
      </section>

      <section className="daily-section">
        <h2>{t("nextDays")}</h2>
        <DailyForecast days={report.daily.slice(1, 8)} settings={settings} />
      </section>

      <footer>{t("updated")} {formatUpdated(report.fetchedAt, settings.locale)}</footer>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="metric">{icon}<span>{label}</span><strong>{value}</strong></div>;
}
