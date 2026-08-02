import React from "react";

export type WidgetComponent = React.ComponentType<{
  widgetId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigateToModule?: (tabId: string) => void;
}>;

export class WidgetRegistry {
  private registry: Map<string, WidgetComponent> = new Map();

  /**
   * Registers a widget component for a widget ID.
   */
  public registerWidget(widgetId: string, component: WidgetComponent): void {
    this.registry.set(widgetId, component);
  }

  /**
   * Returns registered component for widgetId.
   */
  public getWidgetComponent(widgetId: string): WidgetComponent | undefined {
    return this.registry.get(widgetId);
  }

  /**
   * Checks if widgetId has a registered component.
   */
  public hasWidget(widgetId: string): boolean {
    return this.registry.has(widgetId);
  }
}

export const widgetRegistry = new WidgetRegistry();
