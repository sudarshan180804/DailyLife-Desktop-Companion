import { useState } from "react";
import { GymOverview } from "./GymOverview";
import { GymWorkoutDetail } from "./GymWorkoutDetail";

export function GymPage() {
  const [activeView, setActiveView] = useState<"overview" | "workout">("overview");

  return (
    <div className="gym-page-wrapper">
      {activeView === "overview" ? (
        <GymOverview onViewFullWorkout={() => setActiveView("workout")} />
      ) : (
        <GymWorkoutDetail onBack={() => setActiveView("overview")} />
      )}
    </div>
  );
}
