import { useEffect } from "react";
import { NAV_TABS } from "../constants/appConstants";

interface KeyboardShortcutOptions {
  onSelectTab?: (tabId: string) => void;
  onEscape?: () => void;
}

/**
 * Custom hook providing global keyboard shortcuts across the application:
 * - '1' through '9': Quick tab navigation
 * - 'Escape': Closes modals, overlays, or active detail panels
 */
export function useKeyboardShortcuts({
  onSelectTab,
  onEscape,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore keybindings when user is typing inside input/textarea/contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        if (event.key === "Escape") {
          target.blur();
          onEscape?.();
        }
        return;
      }

      if (event.key === "Escape") {
        onEscape?.();
        return;
      }

      // Numbers 1-9 for quick tab navigation
      const numKey = parseInt(event.key, 10);
      if (!isNaN(numKey) && numKey >= 1 && numKey <= NAV_TABS.length) {
        const targetTab = NAV_TABS[numKey - 1];
        if (targetTab && onSelectTab) {
          event.preventDefault();
          onSelectTab(targetTab.id);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSelectTab, onEscape]);
}
