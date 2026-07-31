import { useState, useEffect } from "react";
import {
  Project,
  Priority,
  ConfiguredApp,
  ConfiguredFolder,
  ConfiguredLink,
} from "../../modules/projects/types";
import { useProjectStore } from "../../modules/projects";
import { nativeDialogService } from "../../services/nativeDialogService";

interface ProjectSettingsPanelProps {
  project: Project;
  onSaved?: () => void;
}

export function ProjectSettingsPanel({ project, onSaved }: ProjectSettingsPanelProps) {
  const { updateProject } = useProjectStore();

  // General Metadata State
  const [title, setTitle] = useState(project.title);
  const [subtitle, setSubtitle] = useState(project.subtitle || "");
  const [description, setDescription] = useState(project.description || "");
  const [currentFocus, setCurrentFocus] = useState(project.currentFocus || "");
  const [category, setCategory] = useState(project.category || "Development");
  const [priority, setPriority] = useState<Priority>(project.priority || "Medium");
  const [shieldType, setShieldType] = useState(project.shieldType || "caduceus");
  const [shieldColor, setShieldColor] = useState(project.shieldColor || "blue");

  // Configured Launchers State
  const [apps, setApps] = useState<ConfiguredApp[]>(project.apps || []);
  const [folders, setFolders] = useState<ConfiguredFolder[]>(project.folders || []);
  const [links, setLinks] = useState<ConfiguredLink[]>(project.links || []);

  // Validation state dictionary (path -> boolean)
  const [validPaths, setValidPaths] = useState<Record<string, boolean>>({});

  // Form input states
  const [newAppName, setNewAppName] = useState("");
  const [newAppExe, setNewAppExe] = useState("");
  const [newAppArgs, setNewAppArgs] = useState("");

  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderPath, setNewFolderPath] = useState("");

  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // Validate paths on load or when apps/folders change
  useEffect(() => {
    const validateAll = async () => {
      const results: Record<string, boolean> = {};
      for (const app of apps) {
        if (app.exePath) {
          results[app.exePath] = await nativeDialogService.validatePath(app.exePath);
        }
      }
      for (const folder of folders) {
        if (folder.path) {
          results[folder.path] = await nativeDialogService.validatePath(folder.path);
        }
      }
      setValidPaths(results);
    };
    validateAll();
  }, [apps, folders]);

  // Browse Native OS File Picker (.exe, .lnk, .bat, .ps1, .sln, .uproject, .pdf, .pptx, etc.)
  const handleBrowseAppExe = async () => {
    const path = await nativeDialogService.pickFile(
      "Select Executable, Script, or Project Entry File"
    );
    if (path) {
      setNewAppExe(path);
      if (!newAppName) {
        // Derive clean name from filename
        const filename = path.split(/[\/\\]/).pop() || "Application";
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        setNewAppName(nameWithoutExt);
      }
    }
  };

  // Browse Native OS Folder Picker
  const handleBrowseFolder = async (title: string, callback: (path: string) => void) => {
    const path = await nativeDialogService.pickFolder(title);
    if (path) {
      callback(path);
    }
  };

  // Preset Add Buttons
  const handleAddPresetFolder = async (presetName: string, iconSymbol: string) => {
    const path = await nativeDialogService.pickFolder(`Select ${presetName}`);
    if (path) {
      const newFolder: ConfiguredFolder = {
        id: `folder-${Date.now()}`,
        name: presetName,
        path,
        icon: iconSymbol,
      };
      const updated = [...folders, newFolder];
      setFolders(updated);
      await updateProject(project.id, { folders: updated });
    }
  };

  // Save General Project Settings
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProject(project.id, {
      title,
      subtitle,
      description,
      currentFocus,
      category,
      priority,
      shieldType,
      shieldColor,
      apps,
      folders,
      links,
    });
    onSaved?.();
  };

  // Add Application or Project File Entry
  const handleAddApp = async () => {
    if (!newAppName.trim() || !newAppExe.trim()) return;
    const smartIcon = nativeDialogService.detectFileIcon(newAppExe.trim());
    const newApp: ConfiguredApp = {
      id: `app-${Date.now()}`,
      name: newAppName.trim(),
      exePath: newAppExe.trim(),
      args: newAppArgs.trim() || undefined,
      icon: smartIcon,
    };
    const updated = [...apps, newApp];
    setApps(updated);
    await updateProject(project.id, { apps: updated });
    setNewAppName("");
    setNewAppExe("");
    setNewAppArgs("");
  };

  const handleDeleteApp = async (appId: string) => {
    const updated = apps.filter((a) => a.id !== appId);
    setApps(updated);
    await updateProject(project.id, { apps: updated });
  };

  // Add Folder
  const handleAddFolder = async () => {
    if (!newFolderName.trim() || !newFolderPath.trim()) return;
    const newFolder: ConfiguredFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      path: newFolderPath.trim(),
      icon: "📁",
    };
    const updated = [...folders, newFolder];
    setFolders(updated);
    await updateProject(project.id, { folders: updated });
    setNewFolderName("");
    setNewFolderPath("");
  };

  const handleDeleteFolder = async (folderId: string) => {
    const updated = folders.filter((f) => f.id !== folderId);
    setFolders(updated);
    await updateProject(project.id, { folders: updated });
  };

  // Add Link
  const handleAddLink = async () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;
    const newLink: ConfiguredLink = {
      id: `link-${Date.now()}`,
      name: newLinkName.trim(),
      url: newLinkUrl.trim(),
      icon: "🌐",
    };
    const updated = [...links, newLink];
    setLinks(updated);
    await updateProject(project.id, { links: updated });
    setNewLinkName("");
    setNewLinkUrl("");
  };

  const handleDeleteLink = async (linkId: string) => {
    const updated = links.filter((l) => l.id !== linkId);
    setLinks(updated);
    await updateProject(project.id, { links: updated });
  };

  return (
    <div className="project-settings-panel">
      {/* Quick Access Presets Bar */}
      <div className="detail-card settings-section-card">
        <h3 className="card-heading">⚡ Native Quick Presets</h3>
        <p className="section-subtext">Click any preset below to pick a native file, script, project entry or folder.</p>

        <div className="preset-buttons-row">
          <button
            type="button"
            className="add-launcher-btn"
            onClick={async () => {
              const path = await nativeDialogService.pickFile("Select Application or Executable");
              if (path) {
                const name = path.split(/[\/\\]/).pop()?.replace(/\.[^/.]+$/, "") || "Application";
                const icon = nativeDialogService.detectFileIcon(path);
                const updated = [...apps, { id: `app-${Date.now()}`, name, exePath: path, icon }];
                setApps(updated);
                await updateProject(project.id, { apps: updated });
              }
            }}
          >
            🎮 Select Application / Script
          </button>

          <button
            type="button"
            className="add-launcher-btn"
            onClick={() => handleAddPresetFolder("Project Folder", "📁")}
          >
            📁 Select Project Folder
          </button>

          <button
            type="button"
            className="add-launcher-btn"
            onClick={() => handleAddPresetFolder("References Folder", "📚")}
          >
            📚 Select References Folder
          </button>

          <button
            type="button"
            className="add-launcher-btn"
            onClick={() => handleAddPresetFolder("Documentation Folder", "📄")}
          >
            📄 Select Documentation Folder
          </button>

          <button
            type="button"
            className="add-launcher-btn"
            onClick={() => handleAddPresetFolder("Presentation Folder", "📊")}
          >
            📊 Select Presentation Folder
          </button>
        </div>
      </div>

      {/* Section 1: General Project Information */}
      <form onSubmit={handleSaveGeneral} className="detail-card settings-section-card">
        <h3 className="card-heading">⚙ General Project Settings</h3>

        <div className="form-grid-2col">
          <div className="form-group">
            <label className="form-lbl">Project Title</label>
            <input
              type="text"
              className="settings-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-lbl">Subtitle</label>
            <input
              type="text"
              className="settings-input"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="form-group span-2">
            <label className="form-lbl">Project Description</label>
            <textarea
              className="settings-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group span-2">
            <label className="form-lbl">Current Focus</label>
            <input
              type="text"
              className="settings-input"
              value={currentFocus}
              onChange={(e) => setCurrentFocus(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-lbl">Category</label>
            <input
              type="text"
              className="settings-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-lbl">Priority Level</label>
            <select
              className="settings-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-lbl">Guild Shield Symbol</label>
            <select
              className="settings-select"
              value={shieldType}
              onChange={(e) => setShieldType(e.target.value as any)}
            >
              <option value="caduceus">Caduceus Staff</option>
              <option value="flame">Phoenix Flame</option>
              <option value="axes">Crossed Battle Axes</option>
              <option value="book">Spellbook</option>
              <option value="shield">Knight Shield</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-lbl">Guild Shield Aura</label>
            <select
              className="settings-select"
              value={shieldColor}
              onChange={(e) => setShieldColor(e.target.value as any)}
            >
              <option value="blue">Azure Blue</option>
              <option value="purple">Royal Purple</option>
              <option value="green">Emerald Green</option>
              <option value="bronze">Ancient Bronze</option>
            </select>
          </div>
        </div>

        <div className="settings-action-row">
          <button type="submit" className="save-settings-btn">
            💾 Save General Settings
          </button>
        </div>
      </form>

      {/* Section 2: Configured Applications & Project Entries */}
      <div className="detail-card settings-section-card">
        <h3 className="card-heading">🚀 Configured Applications & Entry Files ({apps.length})</h3>
        <p className="section-subtext">Executable files (.exe, .lnk, .bat, .ps1, .msi), solution files (.sln, .uproject, .unity), and project documents.</p>

        <div className="launcher-items-list">
          {apps.map((app) => {
            const isValid = validPaths[app.exePath] ?? true;
            const fileTypeLabel = nativeDialogService.detectFileType(app.exePath);
            const iconSymbol = app.icon || nativeDialogService.detectFileIcon(app.exePath);

            return (
              <div key={app.id} className="launcher-config-row">
                <span className="config-icon">{iconSymbol}</span>
                <div className="config-info">
                  <div className="config-title-row">
                    <span className="config-name">{app.name}</span>
                    <span className="path-badge type-badge">{fileTypeLabel}</span>
                    {isValid ? (
                      <span className="path-badge valid-badge">✓ Valid Path</span>
                    ) : (
                      <span className="path-badge invalid-badge">⚠️ Missing Target</span>
                    )}
                  </div>
                  <span className="config-path">{app.exePath} {app.args ? `(${app.args})` : ""}</span>
                </div>
                <button className="config-delete-btn" onClick={() => handleDeleteApp(app.id)} title="Delete Application">
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Application Form */}
        <div className="add-launcher-form">
          <input
            type="text"
            className="settings-input flex-1"
            placeholder="Entry Name (e.g., Unreal Project, VS Solution)"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
          />

          <div className="browse-input-group flex-2">
            <input
              type="text"
              className="settings-input flex-1"
              placeholder="Selected File Path..."
              value={newAppExe}
              readOnly
            />
            <button type="button" className="add-launcher-btn" onClick={handleBrowseAppExe}>
              🔍 Browse File
            </button>
          </div>

          <input
            type="text"
            className="settings-input flex-1"
            placeholder="Args (Optional)"
            value={newAppArgs}
            onChange={(e) => setNewAppArgs(e.target.value)}
          />

          <button className="add-launcher-btn" onClick={handleAddApp}>
            + Add Entry
          </button>
        </div>
      </div>

      {/* Section 3: Configured Directory Folders */}
      <div className="detail-card settings-section-card">
        <h3 className="card-heading">📁 Configured Directory Folders ({folders.length})</h3>
        <p className="section-subtext">Local folder paths chosen through Windows folder pickers.</p>

        <div className="launcher-items-list">
          {folders.map((folder) => {
            const isValid = validPaths[folder.path] ?? true;

            return (
              <div key={folder.id} className="launcher-config-row">
                <span className="config-icon">{folder.icon || "📁"}</span>
                <div className="config-info">
                  <div className="config-title-row">
                    <span className="config-name">{folder.name}</span>
                    {isValid ? (
                      <span className="path-badge valid-badge">✓ Valid Path</span>
                    ) : (
                      <span className="path-badge invalid-badge">⚠️ Path Missing</span>
                    )}
                  </div>
                  <span className="config-path">{folder.path}</span>
                </div>
                <button className="config-delete-btn" onClick={() => handleDeleteFolder(folder.id)} title="Delete Folder">
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Folder Form */}
        <div className="add-launcher-form">
          <input
            type="text"
            className="settings-input flex-1"
            placeholder="Folder Name (e.g., Assets Directory)"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />

          <div className="browse-input-group flex-2">
            <input
              type="text"
              className="settings-input flex-1"
              placeholder="Selected Folder Path..."
              value={newFolderPath}
              readOnly
            />
            <button
              type="button"
              className="add-launcher-btn"
              onClick={() => handleBrowseFolder("Select Directory Folder", (path) => setNewFolderPath(path))}
            >
              📁 Browse Folder
            </button>
          </div>

          <button className="add-launcher-btn" onClick={handleAddFolder}>
            + Add Folder
          </button>
        </div>
      </div>

      {/* Section 4: Configured Web Links */}
      <div className="detail-card settings-section-card">
        <h3 className="card-heading">🌐 Configured Links & Web Resources ({links.length})</h3>
        <p className="section-subtext">Configure web URLs, repositories, or documentation links.</p>

        <div className="launcher-items-list">
          {links.map((link) => (
            <div key={link.id} className="launcher-config-row">
              <span className="config-icon">{link.icon || "🌐"}</span>
              <div className="config-info">
                <span className="config-name">{link.name}</span>
                <span className="config-path">{link.url}</span>
              </div>
              <button className="config-delete-btn" onClick={() => handleDeleteLink(link.id)} title="Delete Link">
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add Link Form */}
        <div className="add-launcher-form">
          <input
            type="text"
            className="settings-input flex-1"
            placeholder="Link Name (e.g., GitHub Repo)"
            value={newLinkName}
            onChange={(e) => setNewLinkName(e.target.value)}
          />
          <input
            type="text"
            className="settings-input flex-2"
            placeholder="URL (e.g., https://github.com/myrepo)"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
          />
          <button className="add-launcher-btn" onClick={handleAddLink}>
            + Add Link
          </button>
        </div>
      </div>
    </div>
  );
}
