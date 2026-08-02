import { useState, useEffect } from "react";
import { Exercise, ExerciseSet, MuscleTarget } from "../../modules/gym/types";
import { nativeDialogService } from "../../services/nativeDialogService";

interface GymExerciseEditorModalProps {
  isOpen: boolean;
  initialData?: Exercise | null;
  workoutDayId: string;
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: string;
    targetedMuscles: MuscleTarget[];
    instructions: string[];
    tips: string[];
    setsList: ExerciseSet[];
    restTimeSeconds: number;
    xpReward: number;
    imageUrl?: string;
    videoUrl?: string;
    equipment: string;
  }) => void;
}

export function GymExerciseEditorModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: GymExerciseEditorModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [targetedMuscles, setTargetedMuscles] = useState<MuscleTarget[]>([]);
  const [newMuscleName, setNewMuscleName] = useState("");
  const [newMuscleColor, setNewMuscleColor] = useState("#ef4444");
  const [instructionsText, setInstructionsText] = useState("");
  const [tipsText, setTipsText] = useState("");
  const [setsList, setSetsList] = useState<ExerciseSet[]>([]);
  const [restTimeSeconds, setRestTimeSeconds] = useState<number>(90);
  const [xpReward, setXpReward] = useState<number>(20);
  const [equipment, setEquipment] = useState("Gym Equipment");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [mediaError, setMediaError] = useState<{ image?: boolean; video?: boolean }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCategory(initialData.category || "General");
      setTargetedMuscles(initialData.targetedMuscles ? [...initialData.targetedMuscles] : []);
      setInstructionsText((initialData.instructions || []).join("\n"));
      setTipsText((initialData.tips || []).join("\n"));
      setRestTimeSeconds(initialData.restTimeSeconds || 90);
      setXpReward(initialData.xpReward || 20);
      setEquipment(initialData.equipment || "Gym Equipment");
      setImageUrl(initialData.imageUrl);
      setVideoUrl(initialData.videoUrl);
      setMediaError({});

      if (initialData.setsList && initialData.setsList.length > 0) {
        setSetsList(initialData.setsList.map((s) => ({ ...s })));
      } else {
        const count = initialData.sets || 3;
        const defaultSets: ExerciseSet[] = [];
        for (let i = 1; i <= count; i++) {
          defaultSets.push({
            id: `set_${Date.now()}_${i}`,
            setNumber: i,
            targetReps: 10,
            targetWeight: 0,
            completed: false,
          });
        }
        setSetsList(defaultSets);
      }
    } else {
      setName("");
      setCategory("General");
      setTargetedMuscles([
        { name: "Pectoralis Major", color: "#ef4444" },
        { name: "Triceps Brachii", color: "#eab308" },
      ]);
      setInstructionsText("1. Grip bar at comfortable width.\n2. Lower with control to mid-chest.\n3. Press up to extension.");
      setTipsText("Keep shoulders retracted.\nControl the weight on lower.");
      setRestTimeSeconds(90);
      setXpReward(20);
      setEquipment("Gym Equipment");
      setImageUrl(undefined);
      setVideoUrl(undefined);
      setMediaError({});
      setSetsList([
        { id: `set_1`, setNumber: 1, targetReps: 10, targetWeight: 50, completed: false },
        { id: `set_2`, setNumber: 2, targetReps: 10, targetWeight: 50, completed: false },
        { id: `set_3`, setNumber: 3, targetReps: 8, targetWeight: 50, completed: false },
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddSet = () => {
    const lastSet = setsList[setsList.length - 1];
    const newSetNumber = setsList.length + 1;
    setSetsList([
      ...setsList,
      {
        id: `set_${Date.now()}_${newSetNumber}`,
        setNumber: newSetNumber,
        targetReps: lastSet ? lastSet.targetReps : 10,
        targetWeight: lastSet ? lastSet.targetWeight : 0,
        completed: false,
      },
    ]);
  };

  const handleRemoveSet = (index: number) => {
    if (setsList.length <= 1) return;
    const updated = setsList.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      setNumber: i + 1,
    }));
    setSetsList(updated);
  };

  const handleUpdateSet = (index: number, field: "targetReps" | "targetWeight", val: number) => {
    const updated = [...setsList];
    updated[index] = {
      ...updated[index],
      [field]: Math.max(0, val),
    };
    setSetsList(updated);
  };

  const handleAddMuscle = () => {
    if (!newMuscleName.trim()) return;
    setTargetedMuscles([...targetedMuscles, { name: newMuscleName.trim(), color: newMuscleColor }]);
    setNewMuscleName("");
  };

  const handleRemoveMuscle = (index: number) => {
    setTargetedMuscles(targetedMuscles.filter((_, i) => i !== index));
  };

  const handlePickImage = async () => {
    try {
      const selected = await nativeDialogService.pickFile(
        "Select Exercise Image",
        "Image Files",
        ["png", "jpg", "jpeg", "webp", "gif", "bmp"]
      );
      if (selected) {
        const imported = await nativeDialogService.importGymMedia(selected);
        setImageUrl(imported);
        setMediaError((prev) => ({ ...prev, image: false }));
      }
    } catch (err) {
      console.error("Failed to import exercise image:", err);
    }
  };

  const handlePickVideo = async () => {
    try {
      const selected = await nativeDialogService.pickFile(
        "Select Exercise Video",
        "Video Files",
        ["mp4", "webm", "mov", "avi", "mkv"]
      );
      if (selected) {
        const imported = await nativeDialogService.importGymMedia(selected);
        setVideoUrl(imported);
        setMediaError((prev) => ({ ...prev, video: false }));
      }
    } catch (err) {
      console.error("Failed to import exercise video:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const instructions = instructionsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const tips = tipsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      name: name.trim(),
      category: category.trim() || "General",
      targetedMuscles,
      instructions,
      tips,
      setsList,
      restTimeSeconds,
      xpReward,
      imageUrl,
      videoUrl,
      equipment: equipment.trim() || "Gym Equipment",
    });
    onClose();
  };

  return (
    <div className="gym-modal-backdrop" onClick={onClose}>
      <div
        className="gym-modal-content large-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gym-modal-header">
          <h3>{initialData ? "Edit Exercise" : "Add New Exercise"}</h3>
          <button className="gym-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="gym-modal-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Exercise Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Barbell Bench Press, Incline Dumbbell Press"
                className="gym-input"
                required
              />
            </div>

            <div className="form-group flex-1">
              <label>Category / Muscle Group</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Chest, Shoulders, Legs"
                className="gym-input"
              />
            </div>
          </div>

          {/* INDIVIDUAL SETS TRACKING EDITOR */}
          <div className="sets-editor-section">
            <div className="sets-editor-header">
              <label>Individual Sets Configuration ({setsList.length} Sets)</label>
              <button
                type="button"
                className="btn-add-set"
                onClick={handleAddSet}
              >
                + Add Set
              </button>
            </div>

            <div className="sets-table-wrapper">
              <table className="sets-editor-table">
                <thead>
                  <tr>
                    <th>Set #</th>
                    <th>Target Reps</th>
                    <th>Target Weight (kg)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {setsList.map((set, idx) => (
                    <tr key={set.id || idx}>
                      <td className="set-num-cell">Set {set.setNumber}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={set.targetReps}
                          onChange={(e) =>
                            handleUpdateSet(idx, "targetReps", parseInt(e.target.value) || 0)
                          }
                          className="gym-set-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          step="0.5"
                          value={set.targetWeight}
                          onChange={(e) =>
                            handleUpdateSet(idx, "targetWeight", parseFloat(e.target.value) || 0)
                          }
                          className="gym-set-input"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-remove-set"
                          onClick={() => handleRemoveSet(idx)}
                          disabled={setsList.length <= 1}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Rest Time Between Sets (Seconds)</label>
              <input
                type="number"
                min="10"
                max="600"
                value={restTimeSeconds}
                onChange={(e) => setRestTimeSeconds(parseInt(e.target.value) || 90)}
                className="gym-input"
              />
            </div>

            <div className="form-group flex-1">
              <label>XP Reward</label>
              <input
                type="number"
                min="5"
                max="100"
                value={xpReward}
                onChange={(e) => setXpReward(parseInt(e.target.value) || 20)}
                className="gym-input"
              />
            </div>

            <div className="form-group flex-1">
              <label>Equipment Needed</label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="e.g. Barbell, Dumbbells, Bench"
                className="gym-input"
              />
            </div>
          </div>

          {/* TARGETED MUSCLES MANAGER */}
          <div className="form-group">
            <label>Targeted Muscles</label>
            <div className="muscles-tag-list">
              {targetedMuscles.map((m, idx) => (
                <span
                  key={idx}
                  className="muscle-pill"
                  style={{ backgroundColor: m.color || "#ef4444" }}
                >
                  {m.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveMuscle(idx)}
                    className="remove-pill-btn"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="add-muscle-row">
              <input
                type="text"
                value={newMuscleName}
                onChange={(e) => setNewMuscleName(e.target.value)}
                placeholder="Muscle name e.g. Upper Pectorals"
                className="gym-input"
              />
              <input
                type="color"
                value={newMuscleColor}
                onChange={(e) => setNewMuscleColor(e.target.value)}
                className="color-picker-input"
              />
              <button
                type="button"
                className="btn-secondary-note"
                onClick={handleAddMuscle}
              >
                + Add Muscle
              </button>
            </div>
          </div>

          {/* MEDIA ATTACHMENTS (IMAGE & VIDEO) */}
          <div className="form-group media-attachments-section">
            <label>Exercise Media (Image & Video)</label>

            <div className="media-pickers-grid">
              {/* IMAGE ATTACHMENT */}
              <div className="media-picker-box">
                <span className="media-box-title">📷 Custom Image</span>
                {imageUrl && !mediaError.image ? (
                  <div className="media-preview-container">
                    <img
                      src={nativeDialogService.formatAssetUrl(imageUrl)}
                      alt="Exercise"
                      className="media-preview-img"
                      onError={() => setMediaError((prev) => ({ ...prev, image: true }))}
                    />
                    <div className="media-btn-row">
                      <button
                        type="button"
                        className="btn-media-action"
                        onClick={handlePickImage}
                      >
                        Replace Image
                      </button>
                      <button
                        type="button"
                        className="btn-media-danger"
                        onClick={() => setImageUrl(undefined)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="media-upload-placeholder">
                    {mediaError.image ? (
                      <span className="error-msg">⚠️ Missing or invalid image file</span>
                    ) : (
                      <span>No image attached</span>
                    )}
                    <button
                      type="button"
                      className="btn-import-media"
                      onClick={handlePickImage}
                    >
                      📷 Select Image File...
                    </button>
                  </div>
                )}
              </div>

              {/* VIDEO ATTACHMENT */}
              <div className="media-picker-box">
                <span className="media-box-title">🎥 Custom Demonstration Video</span>
                {videoUrl && !mediaError.video ? (
                  <div className="media-preview-container">
                    <video
                      src={nativeDialogService.formatAssetUrl(videoUrl)}
                      className="media-preview-video"
                      controls
                      onError={() => setMediaError((prev) => ({ ...prev, video: true }))}
                    />
                    <div className="media-btn-row">
                      <button
                        type="button"
                        className="btn-media-action"
                        onClick={handlePickVideo}
                      >
                        Replace Video
                      </button>
                      <button
                        type="button"
                        className="btn-media-danger"
                        onClick={() => setVideoUrl(undefined)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="media-upload-placeholder">
                    {mediaError.video ? (
                      <span className="error-msg">⚠️ Missing or invalid video file</span>
                    ) : (
                      <span>No video attached</span>
                    )}
                    <button
                      type="button"
                      className="btn-import-media"
                      onClick={handlePickVideo}
                    >
                      🎥 Select Video File...
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Instructions (One step per line)</label>
            <textarea
              rows={3}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              placeholder="1. Lie on bench..."
              className="gym-textarea"
            />
          </div>

          <div className="form-group">
            <label>Tips & Form Notes (One tip per line)</label>
            <textarea
              rows={2}
              value={tipsText}
              onChange={(e) => setTipsText(e.target.value)}
              placeholder="Keep core tight..."
              className="gym-textarea"
            />
          </div>

          <div className="gym-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {initialData ? "Save Exercise" : "Add Exercise"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
