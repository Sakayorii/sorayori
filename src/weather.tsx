import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";
import type { CSSProperties } from "react";

export type SceneKind = "clear" | "cloud" | "fog" | "rain" | "snow" | "storm";

export function sceneKind(code: number): SceneKind {
  if (code === 0) return "clear";
  if (code <= 3) return "cloud";
  if (code <= 48) return "fog";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rain";
  if (code <= 86) return "snow";
  return "storm";
}

export function WeatherIcon({ code, isDay, size = 24 }: { code: number; isDay: boolean; size?: number }) {
  const props = { size, strokeWidth: 1.7, "aria-hidden": true };
  if (code === 0) return isDay ? <Sun {...props} /> : <Moon {...props} />;
  if (code <= 2) return <CloudSun {...props} />;
  if (code === 3) return <Cloud {...props} />;
  if (code <= 48) return <CloudFog {...props} />;
  if (code <= 57) return <CloudDrizzle {...props} />;
  if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain {...props} />;
  if (code <= 77 || (code >= 85 && code <= 86)) return <CloudSnow {...props} />;
  return <CloudLightning {...props} />;
}

export function WeatherScene({ code, isDay }: { code: number; isDay: boolean }) {
  const kind = sceneKind(code);
  return (
    <div className={`weather-scene scene-${kind} ${isDay ? "day" : "night"}`} aria-hidden="true">
      <div className="sky-light" />
      <div className="air-current air-current-one" />
      <div className="air-current air-current-two" />
      {kind === "clear" && <div className={isDay ? "sun-disc" : "moon-disc"} />}
      {(kind === "cloud" || kind === "rain" || kind === "storm") && (
        <div className="cloud-photo-layer" />
      )}
      {kind === "fog" && <div className="fog-lines"><i /><i /><i /><i /></div>}
      {(kind === "rain" || kind === "storm") && (
        <div className="rain-field">
          {Array.from({ length: 32 }, (_, index) => <i key={index} style={particleStyle(index, 32, 0.91)} />)}
        </div>
      )}
      {kind === "snow" && (
        <div className="snow-field">
          {Array.from({ length: 24 }, (_, index) => <i key={index} style={particleStyle(index, 24, 4.63)} />)}
        </div>
      )}
      {!isDay && (
        <div className="stars">
          {Array.from({ length: 22 }, (_, index) => (
            <i key={index} style={{ left: `${(index * 37 + 7) % 96}%`, top: `${6 + (index * 19) % 38}%`, animationDelay: `${-(index % 7) * 0.4}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

function particleStyle(index: number, count: number, duration: number): CSSProperties {
  return {
    left: `${((index * 43) % count) / count * 100}%`,
    animationDelay: `${-(index * duration / 7)}s`,
  };
}
