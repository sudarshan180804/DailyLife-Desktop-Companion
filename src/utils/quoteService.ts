import { quotes, Quote } from "../data/quotes";

/**
 * Returns a randomly selected Quote from the quote dataset.
 */
export function getRandomQuote(): Quote {
  if (!quotes || quotes.length === 0) {
    return { text: "Focus on the present moment and take action." };
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
