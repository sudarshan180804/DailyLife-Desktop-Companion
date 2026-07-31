use std::path::Path;
use std::process::Command;
use tauri::Manager;

#[derive(serde::Serialize)]
struct PathDetails {
    exists: bool,
    is_file: bool,
    is_dir: bool,
    extension: String,
    file_type: String,
}

fn detect_type(extension: &str) -> String {
    match extension.to_lowercase().as_str() {
        "exe" => "EXE Executable".to_string(),
        "lnk" => "Windows Shortcut".to_string(),
        "bat" | "cmd" => "Batch Script".to_string(),
        "ps1" => "PowerShell Script".to_string(),
        "msi" => "MSI Installer".to_string(),
        "jar" => "Java Executable".to_string(),
        "py" => "Python Script".to_string(),
        "js" => "JavaScript File".to_string(),
        "sln" => "VS Solution".to_string(),
        "uproject" => "Unreal Project".to_string(),
        "unity" => "Unity Project".to_string(),
        "blend" => "Blender Model".to_string(),
        "pdf" => "PDF Document".to_string(),
        "pptx" | "ppt" => "PowerPoint".to_string(),
        "docx" | "doc" => "Word Document".to_string(),
        "xlsx" | "xls" => "Excel Spreadsheet".to_string(),
        "txt" | "md" => "Text Document".to_string(),
        "html" | "htm" | "url" => "Web Link".to_string(),
        other => {
            if other.is_empty() {
                "File".to_string()
            } else {
                format!("{} File", other.to_uppercase())
            }
        }
    }
}

#[tauri::command]
fn inspect_path(path: String) -> PathDetails {
    let p = Path::new(&path);
    let exists = p.exists();
    let is_file = p.is_file();
    let is_dir = p.is_dir();
    let ext = p.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase();
    let file_type = if is_dir {
        "Directory Folder".to_string()
    } else {
        detect_type(&ext)
    };

    PathDetails {
        exists,
        is_file,
        is_dir,
        extension: ext,
        file_type,
    }
}

#[tauri::command]
fn pick_file(title: Option<String>, filter_name: Option<String>, extensions: Option<Vec<String>>) -> Option<String> {
    let mut dialog = rfd::FileDialog::new();
    if let Some(t) = title {
        dialog = dialog.set_title(&t);
    }

    if let (Some(name), Some(exts)) = (filter_name, extensions) {
        let str_exts: Vec<&str> = exts.iter().map(|s| s.as_str()).collect();
        dialog = dialog.add_filter(&name, &str_exts);
        dialog = dialog.add_filter("All Files (*.*)", &["*"]);
    } else {
        dialog = dialog
            .add_filter(
                "Executables & Scripts (*.exe, *.lnk, *.bat, *.cmd, *.ps1, *.msi, *.jar, *.py)",
                &["exe", "lnk", "bat", "cmd", "ps1", "msi", "jar", "py", "js"]
            )
            .add_filter(
                "Projects & Documents (*.sln, *.uproject, *.unity, *.blend, *.pdf, *.pptx, *.docx, *.xlsx)",
                &["sln", "uproject", "unity", "blend", "pdf", "pptx", "docx", "xlsx", "txt", "md", "html", "url"]
            )
            .add_filter("All Files (*.*)", &["*"]);
    }
    dialog.pick_file().map(|p| p.to_string_lossy().to_string())
}

#[tauri::command]
fn pick_folder(title: Option<String>) -> Option<String> {
    let mut dialog = rfd::FileDialog::new();
    if let Some(t) = title {
        dialog = dialog.set_title(&t);
    }
    dialog.pick_folder().map(|p| p.to_string_lossy().to_string())
}

#[tauri::command]
fn validate_path(path: String) -> bool {
    if path.trim().is_empty() {
        return false;
    }
    Path::new(&path).exists()
}

#[tauri::command]
fn validate_uri_scheme(scheme: String) -> bool {
    let clean_scheme = scheme
        .trim()
        .trim_start_matches("http://")
        .trim_start_matches("https://")
        .trim_end_matches("://")
        .trim_end_matches(':');

    if clean_scheme.is_empty() {
        return false;
    }

    if clean_scheme.starts_with("http") || clean_scheme.starts_with("https") {
        return true;
    }

    #[cfg(target_os = "windows")]
    {
        // Query HKCR\<clean_scheme>
        if let Ok(out) = Command::new("reg")
            .args(["query", &format!("HKCR\\{}", clean_scheme)])
            .output()
        {
            if out.status.success() {
                return true;
            }
        }

        // Query HKCU\Software\Classes\<clean_scheme>
        if let Ok(out) = Command::new("reg")
            .args(["query", &format!("HKCU\\Software\\Classes\\{}", clean_scheme)])
            .output()
        {
            if out.status.success() {
                return true;
            }
        }

        return false;
    }

    #[cfg(not(target_os = "windows"))]
    {
        true
    }
}

#[tauri::command]
fn import_wallpaper(app_handle: tauri::AppHandle, source_path: String) -> Result<String, String> {
    use std::fs;

    let src = Path::new(&source_path);
    if !src.exists() {
        return Err(format!("Source image file does not exist: {}", source_path));
    }

    let ext = src.extension().and_then(|e| e.to_str()).unwrap_or("png");
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let filename = format!("wallpaper_{}.{}", timestamp, ext);

    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let wallpapers_dir = app_dir.join("wallpapers");
    fs::create_dir_all(&wallpapers_dir).map_err(|e| e.to_string())?;

    let dest_path = wallpapers_dir.join(&filename);
    fs::copy(src, &dest_path).map_err(|e| e.to_string())?;

    Ok(dest_path.to_string_lossy().to_string())
}

#[tauri::command]
fn launch_app_or_file(target_path: String, args: Option<String>) -> Result<bool, String> {
    if target_path.trim().is_empty() {
        return Err("Target path is empty".to_string());
    }

    let path = Path::new(&target_path);
    if !path.exists() {
        return Err(format!("File or target does not exist: {}", target_path));
    }

    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase();

    #[cfg(target_os = "windows")]
    {
        match ext.as_str() {
            "exe" => {
                let mut cmd = Command::new(&target_path);
                if let Some(arg_str) = &args {
                    if !arg_str.trim().is_empty() {
                        cmd.args(arg_str.split_whitespace());
                    }
                }
                cmd.spawn().map_err(|e| e.to_string())?;
            }
            "bat" | "cmd" => {
                let mut cmd = Command::new("cmd");
                cmd.args(["/C", &target_path]);
                if let Some(arg_str) = &args {
                    if !arg_str.trim().is_empty() {
                        cmd.args(arg_str.split_whitespace());
                    }
                }
                cmd.spawn().map_err(|e| e.to_string())?;
            }
            "ps1" => {
                let mut cmd = Command::new("powershell");
                cmd.args(["-ExecutionPolicy", "Bypass", "-File", &target_path]);
                if let Some(arg_str) = &args {
                    if !arg_str.trim().is_empty() {
                        cmd.args(arg_str.split_whitespace());
                    }
                }
                cmd.spawn().map_err(|e| e.to_string())?;
            }
            "msi" => {
                let mut cmd = Command::new("msiexec");
                cmd.args(["/i", &target_path]);
                if let Some(arg_str) = &args {
                    if !arg_str.trim().is_empty() {
                        cmd.args(arg_str.split_whitespace());
                    }
                }
                cmd.spawn().map_err(|e| e.to_string())?;
            }
            _ => {
                let mut cmd = Command::new("cmd");
                cmd.args(["/C", "start", "", &target_path]);
                if let Some(arg_str) = &args {
                    if !arg_str.trim().is_empty() {
                        cmd.args(arg_str.split_whitespace());
                    }
                }
                cmd.spawn().map_err(|e| e.to_string())?;
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new("open")
            .arg(&target_path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(true)
}

#[tauri::command]
fn open_folder_explorer(folder_path: String) -> Result<bool, String> {
    if folder_path.trim().is_empty() {
        return Err("Folder path is empty".to_string());
    }
    if !Path::new(&folder_path).exists() {
        return Err(format!("Directory path does not exist: {}", folder_path));
    }

    Command::new("explorer")
        .arg(&folder_path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(true)
}

#[tauri::command]
fn open_web_link(url: String) -> Result<bool, String> {
    if url.trim().is_empty() {
        return Err("URL is empty".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            inspect_path,
            pick_file,
            pick_folder,
            validate_path,
            validate_uri_scheme,
            import_wallpaper,
            launch_app_or_file,
            open_folder_explorer,
            open_web_link
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
