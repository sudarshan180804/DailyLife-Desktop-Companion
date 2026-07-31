import { invoke, convertFileSrc } from "@tauri-apps/api/core";

export interface PathDetails {
  exists: boolean;
  is_file: boolean;
  is_dir: boolean;
  extension: string;
  file_type: String;
}

export interface SmartLaunchResult {
  success: boolean;
  launchedMethod: "executable" | "native_uri" | "browser";
  details: string;
  exeFound: boolean;
  uriSupported: boolean;
}

export class NativeDialogService {
  /**
   * Imports a user-selected wallpaper into app data directory and returns raw filesystem path for persistent storage.
   */
  async importWallpaper(sourcePath: string): Promise<string> {
    if (!sourcePath) return "";
    try {
      const destPath = await invoke<string>("import_wallpaper", { sourcePath });
      console.log(`[NativeDialogService] Imported wallpaper "${sourcePath}" -> Raw Path: "${destPath}"`);
      return destPath;
    } catch (err) {
      console.warn("[NativeDialogService] import_wallpaper fallback to sourcePath:", err);
      return sourcePath;
    }
  }

  /**
   * Converts a raw local disk file path (C:\...) to a webview-safe asset URL immediately before rendering.
   * Bundled Vite assets and already-converted URLs are passed through untouched.
   */
  formatAssetUrl(filePath: string): string {
    if (!filePath || !filePath.trim()) return "";
    const trimmed = filePath.trim();

    // 1. If already a web URL, Tauri asset URL, data URI, or Vite dev /@fs/ path
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("asset:") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("/@fs/")
    ) {
      return trimmed;
    }

    // 2. If it's a bundled Vite static asset without Windows drive letter
    const isWindowsDrivePath = /^[a-zA-Z]:[\\\/]/.test(trimmed);
    if (!isWindowsDrivePath && (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.includes("assets/"))) {
      return trimmed;
    }

    // 3. Convert raw Windows filesystem path (C:\...) to asset URL ONCE before render
    try {
      const assetUrl = convertFileSrc(trimmed);
      return assetUrl;
    } catch (err) {
      console.warn("[NativeDialogService] convertFileSrc fallback for:", trimmed, err);
      return trimmed;
    }
  }

  /**
   * Inspects a path and returns details (existence, extension, detected type).
   */
  async inspectPath(path: string): Promise<PathDetails> {
    if (!path || !path.trim()) {
      return {
        exists: false,
        is_file: false,
        is_dir: false,
        extension: "",
        file_type: "Unknown",
      };
    }

    try {
      return await invoke<PathDetails>("inspect_path", { path: path.trim() });
    } catch (err) {
      const ext = path.split(".").pop()?.toLowerCase() || "";
      return {
        exists: true,
        is_file: true,
        is_dir: false,
        extension: ext,
        file_type: this.detectFileType(path),
      };
    }
  }

  /**
   * Opens Windows native OS File Picker with filters.
   */
  async pickFile(
    title: string = "Select File",
    filterName?: string,
    extensions?: string[]
  ): Promise<string | null> {
    try {
      const selected = await invoke<string | null>("pick_file", {
        title,
        filterName,
        extensions,
      });
      return selected || null;
    } catch (err) {
      console.warn("[NativeDialogService] Tauri invoke pick_file failed:", err);
      const fallback = window.prompt(`Enter file path for ${title}:`);
      return fallback ? fallback.trim() : null;
    }
  }

  /**
   * Opens Windows native OS Folder Picker dialog.
   */
  async pickFolder(title: string = "Select Folder"): Promise<string | null> {
    try {
      const selected = await invoke<string | null>("pick_folder", { title });
      return selected || null;
    } catch (err) {
      console.warn("[NativeDialogService] Tauri invoke pick_folder failed:", err);
      const fallback = window.prompt(`Enter folder path for ${title}:`);
      return fallback ? fallback.trim() : null;
    }
  }

  /**
   * Validates if a file or folder path exists on disk.
   */
  async validatePath(path: string): Promise<boolean> {
    if (!path || !path.trim()) return false;
    try {
      return await invoke<boolean>("validate_path", { path: path.trim() });
    } catch (err) {
      return true;
    }
  }

  /**
   * Validates whether a custom URI protocol scheme (e.g. crunchyroll, spotify) is registered in Windows OS Registry.
   */
  async validateUriScheme(scheme: string): Promise<boolean> {
    if (!scheme || !scheme.trim()) return false;
    try {
      return await invoke<boolean>("validate_uri_scheme", { scheme: scheme.trim() });
    } catch (err) {
      console.warn("[NativeDialogService] validateUriScheme error:", err);
      return false;
    }
  }

  /**
   * Launches any application, executable, script, project file, or associated document.
   */
  async launchAppOrFile(targetPath: string, args?: string): Promise<boolean> {
    if (!targetPath) return false;
    try {
      return await invoke<boolean>("launch_app_or_file", { targetPath, args });
    } catch (err) {
      window.open(targetPath.startsWith("file:") ? targetPath : `file:///${targetPath}`, "_blank");
      return true;
    }
  }

  /**
   * Legacy alias for launchAppOrFile.
   */
  async launchExe(exePath: string, args?: string): Promise<boolean> {
    return this.launchAppOrFile(exePath, args);
  }

  /**
   * Opens Explorer at folder path natively.
   */
  async openFolderExplorer(folderPath: string): Promise<boolean> {
    if (!folderPath) return false;
    try {
      return await invoke<boolean>("open_folder_explorer", { folderPath });
    } catch (err) {
      window.open(folderPath.startsWith("file:") ? folderPath : `file:///${folderPath}`, "_blank");
      return true;
    }
  }

  /**
   * Opens URL in default web browser natively.
   */
  async openWebLink(url: string): Promise<boolean> {
    if (!url) return false;
    try {
      return await invoke<boolean>("open_web_link", { url });
    } catch (err) {
      window.open(url.startsWith("http") ? url : `https://${url}`, "_blank");
      return true;
    }
  }

  /**
   * Smart launcher with intelligent fallback pipeline: Executable -> Registered Native URI -> Web Browser.
   */
  async smartLaunch(
    exePath?: string,
    nativeUri?: string,
    websiteUrl: string = "https://google.com",
    preferredLaunchMethod: "auto" | "app" | "browser" = "auto",
    targetUrlForBrowser?: string
  ): Promise<SmartLaunchResult> {
    const browserTarget = targetUrlForBrowser || websiteUrl;

    let exeFound = false;
    if (exePath && exePath.trim()) {
      exeFound = await this.validatePath(exePath.trim());
    }

    let uriSupported = false;
    if (nativeUri && nativeUri.trim()) {
      const scheme = nativeUri.trim().split(":")[0];
      uriSupported = await this.validateUriScheme(scheme);
    }

    // 1. If explicit Browser mode selected
    if (preferredLaunchMethod === "browser") {
      const ok = await this.openWebLink(browserTarget);
      return {
        success: ok,
        launchedMethod: "browser",
        details: `Opened in Web Browser: ${browserTarget}`,
        exeFound,
        uriSupported,
      };
    }

    // 2. Auto / App Mode Step 1: Check Local Executable
    if (exeFound && exePath) {
      try {
        const ok = await this.launchAppOrFile(exePath.trim());
        if (ok) {
          return {
            success: true,
            launchedMethod: "executable",
            details: `Launched executable app: ${exePath}`,
            exeFound,
            uriSupported,
          };
        }
      } catch (err) {
        console.warn("[NativeDialogService] Executable launch failed, trying fallback:", err);
      }
    }

    // 3. Auto / App Mode Step 2: Check Registered Native URI
    if (uriSupported && nativeUri) {
      try {
        const ok = await this.openWebLink(nativeUri.trim());
        if (ok) {
          return {
            success: true,
            launchedMethod: "native_uri",
            details: `Launched native protocol URI: ${nativeUri}`,
            exeFound,
            uriSupported,
          };
        }
      } catch (err) {
        console.warn("[NativeDialogService] Native URI launch failed, opening web fallback:", err);
      }
    }

    // 4. Step 3: Web Browser Fallback
    const fallbackOk = await this.openWebLink(browserTarget);
    return {
      success: fallbackOk,
      launchedMethod: "browser",
      details: `Fallback to Web Browser: ${browserTarget}`,
      exeFound,
      uriSupported,
    };
  }

  /**
   * Client-side helper to detect file format label from path.
   */
  detectFileType(path: string): string {
    if (!path) return "Unknown";
    const ext = path.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "exe":
        return "EXE Executable";
      case "lnk":
        return "Windows Shortcut";
      case "bat":
      case "cmd":
        return "Batch Script";
      case "ps1":
        return "PowerShell Script";
      case "msi":
        return "MSI Installer";
      case "jar":
        return "Java Executable";
      case "py":
        return "Python Script";
      case "js":
        return "JavaScript File";
      case "sln":
        return "VS Solution";
      case "uproject":
        return "Unreal Project";
      case "unity":
        return "Unity Project";
      case "blend":
        return "Blender Model";
      case "pdf":
        return "PDF Document";
      case "pptx":
      case "ppt":
        return "PowerPoint";
      case "docx":
      case "doc":
        return "Word Document";
      case "xlsx":
      case "xls":
        return "Excel Spreadsheet";
      case "txt":
      case "md":
        return "Text Document";
      case "html":
      case "htm":
      case "url":
        return "Web Document";
      default:
        return ext ? `${ext.toUpperCase()} File` : "File";
    }
  }

  /**
   * Client-side helper to get appropriate icon emoji for file format.
   */
  detectFileIcon(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "exe":
        return "🚀";
      case "lnk":
        return "🔗";
      case "bat":
      case "cmd":
      case "ps1":
        return "⚡";
      case "msi":
        return "📦";
      case "jar":
      case "py":
      case "js":
        return "💻";
      case "sln":
        return "🔮";
      case "uproject":
        return "🎮";
      case "unity":
        return "🕹️";
      case "blend":
        return "🎨";
      case "pdf":
      case "docx":
      case "doc":
        return "📄";
      case "pptx":
      case "ppt":
        return "📊";
      case "xlsx":
      case "xls":
        return "📈";
      case "txt":
      case "md":
        return "📝";
      case "html":
      case "htm":
      case "url":
        return "🌐";
      default:
        return "🚀";
    }
  }
}

export const nativeDialogService = new NativeDialogService();
