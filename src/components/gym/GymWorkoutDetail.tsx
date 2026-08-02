import { useState } from "react";
import { useGymStore } from "../../modules/gym";
import { Exercise, WorkoutDay } from "../../modules/gym/types";
import { nativeDialogService } from "../../services/nativeDialogService";

interface GymWorkoutDetailProps {
  onBack: () => void;
  dayId?: string;
  onOpenCreateExercise: (workoutDayId: string) => void;
  onOpenEditExercise: (workoutDayId: string, exercise: Exercise) => void;
  onOpenEditDay: (day: WorkoutDay) => void;
  onStartSession: (dayId: string) => void;
}

export function GymWorkoutDetail({
  onBack,
  dayId,
  onOpenCreateExercise,
  onOpenEditExercise,
  onOpenEditDay,
  onStartSession,
}: GymWorkoutDetailProps) {
  const {
    workoutDays,
    deleteWorkoutDay,
    deleteExercise,
    duplicateExercise,
    reorderExercises,
  } = useGymStore();

  const currentDay =
    workoutDays.find((d) => d.id === dayId) || workoutDays[0];

  const exercises = currentDay?.exercises || [];
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.id || ""
  );
  const [isVideoEnlarged, setIsVideoEnlarged] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<{ image?: boolean; video?: boolean }>({});

  const activeExercise: Exercise | undefined =
    exercises.find((e) => e.id === selectedExerciseId) || exercises[0];

  if (!currentDay) {
    return (
      <div className="gym-workout-container">
        <div className="no-day-card">
          <h2>Workout Day Not Found</h2>
          <button className="back-gym-btn" onClick={onBack}>
            ← Back to Gym Overview
          </button>
        </div>
      </div>
    );
  }

  const handleMoveExercise = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === exercises.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const ids = exercises.map((e) => e.id);
    const temp = ids[idx];
    ids[idx] = ids[targetIdx];
    ids[targetIdx] = temp;

    reorderExercises(currentDay.id, ids);
  };

  const handleDeleteEx = (exId: string, name: string) => {
    if (window.confirm(`Delete exercise "${name}"?`)) {
      deleteExercise(currentDay.id, exId);
    }
  };

  const handleDuplicateEx = (exId: string) => {
    duplicateExercise(currentDay.id, exId);
  };

  const handleDeleteDay = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${currentDay.title}"? All exercises inside this day will be deleted.`
      )
    ) {
      deleteWorkoutDay(currentDay.id);
      onBack();
    }
  };

  return (
    <div className="gym-workout-container">
      {/* Top Navigation Bar */}
      <div className="workout-top-bar">
        <button className="back-gym-btn" onClick={onBack}>
          ← Back to Gym
        </button>

        <div className="workout-header-block">
          <div className="header-crest">{currentDay.icon || "🏋️"}</div>
          <div className="header-titles">
            <h1 className="workout-main-title">{currentDay.title}</h1>
            <span className="workout-subtitle">
              {currentDay.dayOfWeek} &nbsp;|&nbsp;{" "}
              {currentDay.description || "Focus & Strength Training"}
            </span>
          </div>
        </div>

        <div className="workout-header-badges detail-header-actions">
          {exercises.length > 0 && !currentDay.isRestDay && (
            <button
              className="btn-start-session-header"
              onClick={() => onStartSession(currentDay.id)}
            >
              🚀 Start Workout
            </button>
          )}

          <button
            className="btn-add-ex-header"
            onClick={() => onOpenCreateExercise(currentDay.id)}
          >
            ➕ Add Exercise
          </button>

          <button
            className="btn-edit-day-header"
            onClick={() => onOpenEditDay(currentDay)}
          >
            ✏️ Edit Day
          </button>

          <button
            className="btn-delete-day-header"
            onClick={handleDeleteDay}
            title="Delete Workout Day"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="workout-main-grid">
        {/* Left Column: WORKOUT EXERCISES LIST & REORDERING */}
        <div className="workout-timeline-panel">
          <div className="panel-title-bar flex-between">
            <h3 className="panel-title-text">EXERCISE TIMELINE</h3>
            <button
              className="btn-text-action"
              onClick={() => onOpenCreateExercise(currentDay.id)}
            >
              + Add
            </button>
          </div>

          {exercises.length === 0 ? (
            <div className="empty-panel-msg">
              <p>No exercises created yet.</p>
              <button
                className="btn-secondary-note"
                onClick={() => onOpenCreateExercise(currentDay.id)}
              >
                + Add First Exercise
              </button>
            </div>
          ) : (
            <div className="timeline-scroll-list">
              {exercises.map((item, idx) => {
                const isSelected = item.id === activeExercise?.id;

                return (
                  <div
                    key={item.id}
                    className={`timeline-row-item type-exercise ${
                      isSelected ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedExerciseId(item.id);
                      setMediaError({});
                    }}
                  >
                    <div className="reorder-btn-col" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-reorder-up"
                        onClick={() => handleMoveExercise(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        className="btn-reorder-down"
                        onClick={() => handleMoveExercise(idx, "down")}
                        disabled={idx === exercises.length - 1}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="timeline-icon-cell">
                      <span className="exercise-number-circle">
                        {item.orderNumber || String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="timeline-info-cell">
                      <span className="timeline-item-title">{item.name}</span>
                      <span className="timeline-item-sub">
                        {item.setsCount || item.setsList?.length || 3} Sets • {item.repsDisplay || item.reps}
                      </span>
                    </div>

                    {isSelected && <span className="timeline-active-arrow">&gt;</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: SELECTED EXERCISE DETAIL VIEW */}
        <div className="workout-exercise-panel">
          {activeExercise ? (
            <>
              {/* Exercise Header Row */}
              <div className="exercise-header-row">
                <div className="ex-title-group">
                  <span className="ex-order-badge">
                    {activeExercise.orderNumber}
                  </span>
                  <div>
                    <h2 className="ex-active-name">{activeExercise.name}</h2>
                    <span className="ex-category-tag">
                      🛡️ {activeExercise.category || "General"}
                    </span>
                  </div>
                </div>

                <div className="ex-action-buttons-group">
                  <button
                    className="btn-ex-action btn-edit"
                    onClick={() => onOpenEditExercise(currentDay.id, activeExercise)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="btn-ex-action btn-duplicate"
                    onClick={() => handleDuplicateEx(activeExercise.id)}
                    title="Duplicate Exercise"
                  >
                    📋 Duplicate
                  </button>

                  <button
                    className="btn-ex-action btn-delete"
                    onClick={() => handleDeleteEx(activeExercise.id, activeExercise.name)}
                    title="Delete Exercise"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Media & Targeted Muscles Split Row */}
              <div className="exercise-media-row">
                {/* Media Container */}
                <div
                  className={`exercise-video-box ${
                    isVideoEnlarged ? "enlarged" : ""
                  }`}
                >
                  {activeExercise.videoUrl && !mediaError.video ? (
                    <video
                      src={nativeDialogService.formatAssetUrl(activeExercise.videoUrl)}
                      className="exercise-video-player"
                      controls
                      onError={() => setMediaError((prev) => ({ ...prev, video: true }))}
                    />
                  ) : activeExercise.imageUrl && !mediaError.image ? (
                    <img
                      src={nativeDialogService.formatAssetUrl(activeExercise.imageUrl)}
                      alt={activeExercise.name}
                      className="exercise-img"
                      onError={() => setMediaError((prev) => ({ ...prev, image: true }))}
                    />
                  ) : (
                    <div className="exercise-media-fallback">
                      <span className="fallback-icon">🏋️</span>
                      <span className="fallback-text">
                        No Custom Image / Video Attached
                      </span>
                    </div>
                  )}

                  <button
                    className="enlarge-video-btn"
                    onClick={() => setIsVideoEnlarged(!isVideoEnlarged)}
                    title="Toggle Enlarge"
                  >
                    ⤢
                  </button>
                </div>

                {/* Targeted Muscles Panel */}
                <div className="targeted-muscles-box">
                  <h4 className="box-title">TARGETED MUSCLES</h4>
                  <div className="muscles-body-diagram">
                    <svg width="100" height="120" viewBox="0 0 100 130" fill="none">
                      <path
                        d="M40 10 Q50 5 60 10 Q65 20 60 30 Q50 35 40 30 Q35 20 40 10 Z"
                        fill="#332a22"
                      />
                      <path
                        d="M30 35 C40 30 60 30 70 35 C75 50 65 65 50 65 C35 65 25 50 30 35 Z"
                        fill="#ef4444"
                        opacity="0.85"
                      />
                      <path
                        d="M22 35 C28 35 32 45 28 55 C22 55 18 45 22 35 Z"
                        fill="#f97316"
                        opacity="0.85"
                      />
                    </svg>
                  </div>

                  <div className="muscle-legend-list">
                    {activeExercise.targetedMuscles?.length > 0 ? (
                      activeExercise.targetedMuscles.map((m, idx) => (
                        <div key={idx} className="muscle-legend-item">
                          <span
                            className="legend-dot"
                            style={{ backgroundColor: m.color || "#ef4444" }}
                          />
                          <span className="legend-name">{m.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="no-muscles-lbl">General Muscle Group</span>
                    )}
                  </div>
                </div>
              </div>

              {/* INDIVIDUAL SETS BREAKDOWN CARD */}
              <div className="info-card sets-breakdown-card">
                <h4 className="info-card-title">CONFIGURED SETS BREAKDOWN</h4>
                <div className="sets-list-table-wrapper">
                  <table className="configured-sets-table">
                    <thead>
                      <tr>
                        <th>SET #</th>
                        <th>TARGET REPS</th>
                        <th>TARGET WEIGHT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeExercise.setsList?.map((s) => (
                        <tr key={s.id || s.setNumber}>
                          <td className="font-bold">Set {s.setNumber}</td>
                          <td>{s.targetReps} Reps</td>
                          <td>{s.targetWeight > 0 ? `${s.targetWeight} kg` : "Bodyweight"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lower Exercise Info Grid */}
              <div className="exercise-details-grid margin-top-card">
                {/* Instructions */}
                {activeExercise.instructions?.length > 0 && (
                  <div className="info-card how-to-card">
                    <h4 className="info-card-title">HOW TO PERFORM</h4>
                    <ol className="instructions-list">
                      {activeExercise.instructions.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Tips */}
                {activeExercise.tips?.length > 0 && (
                  <div className="info-card tips-card">
                    <h4 className="info-card-title">TIPS</h4>
                    <ul className="tips-list">
                      {activeExercise.tips.map((tip, idx) => (
                        <li key={idx}>★ {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Rest Between Sets */}
                <div className="info-card">
                  <h4 className="info-card-title">REST BETWEEN SETS</h4>
                  <div className="rest-info-group">
                    <span className="rest-icon">⏳</span>
                    <span className="rest-val">
                      {activeExercise.restTimeDisplay || `${activeExercise.restTimeSeconds || 90} sec`}
                    </span>
                  </div>
                  <span className="rest-sub">Focus on recovery & breathing.</span>
                </div>

                {/* Equipment */}
                <div className="info-card">
                  <h4 className="info-card-title">EQUIPMENT</h4>
                  <div className="rest-info-group">
                    <span className="rest-icon">🏋️</span>
                    <span className="rest-sub">{activeExercise.equipment || "Gym equipment"}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-exercise-selected-card">
              <p>No exercise selected in this routine.</p>
              <button
                className="btn-create-day-lg"
                onClick={() => onOpenCreateExercise(currentDay.id)}
              >
                + Add Exercise to {currentDay.title}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
