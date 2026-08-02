import { storageService } from "../storageService";
import { eventBus } from "../eventBus";
import { xpService, calculateLevelFromXP } from "../xpService";
import { profileService } from "../profileService";
import { taskServiceModule } from "../../modules/tasks/taskService";
import { projectServiceModule } from "../../modules/projects/projectService";
import { notesServiceModule } from "../../modules/notes/notesService";
import { gymServiceModule } from "../../modules/gym/gymService";
import { japaneseServiceModule } from "../../modules/japanese/japaneseService";
import { musicServiceModule } from "../../modules/music/musicService";
import { animeServiceModule } from "../../modules/anime/animeService";

/**
 * Service Integration Test Suite verifying core service contracts,
 * persistence, event emissions, mathematical formulas, and cross-module synchronization.
 */
export async function runServiceTests(): Promise<{ passed: number; failed: number; log: string[] }> {
  let passed = 0;
  let failed = 0;
  const log: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      log.push(`✓ [PASS] ${testName}`);
    } else {
      failed++;
      log.push(`✕ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. StorageService Tests
    await storageService.save("test_key", { value: 42 });
    const exists = await storageService.exists("test_key");
    assert(exists, "StorageService.exists returns true for saved key");

    const loaded = await storageService.load<{ value: number }>("test_key");
    assert(loaded?.value === 42, "StorageService.load retrieves stored object");

    await storageService.remove("test_key");
    const existsAfterRemove = await storageService.exists("test_key");
    assert(!existsAfterRemove, "StorageService.remove removes stored key");

    // 2. EventBus Tests
    let eventFired = false;
    const unsub = eventBus.subscribe("test:event", () => {
      eventFired = true;
    });
    eventBus.emit("test:event", {});
    assert(eventFired, "EventBus.emit triggers subscriber callback");
    unsub();
    eventFired = false;
    eventBus.emit("test:event", {});
    assert(!eventFired, "EventBus unsubscribed callback is not invoked");

    // 3. XPService Mathematical Formulas
    const lvl1 = calculateLevelFromXP(0);
    assert(lvl1.level === 1, "0 XP equals Level 1");

    const lvl2 = calculateLevelFromXP(100);
    assert(lvl2.level === 2, "100 XP equals Level 2");

    const lvl3 = calculateLevelFromXP(400);
    assert(lvl3.level === 3, "400 XP equals Level 3");

    // Verify xpService singleton instance
    assert(typeof xpService.getLevel() === "number", "xpService returns numeric level");

    // 4. ProfileService Tests
    const initialCoins = profileService.getProfile().coins;
    profileService.addCoins(20);
    assert(profileService.getProfile().coins === initialCoins + 20, "ProfileService.addCoins increases balance");
    const canDeduct = profileService.removeCoins(10);
    assert(canDeduct && profileService.getProfile().coins === initialCoins + 10, "ProfileService.removeCoins deducts balance");

    // 5. TaskService Tests
    const initialTasksCount = taskServiceModule.getTasks().length;
    const newTask = taskServiceModule.createTask({
      title: "Test Task",
      category: "Development",
      priority: "high",
      xpReward: 30,
    });
    assert(taskServiceModule.getTasks().length === initialTasksCount + 1, "TaskService.createTask adds new task");
    taskServiceModule.deleteTask(newTask.id);
    assert(taskServiceModule.getTasks().length === initialTasksCount, "TaskService.deleteTask removes task");

    // 6. ProjectService Tests
    const projects = projectServiceModule.getProjects();
    assert(projects.length > 0, "ProjectService returns seed projects");
    const firstProject = projects[0];
    assert(firstProject && typeof firstProject.title === "string", "Project has valid title property");

    // 7. NotesService Tests
    const notes = notesServiceModule.getNotes();
    assert(notes.length > 0, "NotesService returns seed notes");
    const searchResults = notesServiceModule.getNotes({ search: notes[0].title.slice(0, 4) });
    assert(searchResults.length > 0, "NotesService.search finds matching query");

    // 8. GymService Tests
    const exercises = gymServiceModule.getExercises();
    const days = gymServiceModule.getWorkoutDays();
    assert(Array.isArray(exercises) && Array.isArray(days), "GymService returns valid exercises and workout days arrays");

    // 9. JapaneseService Tests
    const jpProgress = japaneseServiceModule.getProgress();
    assert(typeof jpProgress.level === "number", "JapaneseService progress has numeric level");

    // 10. MusicService Tests
    const playlists = musicServiceModule.getPlaylists();
    assert(Array.isArray(playlists), "MusicService returns playlists array");

    // 11. AnimeService Tests
    const animeStats = animeServiceModule.getStats();
    assert(typeof animeStats.episodesWatched === "number", "AnimeService stats track episodesWatched");

  } catch (err) {
    log.push(`[Error] Test execution error: ${err}`);
  }

  return { passed, failed, log };
}
