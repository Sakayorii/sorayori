mod weather;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_geolocation::init())
        .invoke_handler(tauri::generate_handler![
            weather::fetch_weather,
            weather::search_places,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Sorayori");
}
