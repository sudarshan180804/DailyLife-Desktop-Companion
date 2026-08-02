import { useState, useEffect } from "react";
import { WorkoutDay, WeekDayName } from "../../modules/gym/types";

interface GymDayEditorModalProps {
  isOpen: boolean;
  initialData?: WorkoutDay | null;
  onClose: () => void;
  onSave: (data: {
    dayOfWeek: WeekDayName;
    title: string;
    enabled: boolean;
    isRestDay: boolean;
    description: string;
    icon: string;
  }) => void;
}

const WEEKDAYS: WeekDayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ICONS = ["🏋️", "🛡️", "🌙", "⚡", "💪", "🎯", "🔥", "🌿", "🏆", "🧘", "⚔️", "🥇"];

export function GymDayEditorModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: GymDayEditorModalProps) {
  const [dayOfWeek, setDayOfWeek] = useState<WeekDayName>("Monday");
  const [title, setTitle] = useState<string>("");
  const [enabled, setEnabled] = useState<boolean>(true);
  const [isRestDay, setIsRestDay] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [icon, setIcon] = useState<string>("🏋️");

  useEffect(() => {
    if (initialData) {
      setDayOfWeek(initialData.dayOfWeek || "Monday");
      setTitle(initialData.title || "");
      setEnabled(initialData.enabled !== undefined ? initialData.enabled : true);
      setIsRestDay(!!initialData.isRestDay);
      setDescription(initialData.description || "");
      setIcon(initialData.icon || (initialData.isRestDay ? "🌙" : "🏋️"));
    } else {
      setDayOfWeek("Monday");
      setTitle("");
      setEnabled(true);
      setIsRestDay(false);
      setDescription("");
      setIcon("🏋️");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      dayOfWeek,
      title: title.trim(),
      enabled,
      isRestDay,
      description: description.trim(),
      icon,
    });
    onClose();
  };

  return (
    <div className="gym-modal-backdrop" onClick={onClose}>
      <div className="gym-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="gym-modal-header">
          <h3>{initialData ? "Edit Workout Day" : "Create Workout Day"}</h3>
          <button className="gym-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="gym-modal-form">
          <div className="form-group">
            <label>Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as WeekDayName)}
              className="gym-input"
            >
              {WEEKDAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Workout Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Push Day, Chest + Triceps, Rest Day"
              className="gym-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                Enable this Day
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isRestDay}
                  onChange={(e) => {
                    setIsRestDay(e.target.checked);
                    if (e.target.checked) setIcon("🌙");
                  }}
                />
                Rest Day
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Icon / Emblem</label>
            <div className="icon-picker-grid">
              {ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  className={`icon-choice-btn ${icon === ic ? "selected" : ""}`}
                  onClick={() => setIcon(ic)}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description / Focus (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Focus on chest upper head and tricep extension"
              className="gym-input"
            />
          </div>

          <div className="gym-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {initialData ? "Save Changes" : "Create Day"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
