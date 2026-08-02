import { widgetRegistry } from "../../../modules/context";
import { TasksWidget } from "./TasksWidget";
import { ProjectsWidget } from "./ProjectsWidget";
import { GymWidget } from "./GymWidget";
import { JapaneseWidget } from "./JapaneseWidget";
import { NotesWidget } from "./NotesWidget";
import { MusicWidget } from "./MusicWidget";
import { EntertainmentWidget } from "./EntertainmentWidget";

export function registerAllHomeWidgets(): void {
  widgetRegistry.registerWidget("tasks-widget", TasksWidget);
  widgetRegistry.registerWidget("projects-widget", ProjectsWidget);
  widgetRegistry.registerWidget("gym-widget", GymWidget);
  widgetRegistry.registerWidget("japanese-widget", JapaneseWidget);
  widgetRegistry.registerWidget("notes-widget", NotesWidget);
  widgetRegistry.registerWidget("music-widget", MusicWidget);
  widgetRegistry.registerWidget("entertainment-widget", EntertainmentWidget);
}

// Automatically execute widget registration on module import
registerAllHomeWidgets();
