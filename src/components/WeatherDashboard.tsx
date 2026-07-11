import { Droplets, LocateFixed, RefreshCw, Sunrise, Sunset, Wind } from "lucide-react";
import { formatSpeed, formatTemperature, formatUpdated, nextHours, weekday } from "../format";
import { translate, weatherLabel } from "../i18n";
import type { Settings, WeatherReport } from "../types";
import { WeatherIcon } from "../weather";

interface WeatherDashboardProps {
  report: WeatherReport;
  settings: Settings;
  error: string;
  onRefresh: () => void;
}

export function WeatherDashboard({ report, settings, error, onRefresh }: WeatherDashboardProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(settings.locale, key);
  const today = report.daily[0];

  return (
    <div className="weather-content">
      <section className="current-block">
        <div className="current-condition">
          <WeatherIcon code={report.current.weatherCode} isDay={report.current.isDay} size={25} />
          <span>{t(weatherLabel(report.current.weatherCode))}</span>
        </div>
        <div className="temperature">{formatTemperature(report.current.temperature, settings.temperatureUnit)}</div>
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
          <span>{report.fromCache ? t("cached") : error}</span>
          <button onClick={onRefresh} aria-label={t("retry")}><RefreshCw size={15} /></button>
        </div>
      )}

      <section className="forecast-section">
        <h2>{t("hourly")}</h2>
        <div className="hourly-list">
          {nextHours(report).map((hour, index) => (
            <div className="hour-item" key={hour.time}>
              <time>{index === 0 ? t("now") : hour.time.slice(11, 16)}</time>
              <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} size={22} />
              <strong>{formatTemperature(hour.temperature, settings.temperatureUnit)}</strong>
              <small>{hour.precipitationProbability}%</small>
            </div>
          ))}
        </div>
      </section>

      <section className="metrics-grid">
        <Metric icon={<Droplets />} label={t("humidity")} value={`${report.current.humidity}%`} />
        <Metric icon={<Wind />} label={t("wind")} value={formatSpeed(report.current.windSpeed, settings.speedUnit)} />
        <Metric icon={<Droplets />} label={t("rain")} value={`${today?.precipitationProbability ?? 0}%`} />
        <Metric icon={<LocateFixed />} label={t("uv")} value={String(Math.round(today?.uvIndexMax ?? 0))} />
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
