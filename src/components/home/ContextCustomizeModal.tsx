import { useState } from "react";
import {
  contextEngine,
  ModuleWidgetConfig,
  TimeOfDay,
  WeekendBehavior,
  WidgetSize,
} from "../../modules/context";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ContextCustomizeModal({ isOpen, onClose, onSaved }: Props) {
  const [configs, setConfigs] = useState<ModuleWidgetConfig[]>(() =>
    contextEngine.getWidgetConfigs()
  );

  if (!isOpen) return null;

  const handleToggleShow = (id: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, showOnHome: !c.showOnHome } : c))
    );
  };

  const handleTimeBlockToggle = (id: string, timeBlock: TimeOfDay) => {
    setConfigs((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const exists = c.preferredTimeBlocks.includes(timeBlock);
        const nextBlocks = exists
          ? c.preferredTimeBlocks.filter((tb) => tb !== timeBlock)
          : [...c.preferredTimeBlocks, timeBlock];
        return { ...c, preferredTimeBlocks: nextBlocks };
      })
    );
  };

  const handleWeekendBehaviorChange = (id: string, behavior: WeekendBehavior) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, weekendBehavior: behavior } : c))
    );
  };

  const handlePriorityChange = (id: string, priority: number) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, priority } : c))
    );
  };

  const handleSizeChange = (id: string, widgetSize: WidgetSize) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, widgetSize } : c))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await contextEngine.saveAllConfigs(configs);
    onSaved();
    onClose();
  };

  return (
    <div className="music-modal-backdrop" onClick={onClose}>
      <div className="music-modal-box large-modal-box context-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="quick-cap-hdr-row">
            <span className="quick-cap-bolt">⚙️</span>
            <h3 className="modal-title">CONTEXT ENGINE & HOME WIDGETS CONFIGURATOR</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          <p className="modal-desc-sub">
            Customize which module widgets appear based on time of day, day of week, and priority score.
          </p>

          <div className="context-configs-list">
            {configs.map((c) => (
              <div key={c.id} className="context-widget-config-card">
                <div className="config-card-header">
                  <div className="config-title-group">
                    <input
                      type="checkbox"
                      checked={c.showOnHome}
                      onChange={() => handleToggleShow(c.id)}
                      className="config-toggle-checkbox"
                    />
                    <span className="config-widget-name">{c.title}</span>
                    <span className="config-module-badge">{c.module.toUpperCase()}</span>
                  </div>

                  <div className="config-priority-input">
                    <label className="mini-lbl">Priority Score:</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={c.priority}
                      onChange={(e) =>
                        handlePriorityChange(c.id, parseInt(e.target.value, 10) || 50)
                      }
                      className="priority-num-input"
                    />
                  </div>
                </div>

                {c.showOnHome && (
                  <div className="config-card-body">
                    {/* Time Blocks */}
                    <div className="config-field-group">
                      <label className="config-field-lbl">Preferred Time Blocks:</label>
                      <div className="time-blocks-row">
                        {(["morning", "afternoon", "evening", "night"] as TimeOfDay[]).map(
                          (tb) => (
                            <button
                              type="button"
                              key={tb}
                              className={`tb-chip ${
                                c.preferredTimeBlocks.includes(tb) ? "active" : ""
                              }`}
                              onClick={() => handleTimeBlockToggle(c.id, tb)}
                            >
                              {tb === "morning"
                                ? "🌅 Morning"
                                : tb === "afternoon"
                                ? "☀️ Afternoon"
                                : tb === "evening"
                                ? "🌇 Evening"
                                : "🌙 Night"}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="config-form-2col margin-top-6">
                      {/* Weekend Behavior */}
                      <div className="config-field-group">
                        <label className="config-field-lbl">Weekend Schedule:</label>
                        <select
                          className="form-select mini-select"
                          value={c.weekendBehavior}
                          onChange={(e) =>
                            handleWeekendBehaviorChange(
                              c.id,
                              e.target.value as WeekendBehavior
                            )
                          }
                        >
                          <option value="always">Every Day (Weekdays & Weekends)</option>
                          <option value="only_weekday">Weekdays Only (Mon-Fri)</option>
                          <option value="only_weekend">Weekends Only (Sat-Sun)</option>
                          <option value="never">Never Show</option>
                        </select>
                      </div>

                      {/* Widget Size */}
                      <div className="config-field-group">
                        <label className="config-field-lbl">Widget Layout Size:</label>
                        <select
                          className="form-select mini-select"
                          value={c.widgetSize}
                          onChange={(e) =>
                            handleSizeChange(c.id, e.target.value as WidgetSize)
                          }
                        >
                          <option value="small">Small Card</option>
                          <option value="medium">Medium Card</option>
                          <option value="large">Large Card</option>
                          <option value="full">Full Width</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="modal-actions margin-top-12">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Context Rules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
