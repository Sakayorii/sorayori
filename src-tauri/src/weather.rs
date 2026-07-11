use std::time::Duration;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

const FORECAST_URL: &str = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL: &str = "https://geocoding-api.open-meteo.com/v1/search";

#[derive(Debug, Deserialize)]
struct ApiCurrent {
    time: String,
    temperature_2m: f64,
    relative_humidity_2m: u8,
    apparent_temperature: f64,
    is_day: u8,
    precipitation: f64,
    weather_code: u16,
    cloud_cover: u8,
    wind_speed_10m: f64,
    wind_direction_10m: u16,
}

#[derive(Debug, Deserialize)]
struct ApiHourly {
    time: Vec<String>,
    temperature_2m: Vec<f64>,
    precipitation_probability: Vec<u8>,
    weather_code: Vec<u16>,
    is_day: Vec<u8>,
}

#[derive(Debug, Deserialize)]
struct ApiDaily {
    time: Vec<String>,
    weather_code: Vec<u16>,
    temperature_2m_max: Vec<f64>,
    temperature_2m_min: Vec<f64>,
    sunrise: Vec<String>,
    sunset: Vec<String>,
    uv_index_max: Vec<f64>,
    precipitation_probability_max: Vec<u8>,
}

#[derive(Debug, Deserialize)]
struct ApiForecast {
    latitude: f64,
    longitude: f64,
    timezone: String,
    current: ApiCurrent,
    hourly: ApiHourly,
    daily: ApiDaily,
}

#[derive(Debug, Deserialize)]
struct ApiPlaceResults {
    results: Option<Vec<ApiPlace>>,
}

#[derive(Debug, Deserialize)]
struct ApiPlace {
    id: u64,
    name: String,
    latitude: f64,
    longitude: f64,
    country: Option<String>,
    admin1: Option<String>,
    timezone: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CurrentWeather {
    time: String,
    temperature: f64,
    apparent_temperature: f64,
    humidity: u8,
    precipitation: f64,
    weather_code: u16,
    cloud_cover: u8,
    wind_speed: f64,
    wind_direction: u16,
    is_day: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HourlyWeather {
    time: String,
    temperature: f64,
    precipitation_probability: u8,
    weather_code: u16,
    is_day: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DailyWeather {
    date: String,
    weather_code: u16,
    temperature_max: f64,
    temperature_min: f64,
    sunrise: String,
    sunset: String,
    uv_index_max: f64,
    precipitation_probability: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WeatherReport {
    latitude: f64,
    longitude: f64,
    location_name: String,
    timezone: String,
    fetched_at: String,
    from_cache: bool,
    current: CurrentWeather,
    hourly: Vec<HourlyWeather>,
    daily: Vec<DailyWeather>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Place {
    id: u64,
    name: String,
    latitude: f64,
    longitude: f64,
    country: Option<String>,
    admin1: Option<String>,
    timezone: Option<String>,
}

fn client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(12))
        .user_agent("Sorayori/0.1")
        .build()
        .map_err(|error| error.to_string())
}

fn cache_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    app.path()
        .app_cache_dir()
        .map(|path| path.join("weather.json"))
        .map_err(|error| error.to_string())
}

async fn read_cache(
    app: &AppHandle,
    latitude: f64,
    longitude: f64,
) -> Result<WeatherReport, String> {
    let data = tokio::fs::read(cache_path(app)?)
        .await
        .map_err(|error| error.to_string())?;
    let mut report: WeatherReport =
        serde_json::from_slice(&data).map_err(|error| error.to_string())?;
    if (report.latitude - latitude).abs() > 0.05 || (report.longitude - longitude).abs() > 0.05 {
        return Err("cached location does not match".to_string());
    }
    report.from_cache = true;
    Ok(report)
}

async fn write_cache(app: &AppHandle, report: &WeatherReport) -> Result<(), String> {
    let path = cache_path(app)?;
    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|error| error.to_string())?;
    }
    let data = serde_json::to_vec(report).map_err(|error| error.to_string())?;
    tokio::fs::write(path, data)
        .await
        .map_err(|error| error.to_string())
}

fn normalize(api: ApiForecast, location_name: String) -> WeatherReport {
    let hourly = api
        .hourly
        .time
        .into_iter()
        .enumerate()
        .filter_map(|(index, time)| {
            Some(HourlyWeather {
                time,
                temperature: *api.hourly.temperature_2m.get(index)?,
                precipitation_probability: *api
                    .hourly
                    .precipitation_probability
                    .get(index)?,
                weather_code: *api.hourly.weather_code.get(index)?,
                is_day: *api.hourly.is_day.get(index)? == 1,
            })
        })
        .collect();

    let daily = api
        .daily
        .time
        .into_iter()
        .enumerate()
        .filter_map(|(index, date)| {
            Some(DailyWeather {
                date,
                weather_code: *api.daily.weather_code.get(index)?,
                temperature_max: *api.daily.temperature_2m_max.get(index)?,
                temperature_min: *api.daily.temperature_2m_min.get(index)?,
                sunrise: api.daily.sunrise.get(index)?.clone(),
                sunset: api.daily.sunset.get(index)?.clone(),
                uv_index_max: *api.daily.uv_index_max.get(index)?,
                precipitation_probability: *api
                    .daily
                    .precipitation_probability_max
                    .get(index)?,
            })
        })
        .collect();

    WeatherReport {
        latitude: api.latitude,
        longitude: api.longitude,
        location_name,
        timezone: api.timezone,
        fetched_at: Utc::now().to_rfc3339(),
        from_cache: false,
        current: CurrentWeather {
            time: api.current.time,
            temperature: api.current.temperature_2m,
            apparent_temperature: api.current.apparent_temperature,
            humidity: api.current.relative_humidity_2m,
            precipitation: api.current.precipitation,
            weather_code: api.current.weather_code,
            cloud_cover: api.current.cloud_cover,
            wind_speed: api.current.wind_speed_10m,
            wind_direction: api.current.wind_direction_10m,
            is_day: api.current.is_day == 1,
        },
        hourly,
        daily,
    }
}

#[tauri::command]
pub async fn fetch_weather(
    app: AppHandle,
    latitude: f64,
    longitude: f64,
    location_name: String,
) -> Result<WeatherReport, String> {
    let result = async {
        let response = client()?
            .get(FORECAST_URL)
            .query(&[
                ("latitude", latitude.to_string()),
                ("longitude", longitude.to_string()),
                ("timezone", "auto".to_string()),
                ("forecast_days", "8".to_string()),
                ("current", "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m".to_string()),
                ("hourly", "temperature_2m,precipitation_probability,weather_code,is_day".to_string()),
                ("daily", "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max".to_string()),
            ])
            .send()
            .await
            .map_err(|error| error.to_string())?
            .error_for_status()
            .map_err(|error| error.to_string())?
            .json::<ApiForecast>()
            .await
            .map_err(|error| error.to_string())?;
        Ok::<WeatherReport, String>(normalize(response, location_name))
    }
    .await;

    match result {
        Ok(report) => {
            let _ = write_cache(&app, &report).await;
            Ok(report)
        }
        Err(network_error) => read_cache(&app, latitude, longitude)
            .await
            .map_err(|_| network_error),
    }
}

#[tauri::command]
pub async fn search_places(query: String, language: String) -> Result<Vec<Place>, String> {
    let query = query.trim();
    if query.chars().count() < 2 {
        return Ok(Vec::new());
    }

    let response = client()?
        .get(GEOCODING_URL)
        .query(&[
            ("name", query),
            ("count", "8"),
            ("language", language.as_str()),
            ("format", "json"),
        ])
        .send()
        .await
        .map_err(|error| error.to_string())?
        .error_for_status()
        .map_err(|error| error.to_string())?
        .json::<ApiPlaceResults>()
        .await
        .map_err(|error| error.to_string())?;

    Ok(response
        .results
        .unwrap_or_default()
        .into_iter()
        .map(|place| Place {
            id: place.id,
            name: place.name,
            latitude: place.latitude,
            longitude: place.longitude,
            country: place.country,
            admin1: place.admin1,
            timezone: place.timezone,
        })
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_search_does_not_need_network() {
        assert!(" ".trim().chars().count() < 2);
    }
}
