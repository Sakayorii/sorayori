import { useEffect, useState } from "react";
import { useReducedMotion } from "./motion";
import { Precipitation } from "./components/Precipitation";

export type SceneKind = "clear" | "cloud" | "fog" | "rain" | "snow" | "storm";

export function sceneKind(code: number): SceneKind {
  if (code === 0) return "clear";
  if (code <= 3) return "cloud";
  if (code <= 48) return "fog";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rain";
  if (code <= 86) return "snow";
  return "storm";
}

export function weatherIconName(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "clear-day" : "clear-night";
  if (code <= 1) return isDay ? "clear-day" : "clear-night";
  if (code <= 2) return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
  if (code === 3) return "overcast";
  if (code <= 48) return "fog";
  if (code <= 57) return "drizzle";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  if (code <= 86) return "snow";
  return "thunderstorms-rain";
}

export function WeatherIcon({ code, isDay, size = 24 }: { code: number; isDay: boolean; size?: number }) {
  const name = weatherIconName(code, isDay);
  return <img className="weather-icon" style={{ width: size, height: size }} src={`/assets/meteocons/${name}-static.svg`} alt="" aria-hidden="true" draggable={false} />;
}

export function WeatherScene({ code, isDay, active = true }: { code: number; isDay: boolean; active?: boolean }) {
  const kind = sceneKind(code);
  const key = `${kind}-${isDay}`;
  const reduced = useReducedMotion();
  const [layers, setLayers] = useState([{ key, kind, isDay }]);
  useEffect(() => {
    setLayers((previous) => {
      const last = previous[previous.length - 1];
      if (last.key === key) return previous;
      return reduced ? [{ key, kind, isDay }] : [last, { key, kind, isDay }];
    });
    const timer = window.setTimeout(() => setLayers((previous) => previous.slice(-1)), 700);
    return () => window.clearTimeout(timer);
  }, [key, kind, isDay, reduced]);
  return <div className="scene-stack" aria-hidden="true">{layers.map((layer) => <SceneLayer key={layer.key} kind={layer.kind} isDay={layer.isDay} active={active && layer.key === key} />)}</div>;
}

function SceneLayer({ kind, isDay, active }: { kind: SceneKind; isDay: boolean; active: boolean }) {
  return (
    <div className={`weather-scene scene-${kind} ${isDay ? "day" : "night"}`} aria-hidden="true">
      <div className="sky-light" />
      {kind === "clear" && <div className={`celestial-art ${isDay ? "celestial-day" : "celestial-night"}`}>
        <img src={`/assets/meteocons/${isDay ? "clear-day" : "clear-night"}-static.svg`} alt="" draggable={false} />
      </div>}
      {(kind === "cloud" || kind === "rain" || kind === "storm") && (
        <div className="cloud-group">
          <div className="cloud-photo-layer cloud-back" />
          <div className="cloud-photo-layer cloud-front" />
        </div>
      )}
      <div className="scene-shade" />
      {kind === "fog" && <div className="fog-lines"><i /><i /><i /><i /></div>}
      {(kind === "rain" || kind === "storm" || kind === "snow") && <Precipitation snow={kind === "snow"} active={active} />}
      {!isDay && (kind === "clear" || kind === "cloud") && (
        <div className="stars">
          {Array.from({ length: 22 }, (_, index) => (
            <i key={index} style={{ left: `${(index * 37 + 7) % 96}%`, top: `${6 + (index * 19) % 38}%`, animationDelay: `${-(index % 7) * 0.4}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}
