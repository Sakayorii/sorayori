import { ChevronRight, Languages, MapPin, Navigation, Search, Thermometer, Wind, X } from "lucide-react";
import { translate } from "../i18n";
import type { Locale, Place, Settings } from "../types";
import { SegmentedControl } from "./SegmentedControl";
import { TransitionSwap } from "./TransitionSwap";

export function SearchPanel({ query, setQuery, results, searching, searchError, locating, locale, onChoose, onCurrentLocation }: {
  query: string;
  setQuery: (value: string) => void;
  results: Place[];
  searching: boolean;
  searchError: boolean;
  locating: boolean;
  locale: Locale;
  onChoose: (place: Place) => void;
  onCurrentLocation: () => void;
}) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <div className="search-panel">
      <label className="search-field">
        <Search size={19} />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} aria-label={t("search")} autoComplete="off" enterKeyHint="search" spellCheck={false} />
        {query && <button type="button" onClick={() => setQuery("")} aria-label={t("close")}><X size={17} /></button>}
      </label>
      <button type="button" className="current-location-row" onClick={onCurrentLocation} disabled={locating} aria-busy={locating}>
        <Navigation size={19} />
        <span>{locating ? t("locating") : t("currentLocation")}</span>
        <ChevronRight size={17} />
      </button>
      <div className="search-results" aria-live="polite" aria-busy={searching}>
        <TransitionSwap identity={searching ? "loading" : searchError ? "error" : results.length ? results.map((place) => place.id).join(",") : query.trim().length < 2 ? "hint" : "empty"}>
        {searching && <div className="search-message">{t("loading")}</div>}
        {!searching && query.trim().length < 2 && <div className="search-message">{t("searchHint")}</div>}
        {!searching && searchError && <div className="search-message" role="alert">{t("searchFailed")}</div>}
        {!searching && !searchError && query.trim().length >= 2 && results.length === 0 && <div className="search-message">{t("noResults")}</div>}
        {!searching && results.map((result) => (
          <button type="button" className="place-row" key={result.id} onClick={() => onChoose(result)}>
            <MapPin size={18} />
            <span><strong>{result.name}</strong><small>{[result.admin1, result.country].filter(Boolean).join(", ")}</small></span>
            <ChevronRight size={17} />
          </button>
        ))}
        </TransitionSwap>
      </div>
    </div>
  );
}

export function SettingsPanel({ settings, update }: { settings: Settings; update: (next: Partial<Settings>) => void }) {
  const t = (key: Parameters<typeof translate>[1]) => translate(settings.locale, key);
  return (
    <div className="settings-panel">
      <p className="settings-intro">{t("settingsIntro")}</p>
      <section className="setting-row" aria-labelledby="language-setting">
        <div className="setting-copy">
          <span className="setting-icon" aria-hidden="true"><Languages size={19} /></span>
          <span>
            <strong id="language-setting">{t("language")}</strong>
            <small>{t("languageDescription")}</small>
          </span>
        </div>
        <SegmentedControl value={settings.locale} label={t("language")} options={[{ value: "vi", label: "VI" }, { value: "en", label: "EN" }]} onChange={(locale) => update({ locale })} />
      </section>
      <section className="setting-row" aria-labelledby="units-setting">
        <div className="setting-copy">
          <span className="setting-icon" aria-hidden="true"><Thermometer size={19} /></span>
          <span>
            <strong id="units-setting">{t("units")}</strong>
            <small>{t("unitsDescription")}</small>
          </span>
        </div>
        <SegmentedControl value={settings.temperatureUnit} label={t("units")} options={[{ value: "celsius", label: "°C" }, { value: "fahrenheit", label: "°F" }]} onChange={(temperatureUnit) => update({ temperatureUnit })} />
      </section>
      <section className="setting-row">
        <div className="setting-copy"><span className="setting-icon" aria-hidden="true"><Navigation size={19} /></span><span><strong>{t("wind")}</strong><small>{t("windUnitsDescription")}</small></span></div>
        <SegmentedControl value={settings.speedUnit} label={t("wind")} options={[{ value: "kmh", label: "km/h" }, { value: "mph", label: "mph" }]} onChange={(speedUnit) => update({ speedUnit })} />
      </section>
      <p className="settings-footnote">{t("settingsApplied")}</p>
      <section className="setting-row">
        <div className="setting-copy"><span className="setting-icon" aria-hidden="true"><Wind size={19} /></span><span><strong>{t("atmosphere")}</strong><small>{t("atmosphereDescription")}</small></span></div>
        <SegmentedControl value={settings.atmosphere ?? "full"} label={t("atmosphere")} options={[{ value: "full", label: t("animated") }, { value: "still", label: t("still") }]} onChange={(atmosphere) => update({ atmosphere })} />
      </section>
    </div>
  );
}
