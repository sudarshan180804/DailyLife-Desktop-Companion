import { useState } from "react";
import { useGymStore } from "../../modules/gym";
import { GymOverview } from "./GymOverview";
import { GymWorkoutDetail } from "./GymWorkoutDetail";
import { GymSessionView } from "./GymSessionView";
import { GymDayEditorModal } from "./GymDayEditorModal";
import { GymExerciseEditorModal } from "./GymExerciseEditorModal";
import { WorkoutDay, Exercise } from "../../modules/gym/types";

export function GymPage() {
  const {
    activeSession,
    createWorkoutDay,
    updateWorkoutDay,
    createExercise,
    updateExercise,
    startSession,
  } = useGymStore();

  const [activeView, setActiveView] = useState<"overview" | "workout" | "session">(
    activeSession ? "session" : "overview"
  );
  const [selectedDayId, setSelectedDayId] = useState<string | undefined>(undefined);

  // Modal states
  const [isDayModalOpen, setIsDayModalOpen] = useState<boolean>(false);
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState<boolean>(false);
  const [editingExercisePayload, setEditingExercisePayload] = useState<{
    workoutDayId: string;
    exercise: Exercise | null;
  } | null>(null);

  // Handlers for Workout Day modal
  const handleOpenCreateDay = () => {
    setEditingDay(null);
    setIsDayModalOpen(true);
  };

  const handleOpenEditDay = (day: WorkoutDay) => {
    setEditingDay(day);
    setIsDayModalOpen(true);
  };

  const handleSaveDay = async (data: any) => {
    if (editingDay) {
      await updateWorkoutDay(editingDay.id, data);
    } else {
      const created = await createWorkoutDay(data);
      if (created) setSelectedDayId(created.id);
    }
  };

  // Handlers for Exercise modal
  const handleOpenCreateExercise = (workoutDayId: string) => {
    setEditingExercisePayload({ workoutDayId, exercise: null });
    setIsExerciseModalOpen(true);
  };

  const handleOpenEditExercise = (workoutDayId: string, exercise: Exercise) => {
    setEditingExercisePayload({ workoutDayId, exercise });
    setIsExerciseModalOpen(true);
  };

  const handleSaveExercise = async (data: any) => {
    if (!editingExercisePayload) return;
    const { workoutDayId, exercise } = editingExercisePayload;

    if (exercise) {
      await updateExercise(workoutDayId, exercise.id, data);
    } else {
      await createExercise(workoutDayId, data);
    }
  };

  // Handler for Start Workout session
  const handleStartSession = async (dayId: string) => {
    if (activeSession && activeSession.workoutDayId === dayId) {
      setActiveView("session");
      return;
    }
    const session = await startSession(dayId);
    if (session) {
      setActiveView("session");
    }
  };

  return (
    <div className="gym-page-wrapper">
      {activeView === "session" || activeSession ? (
        <GymSessionView onBack={() => setActiveView("overview")} />
      ) : activeView === "overview" ? (
        <GymOverview
          onViewFullWorkout={(dayId) => {
            if (dayId) setSelectedDayId(dayId);
            setActiveView("workout");
          }}
          onOpenCreateDay={handleOpenCreateDay}
          onStartSession={handleStartSession}
        />
      ) : (
        <GymWorkoutDetail
          dayId={selectedDayId}
          onBack={() => setActiveView("overview")}
          onOpenCreateExercise={handleOpenCreateExercise}
          onOpenEditExercise={handleOpenEditExercise}
          onOpenEditDay={handleOpenEditDay}
          onStartSession={handleStartSession}
        />
      )}

      {/* Modals */}
      <GymDayEditorModal
        isOpen={isDayModalOpen}
        initialData={editingDay}
        onClose={() => setIsDayModalOpen(false)}
        onSave={handleSaveDay}
      />

      {isExerciseModalOpen && editingExercisePayload && (
        <GymExerciseEditorModal
          isOpen={isExerciseModalOpen}
          initialData={editingExercisePayload.exercise}
          workoutDayId={editingExercisePayload.workoutDayId}
          onClose={() => setIsExerciseModalOpen(false)}
          onSave={handleSaveExercise}
        />
      )}
    </div>
  );
}
