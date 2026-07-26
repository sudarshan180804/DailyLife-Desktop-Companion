import breakfastBg from "../assets/backgrounds/breakfast.jpeg";
import workat11amBg from "../assets/backgrounds/workat11am.jpeg";
import lunchat1Bg from "../assets/backgrounds/lunchat1.jpeg";
import middayBg from "../assets/backgrounds/midday.jpeg";
import workoutat6Bg from "../assets/backgrounds/workoutat6.jpeg";
import nightBg from "../assets/backgrounds/night.jpeg";
import dinnerBg from "../assets/backgrounds/dinner.jpeg";
import nightreadBg from "../assets/backgrounds/nightread.jpeg";
import midnightBg from "../assets/backgrounds/midnight.jpeg";

export type TimePeriod =
  | "breakfast"
  | "workat11am"
  | "lunchat1"
  | "midday"
  | "workoutat6"
  | "night"
  | "dinner"
  | "nightread"
  | "midnight";

export const PERIOD_BACKGROUNDS: Record<TimePeriod, string> = {
  breakfast: breakfastBg,
  workat11am: workat11amBg,
  lunchat1: lunchat1Bg,
  midday: middayBg,
  workoutat6: workoutat6Bg,
  night: nightBg,
  dinner: dinnerBg,
  nightread: nightreadBg,
  midnight: midnightBg,
};

export const DEFAULT_BACKGROUND = nightBg;

/**
 * Returns current TimePeriod according to user's local system time.
 * Time Ranges:
 * 05:00 - 08:59 -> breakfast
 * 09:00 - 11:59 -> workat11am
 * 12:00 - 13:59 -> lunchat1
 * 14:00 - 17:29 -> midday
 * 17:30 - 18:59 -> workoutat6
 * 19:00 - 20:29 -> night
 * 20:30 - 21:29 -> dinner
 * 21:30 - 23:59 -> nightread
 * 00:00 - 04:59 -> midnight
 */
export function getTimePeriod(date: Date = new Date()): TimePeriod {
  try {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // 05:00 - 08:59 (300 to 539)
    if (totalMinutes >= 300 && totalMinutes <= 539) {
      return "breakfast";
    }
    // 09:00 - 11:59 (540 to 719)
    if (totalMinutes >= 540 && totalMinutes <= 719) {
      return "workat11am";
    }
    // 12:00 - 13:59 (720 to 839)
    if (totalMinutes >= 720 && totalMinutes <= 839) {
      return "lunchat1";
    }
    // 14:00 - 17:29 (840 to 1049)
    if (totalMinutes >= 840 && totalMinutes <= 1049) {
      return "midday";
    }
    // 17:30 - 18:59 (1050 to 1139)
    if (totalMinutes >= 1050 && totalMinutes <= 1139) {
      return "workoutat6";
    }
    // 19:00 - 20:29 (1140 to 1229)
    if (totalMinutes >= 1140 && totalMinutes <= 1229) {
      return "night";
    }
    // 20:30 - 21:29 (1230 to 1289)
    if (totalMinutes >= 1230 && totalMinutes <= 1289) {
      return "dinner";
    }
    // 21:30 - 23:59 (1290 to 1439)
    if (totalMinutes >= 1290 && totalMinutes <= 1439) {
      return "nightread";
    }
    // 00:00 - 04:59 (0 to 299)
    return "midnight";
  } catch (err) {
    console.error("Failed to determine time period:", err);
    return "night";
  }
}

/**
 * Returns background image URL based on local system time.
 * Falls back to DEFAULT_BACKGROUND if lookup fails.
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
