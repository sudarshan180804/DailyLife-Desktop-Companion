import breakfastBg from "../assets/backgrounds/breakfast.jpeg";
import workat11amBg from "../assets/backgrounds/workat11am.jpeg";
import lunchat1Bg from "../assets/backgrounds/lunchat1.jpeg";
import middayBg from "../assets/backgrounds/midday.jpeg";
import workoutat6Bg from "../assets/backgrounds/workoutat6.jpeg";
import nightBg from "../assets/backgrounds/night.jpeg";
import defaultBg from "../assets/backgrounds/default.jpeg";

export type TimePeriod =
  | "breakfast"
  | "workat11am"
  | "lunchat1"
  | "midday"
  | "workoutat6"
  | "night";

export const PERIOD_BACKGROUNDS: Record<TimePeriod, string> = {
  breakfast: breakfastBg,
  workat11am: workat11amBg,
  lunchat1: lunchat1Bg,
  midday: middayBg,
  workoutat6: workoutat6Bg,
  night: nightBg,
};

export const DEFAULT_BACKGROUND = defaultBg;

/**
 * Returns the current TimePeriod according to user's local system time.
 * Time Ranges:
 * 05:00 - 08:59 -> breakfast
 * 09:00 - 11:59 -> workat11am
 * 12:00 - 13:59 -> lunchat1
 * 14:00 - 17:29 -> midday
 * 17:30 - 20:29 -> workoutat6
 * 20:30 - 04:59 -> night
 */
export function getTimePeriod(date: Date = new Date()): TimePeriod {
  try {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes >= 300 && totalMinutes <= 539) {
      return "breakfast";
    }
    if (totalMinutes >= 540 && totalMinutes <= 719) {
      return "workat11am";
    }
    if (totalMinutes >= 720 && totalMinutes <= 839) {
      return "lunchat1";
    }
    if (totalMinutes >= 840 && totalMinutes <= 1049) {
      return "midday";
    }
    if (totalMinutes >= 1050 && totalMinutes <= 1229) {
      return "workoutat6";
    }
    // 20:30 - 04:59
    return "night";
  } catch (err) {
    console.error("Failed to determine time period:", err);
    return "night";
  }
}

/**
 * Returns background image URL based on local system time.
 * Falls back to default.jpeg if time period lookup fails.
 */
export function getBackgroundForTime(date: Date = new Date()): string {
  try {
    const period = getTimePeriod(date);
    return PERIOD_BACKGROUNDS[period] || DEFAULT_BACKGROUND;
  } catch (err) {
    console.error("Failed to load background for time, using fallback:", err);
    return DEFAULT_BACKGROUND;
  }
}
