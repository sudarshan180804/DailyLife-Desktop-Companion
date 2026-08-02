import { useState, useEffect } from "react";
import { useProfileStore } from "../../stores/profileStore";
import { getRandomQuote } from "../../utils/quoteService";
import {
  contextEngine,
  widgetRegistry,
  CurrentContextState,
  ActiveWidgetResult,
} from "../../modules/context";
import { ContextCustomizeModal } from "./ContextCustomizeModal";
import { eventBus } from "../../services/eventBus";
import "./widgets"; // Trigger widget registration

interface HomePageProps {
  onNavigateToModule: (tabId: string) => void;
}

export function HomePage({ onNavigateToModule }: HomePageProps) {
  const { profile } = useProfileStore();
  const [quote] = useState(() => getRandomQuote());

  // Context State
  const [context, setContext] = useState<CurrentContextState>(() =>
    contextEngine.getCurrentContext()
  );
  const [activeWidgets, setActiveWidgets] = useState<ActiveWidgetResult[]>(() =>
    contextEngine.getActiveWidgets()
  );

  // Collapsed state map per widget
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState<boolean>(false);

  const refreshContext = () => {
    setContext(contextEngine.getCurrentContext());
    setActiveWidgets(contextEngine.getActiveWidgets());
  };

  useEffect(() => {
    refreshContext();

    // Re-evaluate context every 60 seconds
    const interval = setInterval(refreshContext, 60000);

    const unsub = eventBus.subscribe("context:updated", refreshContext);

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  const toggleCollapse = (widgetId: string) => {
    setCollapsedMap((prev) => ({ ...prev, [widgetId]: !prev[widgetId] }));
  };

  const getGreetingText = (timeOfDay: CurrentContextState["timeOfDay"]) => {
    switch (timeOfDay) {
      case "morning":
        return "Good Morning";
      case "afternoon":
        return "Good Afternoon";
      case "evening":
        return "Good Evening";
      case "night":
        return "Good Night";
    }
  };

  const getContextIcon = (timeOfDay: CurrentContextState["timeOfDay"]) => {
    switch (timeOfDay) {
      case "morning":
        return "🌅";
      case "afternoon":
        return "☀️";
      case "evening":
        return "🌇";
      case "night":
        return "🌙";
    }
  };

  return (
    <div className="context-home-container">
      {/* Ambient Context Header */}
      <div className="home-context-header">
        <div className="context-header-left">
          <div className="context-greeting-row">
            <h1 className="home-salutation">
              {getGreetingText(context.timeOfDay)}, {profile.name}!
            </h1>

            <div className="context-badge-pill">
              <span className="context-badge-icon">{getContextIcon(context.timeOfDay)}</span>
              <span className="context-badge-txt">
                {context.timeOfDay.toUpperCase()} FOCUS • {context.dayName} ({context.timeString})
              </span>
            </div>
          </div>

          <p className="home-quote-text">“{quote.text}”</p>
        </div>

        <div className="context-header-right">
          <div className="context-stats-group">
            <span className="context-stat-item">
              <span className="stat-label">Level</span>
              <span className="stat-val">{profile.level}</span>
            </span>
            <span className="context-stat-item">
              <span className="stat-label">Active Context Widgets</span>
              <span className="stat-val gold-txt">{activeWidgets.length}</span>
            </span>
          </div>

          <button
            className="btn-context-config"
            onClick={() => setIsCustomizeModalOpen(true)}
            title="Configure Context Engine & Widget Schedule"
          >
            ⚙️ Context & Widgets
          </button>
        </div>
      </div>

      {/* Main Context-Driven Widgets Grid */}
      {activeWidgets.length > 0 ? (
        <div className="context-widgets-grid">
          {activeWidgets.map(({ config, score, reason }) => {
            const WidgetComp = widgetRegistry.getWidgetComponent(config.id);
            if (!WidgetComp) return null;

            const isCollapsed = Boolean(
              collapsedMap[config.id] ?? config.collapsedByDefault
            );

            return (
              <div
                key={config.id}
                className={`context-widget-wrapper size-${config.widgetSize} ${
                  isCollapsed ? "collapsed" : ""
                }`}
              >
                <div className="widget-card-shell">
                  {/* Top Shell Controls Bar */}
                  <div className="widget-shell-header">
                    <div className="shell-left-info">
                      <span className="shell-module-tag">{config.module.toUpperCase()}</span>
                      <span className="shell-context-reason">💡 {reason}</span>
                    </div>

                    <div className="shell-right-controls">
                      <span className="shell-score-badge">Score: {score}</span>
                      <button
                        className="shell-collapse-btn"
                        onClick={() => toggleCollapse(config.id)}
                        title={isCollapsed ? "Expand Widget" : "Collapse Widget"}
                      >
                        {isCollapsed ? "▼ Expand" : "▲ Collapse"}
                      </button>
                    </div>
                  </div>

                  {/* Widget Body Content */}
                  {!isCollapsed && (
                    <div className="widget-shell-content">
                      <WidgetComp
                        widgetId={config.id}
                        onNavigateToModule={onNavigateToModule}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="home-empty-context-state">
          <span className="empty-icon">🌙</span>
          <h3>Quiet Context Mode</h3>
          <p>
            No module widgets are currently scheduled for {context.timeOfDay} on {context.dayName}.
          </p>

          <button
            className="btn-context-config margin-top-12"
            onClick={() => setIsCustomizeModalOpen(true)}
          >
            ⚙️ Customize Context & Widget Schedule
          </button>
        </div>
      )}

      {/* Context Config Modal */}
      <ContextCustomizeModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        onSaved={refreshContext}
      />
    </div>
  );
}
