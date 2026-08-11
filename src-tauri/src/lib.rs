use tauri::Manager;
use std::path::PathBuf;

#[tauri::command]
fn load_cases(app: tauri::AppHandle) -> Result<String, String> {
    let resource_path = resolve_resource_path(&app, "data/cases.json")?;
    std::fs::read_to_string(resource_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_roleplay_cases(app: tauri::AppHandle) -> Result<String, String> {
    let resource_path = resolve_resource_path(&app, "data/roleplayCases.json")?;
    std::fs::read_to_string(resource_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_stats(app: tauri::AppHandle, stats: String) -> Result<(), String> {
    let app_data = app_data_dir(&app)?;
    let path = app_data.join("stats.json");
    std::fs::write(path, stats).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_stats(app: tauri::AppHandle) -> Result<String, String> {
    let app_data = app_data_dir(&app)?;
    let path = app_data.join("stats.json");
    if path.exists() {
        std::fs::read_to_string(path).map_err(|e| e.to_string())
    } else {
        Ok(String::new())
    }
}

#[tauri::command]
fn save_daily_state(app: tauri::AppHandle, state: String) -> Result<(), String> {
    let app_data = app_data_dir(&app)?;
    let path = app_data.join("daily_state.json");
    std::fs::write(path, state).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_daily_state(app: tauri::AppHandle) -> Result<String, String> {
    let app_data = app_data_dir(&app)?;
    let path = app_data.join("daily_state.json");
    if path.exists() {
        std::fs::read_to_string(path).map_err(|e| e.to_string())
    } else {
        Ok(String::new())
    }
}

fn app_data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map_err(|e| e.to_string())
}

fn resolve_resource_path(app: &tauri::AppHandle, relative: &str) -> Result<PathBuf, String> {
    let resource_dir = app.path().resource_dir().map_err(|e| e.to_string())?;
    Ok(resource_dir.join(relative))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            load_cases,
            load_roleplay_cases,
            save_stats,
            load_stats,
            save_daily_state,
            load_daily_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
