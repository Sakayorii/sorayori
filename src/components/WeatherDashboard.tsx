import { useState } from "react";
import { ChevronDown, Cloud, CloudRain, Compass, Droplets, RefreshCw, Sun, Sunrise, Sunset, Wind } from "lucide-react";
import { AnimatedTemperature } from "./AnimatedTemperature";
import { formatSpeed, formatTemperature, formatUpdated, nextHours, weekday } from "../format";
import { translate, weatherLabel } from "../i18n";
import type { Settings, WeatherReport } from "../types";
import { WeatherIcon } from "../weather";

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
  const first = hours[0];
  const later = hours[Math.min(5, hours.length - 1)];
  const peakRain = Math.max(0, ...hours.slice(0, 8).map((hour) => hour.precipitationProbability));
  const temperatureChange = first && later ? later.temperature - first.temperature : 0;
  const insight = peakRain >= 50
    ? t("insightRain")
    : temperatureChange <= -2
      ? t("insightCooling")
      : temperatureChange >= 2
        ? t("insightWarming")
        : t("insightClear");

  return (
    <div className="weather-content" aria-busy={loading}>
      <section className="current-block" aria-labelledby="current-condition">
        <div className="current-condition">
          <WeatherIcon code={report.current.weatherCode} isDay={report.current.isDay} size={25} />
          <span id="current-condition">{t(weatherLabel(report.current.weatherCode))}</span>
        </div>
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

      <section className="insight-strip" aria-label={t("outlook")}>
        <span>{t("outlook")}</span>
        <p>{insight}</p>
      </section>

      {(error || report.fromCache) && (
        <div className="status-strip" role="status">
          <span>{report.fromCache ? t("cached") : error}</span>
          <button onClick={onRefresh} disabled={loading} aria-label={t("retry")}><RefreshCw size={15} /></button>
        </div>
      )}

      <section className="forecast-section glass-surface">
        <div className="section-heading">
          <h2>{t("hourly")}</h2>
          <button className={`refresh-button${loading ? " is-loading" : ""}`} disabled={loading} onClick={onRefresh} aria-label={t("retry")}><RefreshCw size={17} /></button>
        </div>
        <div className="hourly-list">
          {hours.slice(0, 12).map((hour, index) => (
            <div className={`hour-item${index === 0 ? " is-current" : ""}`} key={hour.time}>
              <time>{index === 0 ? t("now") : hour.time.slice(11, 16)}</time>
              <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} size={22} />
              <strong>{formatTemperature(hour.temperature, settings.temperatureUnit)}</strong>
              <small>{hour.precipitationProbability}%</small>
            </div>
          ))}
        </div>
      </section>

      <section className="details-section">
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
          <Metric icon={<CloudRain />} label={t("rain")} value={`${today?.precipitationProbability ?? 0}%`} />
          <Metric icon={<Sun />} label={t("uv")} value={String(Math.round(today?.uvIndexMax ?? 0))} />
        </div>
        {detailsOpen && (
          <div className="expanded-details" id="expanded-weather-details">
            <Metric icon={<Cloud />} label={t("cloudCover")} value={`${report.current.cloudCover}%`} />
            <Metric icon={<Compass />} label={t("direction")} value={`${report.current.windDirection}°`} />
          </div>
        )}
      </section>

      <section className="sun-times">
        <div><Sunrise /><span>{t("sunrise")}</span><strong>{today?.sunrise.slice(11, 16)}</strong></div>
        <div><Sunset /><span>{t("sunset")}</span><strong>{today?.sunset.slice(11, 16)}</strong></div>
      </section>

      <section className="daily-section">
        <h2>{t("nextDays")}</h2>
        <div className="daily-list">
          {report.daily.slice(1, 8).map((day) => (
            <div className="day-row" key={day.date}>
              <time>{weekday(day.date, settings.locale)}</time>
              <div className="day-rain"><Droplets size={13} />{day.precipitationProbability}%</div>
              <WeatherIcon code={day.weatherCode} isDay size={22} />
              <div className="day-temps">
                <strong>{formatTemperature(day.temperatureMax, settings.temperatureUnit)}</strong>
                <span>{formatTemperature(day.temperatureMin, settings.temperatureUnit)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>{t("updated")} {formatUpdated(report.fetchedAt, settings.locale)}</footer>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="metric">{icon}<span>{label}</span><strong>{value}</strong></div>;
}
