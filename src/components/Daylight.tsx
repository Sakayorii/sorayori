import { Sunrise, Sunset } from "lucide-react";
import type { DailyWeather, Locale } from "../types";

function minutes(value: string) {
  const match = /T(\d{2}):(\d{2})/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function Daylight({ day, time, locale }: { day?: DailyWeather; time: string; locale: Locale }) {
  const vi = locale === "vi";
  const rise = minutes(day?.sunrise ?? "");
  const set = minutes(day?.sunset ?? "");
  const now = minutes(time);
  const available = rise !== null && set !== null && set > rise;
  const duration = available ? set - rise : 0;
  const progress = available && now !== null ? Math.max(0, Math.min(1, (now - rise) / duration)) : 0;
  return <section className="daylight-section" aria-label={vi ? "Ánh sáng trong ngày" : "Daylight"}>
    <div className="section-heading"><h2>{vi ? "Ánh sáng trong ngày" : "Daylight"}</h2><span>{available ? `${Math.floor(duration / 60)} ${vi ? "giờ" : "hr"} ${duration % 60} ${vi ? "phút" : "min"}` : "—"}</span></div>
    {available && <div className="daylight-track" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /><i style={{ left: `${progress * 100}%` }} /></div>}
    <div className="daylight-times"><div><Sunrise size={20} aria-hidden="true" /><span>{vi ? "Bình minh" : "Sunrise"}</span><strong>{day?.sunrise?.slice(11, 16) || "—"}</strong></div><div><Sunset size={20} aria-hidden="true" /><span>{vi ? "Hoàng hôn" : "Sunset"}</span><strong>{day?.sunset?.slice(11, 16) || "—"}</strong></div></div>
    <p>{!available || now === null ? vi ? "Chưa có thông tin ánh sáng cho ngày này." : "Daylight information is unavailable."
      : now < rise ? vi ? "Mặt trời chưa mọc tại địa điểm này." : "Before sunrise at this location."
      : now >= set ? vi ? "Mặt trời đã lặn tại địa điểm này." : "After sunset at this location."
      : vi ? `Còn ${Math.floor((set - now) / 60)} giờ ${(set - now) % 60} phút ánh sáng vào thời điểm cập nhật.` : `${Math.floor((set - now) / 60)} hr ${(set - now) % 60} min of daylight remaining at the forecast update.`}</p>
  </section>;
}
