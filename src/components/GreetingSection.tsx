import { useState } from "react";
import { getRandomQuote } from "../utils/quoteService";

export function getGreetingTimeText(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return "Good Morning,";
  }
  if (hours >= 12 && hours < 17) {
    return "Good Afternoon,";
  }
  if (hours >= 17 && hours < 21) {
    return "Good Evening,";
  }
  return "Good Night,";
}

export function GreetingSection() {
  const [quote] = useState(() => getRandomQuote());
  const greeting = getGreetingTimeText();

  return (
    <div className="greeting-container">
      <div className="greeting-text-group">
        <h1 className="greeting-salutation">{greeting}</h1>
        <h2 className="greeting-username">Sudarshan!</h2>
      </div>

      <div className="greeting-quote-block">
        <span className="quote-mark">“</span>
        <p className="quote-text">{quote.text}</p>
        <span className="quote-mark">”</span>
      </div>
    </div>
  );
}
