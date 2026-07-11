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
      {kind === "clear" && <div className={isDay ? "sun-disc" : "moon-disc"} />}
      {(kind === "cloud" || kind === "rain" || kind === "storm") && (
        <>
          <div className="cloud-shape cloud-one" />
          <div className="cloud-shape cloud-two" />
          <div className="cloud-shape cloud-three" />
        </>
      )}
      {kind === "fog" && <div className="fog-lines"><i /><i /><i /><i /></div>}
      {(kind === "rain" || kind === "storm") && (
        <div className="rain-field">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
      )}
      {kind === "snow" && (
        <div className="snow-field">{Array.from({ length: 16 }, (_, index) => <i key={index} />)}</div>
      )}
      {!isDay && <div className="stars">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>}
    </div>
  );
}
