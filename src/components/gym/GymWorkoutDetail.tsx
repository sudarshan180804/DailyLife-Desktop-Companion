import { useState } from "react";
import { MOCK_EXERCISES, MOCK_TIMELINE } from "../../data/gymData";
import { Exercise } from "../../types/gym";

interface GymWorkoutDetailProps {
  onBack: () => void;
}

export function GymWorkoutDetail({ onBack }: GymWorkoutDetailProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("ex-bench-press");
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Set<string>>(
    () => new Set(MOCK_EXERCISES.filter((e) => e.completed).map((e) => e.id))
  );
  const [isVideoEnlarged, setIsVideoEnlarged] = useState<boolean>(false);

  const activeExercise: Exercise =
    MOCK_EXERCISES.find((e) => e.id === selectedExerciseId) || MOCK_EXERCISES[0];

  const isCurrentCompleted = completedExerciseIds.has(activeExercise.id);

  const handleToggleComplete = () => {
    setCompletedExerciseIds((prev) => {
      const next = new Set(prev);
      if (next.has(activeExercise.id)) {
        next.delete(activeExercise.id);
      } else {
        next.add(activeExercise.id);
      }
      return next;
    });
  };

  return (
    <div className="gym-workout-container">
      {/* Top Bar Navigation */}
      <div className="workout-top-bar">
        <button className="back-gym-btn" onClick={onBack}>
          ← Back to Gym
        </button>

        <div className="workout-header-block">
          <div className="header-crest">🏋️</div>
          <div className="header-titles">
            <h1 className="workout-main-title">PUSH DAY</h1>
            <span className="workout-subtitle">Chest • Shoulders • Triceps &nbsp;|&nbsp; Discipline builds strength.</span>
          </div>
        </div>

        <div className="workout-header-badges">
          <div className="header-badge-box">
            <span className="badge-lbl">Session XP</span>
            <span className="badge-val highlight-gold">+105 XP</span>
          </div>

          <div className="header-badge-box">
            <span className="badge-lbl">Est. Duration</span>
            <span className="badge-val">75 - 90 min</span>
          </div>

          <div className="header-badge-box">
            <span className="badge-lbl">Difficulty</span>
            <span className="badge-val highlight-orange">Advanced</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Timeline + Right Current Exercise */}
      <div className="workout-main-grid">
        {/* Left Column: WORKOUT TIMELINE */}
        <div className="workout-timeline-panel">
          <div className="panel-title-bar">
            <h3 className="panel-title-text">WORKOUT TIMELINE</h3>
          </div>

          <div className="timeline-scroll-list">
            {MOCK_TIMELINE.map((item) => {
              const isSelected = item.exerciseId === activeExercise.id;
              const isCompleted = item.exerciseId
                ? completedExerciseIds.has(item.exerciseId)
                : item.completed;

              return (
                <div
                  key={item.id}
                  className={`timeline-row-item type-${item.type} ${isSelected ? "active" : ""} ${
                    isCompleted ? "completed" : ""
                  }`}
                  onClick={() => {
                    if (item.exerciseId) {
                      setSelectedExerciseId(item.exerciseId);
                    }
                  }}
                >
                  <span className="timeline-time">{item.timeOffset}</span>

                  <div className="timeline-icon-cell">
                    {item.type === "warmup" && "🔥"}
                    {item.type === "break" && "⏳"}
                    {item.type === "hydration" && "💧"}
                    {item.type === "cooldown" && "🌿"}
                    {item.type === "exercise" && (
                      <span className="exercise-number-circle">{item.orderNumber}</span>
                    )}
                  </div>

                  <div className="timeline-info-cell">
                    <span className="timeline-item-title">{item.title}</span>
                    <span className="timeline-item-sub">{item.subtitle}</span>
                  </div>

                  {isCompleted && <span className="timeline-check-mark">✓</span>}
                  {isSelected && <span className="timeline-active-arrow">&gt;</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: CURRENT EXERCISE */}
        <div className="workout-exercise-panel">
          {/* Header row */}
          <div className="exercise-header-row">
            <div className="ex-title-group">
              <span className="ex-order-badge">{activeExercise.orderNumber}</span>
              <div>
                <h2 className="ex-active-name">{activeExercise.name}</h2>
                <span className="ex-category-tag">🛡️ {activeExercise.category}</span>
              </div>
            </div>

            <button
              className={`mark-complete-btn ${isCurrentCompleted ? "is-completed" : ""}`}
              onClick={handleToggleComplete}
            >
              <span>{isCurrentCompleted ? "✓ Completed" : "✓ Mark as Complete"}</span>
            </button>
          </div>

          {/* Media & Targeted Muscles split row */}
          <div className="exercise-media-row">
            {/* Prominent Video / Photo Container */}
            <div className={`exercise-video-box ${isVideoEnlarged ? "enlarged" : ""}`}>
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop"
                alt={activeExercise.name}
                className="exercise-img"
              />
              <div className="play-button-overlay">
                <div className="play-triangle" />
              </div>

              {/* Fullscreen UI Button */}
              <button
                className="enlarge-video-btn"
                onClick={() => setIsVideoEnlarged(!isVideoEnlarged)}
                title="Enlarge Video View"
              >
                ⤢
              </button>
            </div>

            {/* Targeted Muscles Panel */}
            <div className="targeted-muscles-box">
              <h4 className="box-title">TARGETED MUSCLES</h4>
              <div className="muscles-body-diagram">
                {/* SVG Human Muscle Silhouette Diagram */}
                <svg width="120" height="150" viewBox="0 0 100 130" fill="none">
                  <path d="M40 10 Q50 5 60 10 Q65 20 60 30 Q50 35 40 30 Q35 20 40 10 Z" fill="#332a22" />
                  <path d="M30 35 C40 30 60 30 70 35 C75 50 65 65 50 65 C35 65 25 50 30 35 Z" fill="#ef4444" opacity="0.85" />
                  <path d="M22 35 C28 35 32 45 28 55 C22 55 18 45 22 35 Z" fill="#f97316" opacity="0.85" />
                  <path d="M78 35 C72 35 68 45 72 55 C78 55 82 45 78 35 Z" fill="#f97316" opacity="0.85" />
                  <path d="M20 55 C25 55 25 75 20 75 C15 75 15 55 20 55 Z" fill="#eab308" opacity="0.85" />
                  <path d="M80 55 C75 55 75 75 80 75 C85 75 85 55 80 55 Z" fill="#eab308" opacity="0.85" />
                  <path d="M35 65 C45 65 55 65 65 65 C62 90 38 90 35 65 Z" fill="#261e17" />
                  <path d="M36 90 C42 90 44 125 38 125 C32 125 32 90 36 90 Z" fill="#261e17" />
                  <path d="M64 90 C58 90 56 125 62 125 C68 125 68 90 64 90 Z" fill="#261e17" />
                </svg>
              </div>

              <div className="muscle-legend-list">
                {activeExercise.targetedMuscles.map((m, idx) => (
                  <div key={idx} className="muscle-legend-item">
                    <span className="legend-dot" style={{ backgroundColor: m.color }} />
                    <span className="legend-name">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lower Exercise Info Cards (Set & Rep Target, How to Perform, Tips, Rest, Hydration, Equipment) */}
          <div className="exercise-details-grid">
            {/* Set & Rep Target */}
            <div className="info-card">
              <h4 className="info-card-title">SET & REP TARGET</h4>
              <div className="target-stats-group">
                <div className="target-item">
                  <span className="target-icon">🏋️</span>
                  <span className="target-text">{activeExercise.sets} Sets</span>
                </div>
                <div className="target-item">
                  <span className="target-icon">🎯</span>
                  <span className="target-text">{activeExercise.reps}</span>
                </div>
              </div>
            </div>

            {/* How to Perform */}
            <div className="info-card how-to-card">
              <h4 className="info-card-title">HOW TO PERFORM</h4>
              <ol className="instructions-list">
                {activeExercise.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            <div className="info-card tips-card">
              <h4 className="info-card-title">TIPS</h4>
              <ul className="tips-list">
                {activeExercise.tips.map((tip, idx) => (
                  <li key={idx}>★ {tip}</li>
                ))}
              </ul>
            </div>

            {/* Rest Between Sets */}
            <div className="info-card">
              <h4 className="info-card-title">REST BETWEEN SETS</h4>
              <div className="rest-info-group">
                <span className="rest-icon">⏳</span>
                <span className="rest-val">{activeExercise.restTime}</span>
              </div>
              <span className="rest-sub">Focus on recovery and breathing.</span>
            </div>

            {/* Hydration Reminder */}
            <div className="info-card">
              <h4 className="info-card-title">HYDRATION REMINDER</h4>
              <div className="rest-info-group">
                <span className="rest-icon">💧</span>
                <span className="rest-sub">Drink water during breaks. Stay hydrated. Stay strong.</span>
              </div>
            </div>

            {/* Equipment */}
            <div className="info-card">
              <h4 className="info-card-title">EQUIPMENT</h4>
              <div className="rest-info-group">
                <span className="rest-icon">🏋️</span>
                <span className="rest-sub">{activeExercise.equipment}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
