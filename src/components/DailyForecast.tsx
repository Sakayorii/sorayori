import { useId, useState } from "react";
import { ChevronDown, Droplets, Sunrise, Sunset } from "lucide-react";
import { formatTemperature, weekday } from "../format";
import { translate, weatherLabel } from "../i18n";
import type { DailyWeather, Settings } from "../types";
import { WeatherIcon } from "../weather";
import { Disclosure } from "./Disclosure";

export function DailyForecast({ days, settings }: { days: DailyWeather[]; settings: Settings }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const id = useId();
  const t = (key: Parameters<typeof translate>[1]) => translate(settings.locale, key);
  return <div className="daily-list">{days.map((day, index) => {
    const open = expanded === day.date;
    const panelId = `${id}-${index}`;
    return <div className="forecast-day" data-open={open} key={day.date}>
      <button type="button" className="forecast-day-button" aria-expanded={open} aria-controls={panelId} onClick={() => setExpanded(open ? null : day.date)}>
        <time dateTime={day.date}>{weekday(day.date, settings.locale)}</time>
        <WeatherIcon code={day.weatherCode} isDay size={40} />
        <span className="day-temps"><strong>{formatTemperature(day.temperatureMax, settings.temperatureUnit)}</strong><span>{formatTemperature(day.temperatureMin, settings.temperatureUnit)}</span></span>
        <ChevronDown size={16} className="day-chevron" aria-hidden="true" />
      </button>
      <Disclosure open={open} id={panelId}>
        <div className="forecast-day-body">
          <p>{t(weatherLabel(day.weatherCode))}</p>
          <dl className="day-facts">
            <div><dt><Droplets size={16} aria-hidden="true" />{t("rain")}</dt><dd>{day.precipitationProbability}%</dd></div>
            <div><dt>{t("uv")}</dt><dd>{Math.round(day.uvIndexMax)}</dd></div>
            <div><dt><Sunrise size={16} aria-hidden="true" />{t("sunrise")}</dt><dd>{day.sunrise?.slice(11, 16) || "—"}</dd></div>
            <div><dt><Sunset size={16} aria-hidden="true" />{t("sunset")}</dt><dd>{day.sunset?.slice(11, 16) || "—"}</dd></div>
          </dl>
        </div>
      </Disclosure>
    </div>;
  })}</div>;
}
