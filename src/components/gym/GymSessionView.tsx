import { useEffect, useState } from "react";
import { useGymStore } from "../../modules/gym";
import { nativeDialogService } from "../../services/nativeDialogService";

interface GymSessionViewProps {
  onBack: () => void;
}

export function GymSessionView({ onBack }: GymSessionViewProps) {
  const {
    activeSession,
    toggleSetComplete,
    updateSetActuals,
    setCurrentExerciseIndex,
    tickSessionTimer,
    startRestTimer,
    stopRestTimer,
    finishSession,
    cancelSession,
  } = useGymStore();

  const [isVideoEnlarged, setIsVideoEnlarged] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<{ image?: boolean; video?: boolean }>({});

  // Session timer tick interval
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      tickSessionTimer(1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession?.id]);

  if (!activeSession) {
    return (
      <div className="gym-workout-container">
        <div className="no-active-session-card">
          <h2>No Active Workout Session</h2>
          <p>Select a workout day from the Gym Overview to start training.</p>
          <button className="back-gym-btn" onClick={onBack}>
            ← Back to Gym Overview
          </button>
        </div>
      </div>
    );
  }

  const {
    workoutDayTitle,
    elapsedSeconds,
    restTimerSeconds,
    isRestTimerActive,
    exercises,
    currentExerciseIndex,
  } = activeSession;

  const currentExercise = exercises[currentExerciseIndex] || exercises[0];
  const completedExercisesCount = exercises.filter((e) => e.completed).length;
  const totalExercisesCount = exercises.length;

  // Format Session Elapsed Time (HH:MM:SS)
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleFinish = async () => {
    if (window.confirm("Finish workout session and record your achievements?")) {
      await finishSession();
      onBack();
    }
  };

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this workout session? Progress will be discarded.")) {
      await cancelSession();
      onBack();
    }
  };

  const handlePrev = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setMediaError({});
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setMediaError({});
    }
  };

  const handleToggleSet = (setNum: number, actualReps: number, actualWeight: number) => {
    if (currentExercise) {
      toggleSetComplete(currentExercise.id, setNum, actualReps, actualWeight);
    }
  };

  const handleUpdateSetInput = (
    setNum: number,
    field: "actualReps" | "actualWeight",
    value: number
  ) => {
    if (!currentExercise) return;
    const targetSet = currentExercise.setsList.find((s) => s.setNumber === setNum);
    if (!targetSet) return;

    const actualReps = field === "actualReps" ? value : targetSet.actualReps ?? targetSet.targetReps;
    const actualWeight = field === "actualWeight" ? value : targetSet.actualWeight ?? targetSet.targetWeight;

    updateSetActuals(currentExercise.id, setNum, actualReps, actualWeight);
  };

  return (
    <div className="gym-workout-container active-session-mode">
      {/* Active Session Top Navigation Bar */}
      <div className="workout-top-bar session-top-bar">
        <div className="workout-header-block">
          <div className="header-crest pulsing-crest">🔥</div>
          <div className="header-titles">
            <h1 className="workout-main-title">{workoutDayTitle}</h1>
            <span className="workout-subtitle">
              Active Training Session &nbsp;•&nbsp; Push past your limits
            </span>
          </div>
        </div>

        {/* Timers & Actions */}
        <div className="workout-header-badges session-timers-group">
          <div className="header-badge-box session-clock-badge">
            <span className="badge-lbl">SESSION TIME</span>
            <span className="badge-val highlight-orange font-mono">
              ⏱️ {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="header-badge-box rest-timer-badge">
            <span className="badge-lbl">REST TIMER</span>
            <span className="badge-val highlight-gold font-mono">
              ⏳ {restTimerSeconds > 0 ? `${restTimerSeconds}s` : "Ready"}
            </span>
            <div className="timer-controls-row">
              <button
                className="btn-timer-toggle"
                onClick={() => startRestTimer((restTimerSeconds || 0) + 30)}
                title="Add 30s Rest"
              >
                +30s
              </button>
              {isRestTimerActive && (
                <button
                  className="btn-timer-toggle"
                  onClick={stopRestTimer}
                  title="Pause Rest Timer"
                >
                  Pause
                </button>
              )}
            </div>
          </div>

          <div className="session-top-actions">
            <button className="btn-cancel-session" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-finish-session" onClick={handleFinish}>
              🏆 Finish Workout
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar Row */}
      <div className="session-progress-strip">
        <div className="progress-info-row">
          <span>
            Workout Progress:{" "}
            <strong>
              {completedExercisesCount} of {totalExercisesCount} Exercises Cleared
            </strong>
          </span>
          <span>
            {totalExercisesCount > 0
              ? `${Math.round((completedExercisesCount / totalExercisesCount) * 100)}%`
              : "0%"}
          </span>
        </div>
        <div className="session-progress-bar-bg">
          <div
            className="session-progress-bar-fill"
            style={{
              width:
                totalExercisesCount > 0
                  ? `${(completedExercisesCount / totalExercisesCount) * 100}%`
                  : "0%",
            }}
          />
        </div>
      </div>

      {/* Main Session View Grid: Left Timeline + Right Current Exercise Runner */}
      <div className="workout-main-grid">
        {/* Left Column: WORKOUT EXERCISES TIMELINE */}
        <div className="workout-timeline-panel">
          <div className="panel-title-bar">
            <h3 className="panel-title-text">EXERCISE LIST</h3>
          </div>

          <div className="timeline-scroll-list">
            {exercises.map((item, idx) => {
              const isSelected = idx === currentExerciseIndex;
              const isCompleted = item.completed;

              return (
                <div
                  key={item.id}
                  className={`timeline-row-item type-exercise ${
                    isSelected ? "active" : ""
                  } ${isCompleted ? "completed" : ""}`}
                  onClick={() => {
                    setCurrentExerciseIndex(idx);
                    setMediaError({});
                  }}
                >
                  <span className="timeline-time">Ex {idx + 1}</span>

                  <div className="timeline-icon-cell">
                    <span className="exercise-number-circle">
                      {item.orderNumber || String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="timeline-info-cell">
                    <span className="timeline-item-title">{item.name}</span>
                    <span className="timeline-item-sub">
                      {item.setsList.length} Sets • {item.repsDisplay}
                    </span>
                  </div>

                  {isCompleted && <span className="timeline-check-mark">✓</span>}
                  {isSelected && <span className="timeline-active-arrow">&gt;</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: ACTIVE EXERCISE TRACKER */}
        <div className="workout-exercise-panel">
          {currentExercise ? (
            <>
              {/* Exercise Header */}
              <div className="exercise-header-row">
                <div className="ex-title-group">
                  <span className="ex-order-badge">
                    {currentExercise.orderNumber || String(currentExerciseIndex + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="ex-active-name">{currentExercise.name}</h2>
                    <span className="ex-category-tag">
                      🛡️ {currentExercise.category || "General"}
                    </span>
                  </div>
                </div>

                {/* Previous & Next Navigation Controls */}
                <div className="nav-exercise-buttons">
                  <button
                    className="btn-nav-prev"
                    onClick={handlePrev}
                    disabled={currentExerciseIndex === 0}
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn-nav-next"
                    onClick={handleNext}
                    disabled={currentExerciseIndex === exercises.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Media & Muscle targets row */}
              <div className="exercise-media-row">
                {/* Media Container */}
                <div
                  className={`exercise-video-box ${
                    isVideoEnlarged ? "enlarged" : ""
                  }`}
                >
                  {currentExercise.videoUrl && !mediaError.video ? (
                    <video
                      src={nativeDialogService.formatAssetUrl(currentExercise.videoUrl)}
                      className="exercise-video-player"
                      controls
                      autoPlay
                      muted
                      loop
                      onError={() => setMediaError((prev) => ({ ...prev, video: true }))}
                    />
                  ) : currentExercise.imageUrl && !mediaError.image ? (
                    <img
                      src={nativeDialogService.formatAssetUrl(currentExercise.imageUrl)}
                      alt={currentExercise.name}
                      className="exercise-img"
                      onError={() => setMediaError((prev) => ({ ...prev, image: true }))}
                    />
                  ) : (
                    <div className="exercise-media-fallback">
                      <span className="fallback-icon">🏋️</span>
                      <span className="fallback-text">
                        No Custom Media Attached
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

                {/* Targeted Muscles */}
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
                      <path
                        d="M78 35 C72 35 68 45 72 55 C78 55 82 45 78 35 Z"
                        fill="#f97316"
                        opacity="0.85"
                      />
                    </svg>
                  </div>

                  <div className="muscle-legend-list">
                    {currentExercise.targetedMuscles.length > 0 ? (
                      currentExercise.targetedMuscles.map((m, idx) => (
                        <div key={idx} className="muscle-legend-item">
                          <span
                            className="legend-dot"
                            style={{ backgroundColor: m.color || "#ef4444" }}
                          />
                          <span className="legend-name">{m.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="no-muscles-lbl">General Body</span>
                    )}
                  </div>
                </div>
              </div>

              {/* INDIVIDUAL SETS WORKOUT LOGGING TABLE */}
              <div className="session-sets-card">
                <div className="sets-header-bar">
                  <h4>SETS & WEIGHT LOGGING</h4>
                  <span className="rest-hint">
                    ⏱️ Rest Time: {currentExercise.restTimeDisplay || `${currentExercise.restTimeSeconds}s`}
                  </span>
                </div>

                <table className="session-sets-table">
                  <thead>
                    <tr>
                      <th>SET #</th>
                      <th>TARGET</th>
                      <th>ACTUAL REPS</th>
                      <th>ACTUAL WEIGHT (KG)</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentExercise.setsList.map((setItem) => {
                      const actualRepsVal =
                        setItem.actualReps !== undefined
                          ? setItem.actualReps
                          : setItem.targetReps;
                      const actualWeightVal =
                        setItem.actualWeight !== undefined
                          ? setItem.actualWeight
                          : setItem.targetWeight;

                      return (
                        <tr
                          key={setItem.id || setItem.setNumber}
                          className={setItem.completed ? "set-row-completed" : ""}
                        >
                          <td className="set-num-label">Set {setItem.setNumber}</td>
                          <td className="set-target-label">
                            {setItem.targetReps} reps @ {setItem.targetWeight > 0 ? `${setItem.targetWeight}kg` : "BW"}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="500"
                              value={actualRepsVal}
                              onChange={(e) =>
                                handleUpdateSetInput(
                                  setItem.setNumber,
                                  "actualReps",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="gym-session-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="1000"
                              step="0.5"
                              value={actualWeightVal}
                              onChange={(e) =>
                                handleUpdateSetInput(
                                  setItem.setNumber,
                                  "actualWeight",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="gym-session-input"
                            />
                          </td>
                          <td>
                            <button
                              className={`btn-check-set ${
                                setItem.completed ? "completed" : ""
                              }`}
                              onClick={() =>
                                handleToggleSet(setItem.setNumber, actualRepsVal, actualWeightVal)
                              }
                            >
                              {setItem.completed ? "✓ Complete" : "Mark Set Done"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Instructions & Notes */}
              {currentExercise.instructions.length > 0 && (
                <div className="info-card how-to-card margin-top-card">
                  <h4 className="info-card-title">INSTRUCTIONS</h4>
                  <ol className="instructions-list">
                    {currentExercise.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          ) : (
            <div className="no-exercise-selected">
              <p>No exercise selected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
