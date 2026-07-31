import { useState } from "react";
import { Project, ProjectFileItem } from "../../modules/projects/types";
import { useProjectStore } from "../../modules/projects";
import { nativeDialogService } from "../../services/nativeDialogService";

interface ProjectFilesTabProps {
  project: Project;
}

export function ProjectFilesTab({ project }: ProjectFilesTabProps) {
  const { addProjectFileItem, deleteProjectFileItem, launchApp, openFolder, openLink } = useProjectStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"file" | "folder" | "app" | "url">("url");
  const [pathOrUrl, setPathOrUrl] = useState("");
  const [args, setArgs] = useState("");
  const [icon, setIcon] = useState("🔗");

  const filesList = project.fileItems || [];

  const handleBrowsePath = async () => {
    if (type === "app" || type === "file") {
      const selected = await nativeDialogService.pickFile(
        `Select ${type === "app" ? "Application (.exe)" : "File"}`,
        type === "app" ? "Executables (*.exe)" : "All Files (*.*)",
        type === "app" ? ["exe"] : ["*"]
      );
      if (selected) {
        setPathOrUrl(selected);
        if (!name) {
          const filename = selected.split(/[\/\\]/).pop()?.replace(/\.[^/.]+$/, "") || "Resource";
          setName(filename);
        }
      }
    } else if (type === "folder") {
      const selected = await nativeDialogService.pickFolder("Select Folder");
      if (selected) {
        setPathOrUrl(selected);
        if (!name) {
          const folderName = selected.split(/[\/\\]/).pop() || "Folder";
          setName(folderName);
        }
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pathOrUrl.trim()) return;

    await addProjectFileItem(project.id, {
      name: name.trim(),
      type,
      pathOrUrl: pathOrUrl.trim(),
      args: args.trim() || undefined,
      icon: icon || (type === "app" ? "🚀" : type === "folder" ? "📁" : "🌐"),
    });

    setName("");
    setPathOrUrl("");
    setArgs("");
    setIsAddOpen(false);
  };

  const handleLaunch = async (item: ProjectFileItem) => {
    if (item.type === "app") {
      await launchApp(item.pathOrUrl, item.args);
    } else if (item.type === "folder") {
      await openFolder(item.pathOrUrl);
    } else {
      await openLink(item.pathOrUrl);
    }
  };

  return (
    <div className="project-files-tab-wrapper">
      <div className="card-header-between">
        <h3 className="card-heading">Files, Folders, Apps & Web Resources</h3>
        <button className="new-task-action-btn" onClick={() => setIsAddOpen(true)}>
          + Add Resource Item
        </button>
      </div>

      <div className="quick-access-grid">
        {filesList.length === 0 ? (
          <div className="empty-quick-access-box" onClick={() => setIsAddOpen(true)}>
            <span className="config-icon">📁</span>
            <span className="empty-qa-title">No Resources Added Yet</span>
            <span className="empty-qa-sub">Click here to add native files, folders, or web links</span>
          </div>
        ) : (
          filesList.map((item) => (
            <div key={item.id} className="quick-tile" onClick={() => handleLaunch(item)}>
              <div className="tile-icon">{item.icon || (item.type === "app" ? "🚀" : item.type === "folder" ? "📁" : "🌐")}</div>
              <div className="tile-labels">
                <span className="tile-title">{item.name}</span>
                <span className="tile-sub">{item.pathOrUrl}</span>
              </div>
              <button
                className="config-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProjectFileItem(project.id, item.id);
                }}
                title="Delete Item"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {isAddOpen && (
        <div className="modal-overlay-backdrop">
          <div className="error-boundary-card new-task-modal-card">
            <h3 className="error-title">+ Add Project Resource / Link</h3>

            <form onSubmit={handleCreate} className="modal-form-body">
              <div className="form-group">
                <label className="form-lbl">Name</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="e.g. GitHub Repository or Unreal Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-lbl">Resource Type</label>
                  <select
                    className="settings-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="url">Web URL</option>
                    <option value="folder">Local Folder</option>
                    <option value="app">Executable Application</option>
                    <option value="file">File Path</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-lbl">Icon Symbol</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-lbl">Path or Web URL</label>
                <div className="browse-input-group">
                  <input
                    type="text"
                    className="settings-input flex-1"
                    placeholder={type === "url" ? "https://..." : "Selected path..."}
                    value={pathOrUrl}
                    onChange={(e) => setPathOrUrl(e.target.value)}
                    required
                  />
                  {type !== "url" && (
                    <button type="button" className="add-launcher-btn" onClick={handleBrowsePath}>
                      🔍 Browse
                    </button>
                  )}
                </div>
              </div>

              {type === "app" && (
                <div className="form-group">
                  <label className="form-lbl">Arguments (Optional)</label>
                  <input
                    type="text"
                    className="settings-input"
                    placeholder="Command line args..."
                    value={args}
                    onChange={(e) => setArgs(e.target.value)}
                  />
                </div>
              )}

              <div className="settings-action-row">
                <button type="button" className="config-delete-btn" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-settings-btn">
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
