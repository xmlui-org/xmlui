// Centralized reactivity debugging configuration and utilities

export interface ReactivityDebugConfig {
  enabled: boolean;
  level: 'minimal' | 'detailed' | 'verbose';
  focus: {
    components?: string[]; // Specific component IDs to focus on
    apiCalls?: boolean;
    stateChanges?: boolean;
    userInteractions?: boolean;
    renderStorms?: boolean;
  };
  output: {
    actionable: boolean; // Only show logs with suggested actions
    correlateEvents: boolean; // Group related events together
    suppressNoisy: boolean; // Filter out excessive render logs
  };
}

export class ReactivityDebugger {
  private static config: ReactivityDebugConfig = {
    enabled: true,  // Changed: enable by default but with smart defaults
    level: 'minimal',
    focus: {
      renderStorms: true,  // Always show render storms - they're critical
      apiCalls: true,      // Always show API issues - they're actionable
      stateChanges: false, // Off by default - too noisy
      userInteractions: false // Off by default - too noisy
    },
    output: {
      actionable: true,      // Only show actionable logs by default
      correlateEvents: true,
      suppressNoisy: true
    }
  };

  private static eventCorrelationWindow = new Map<string, {
    events: Array<{ type: string; timestamp: number; data: any }>;
    windowStart: number;
  }>();

  private static readonly CORRELATION_WINDOW_MS = 5000;
  private static readonly RENDER_STORM_THRESHOLD = 10;

  // Track query invalidation cascades
  private static queryInvalidationCounts = new Map<string, {
    count: number;
    lastReset: number;
    invalidationChain: string[];
  }>();
  private static readonly INVALIDATION_CASCADE_THRESHOLD = 3;

  static configure(config: Partial<ReactivityDebugConfig>) {
    this.config = { ...this.config, ...config };
    
    // Initialize global logging object for backward compatibility
    (window as any).logReactivity = {
      enabled: this.config.enabled,
      components: this.config.focus.components || this.config.enabled,
      stateChanges: this.config.focus.stateChanges || this.config.enabled,
      userInteractions: this.config.focus.userInteractions || this.config.enabled,
      apiTracking: this.config.focus.apiCalls || this.config.enabled,
      queryKeys: this.config.focus.apiCalls || this.config.enabled,
      cascade: this.config.enabled,
      stackTraces: this.config.level === 'verbose'
    };

    console.log('[🔧 REACTIVITY DEBUG] Configuration updated:', this.config);
  }

  static shouldLog(category: keyof ReactivityDebugConfig['focus'], componentId?: string): boolean {
    // Check window.logReactivity first for backward compatibility
    if (typeof window !== 'undefined') {
      const windowConfig = (window as any).logReactivity;
      if (windowConfig && typeof windowConfig === 'object') {
        if (!windowConfig.enabled) return false;
        
        // Map categories to window config properties
        const categoryMap = {
          renderStorms: windowConfig.cascade || windowConfig.components,
          apiCalls: windowConfig.queryKeys || windowConfig.apiTracking,
          stateChanges: windowConfig.stateChanges,
          userInteractions: windowConfig.userInteractions
        };
        
        const shouldLogCategory = categoryMap[category];
        if (shouldLogCategory === false) return false;
        
        // Check component focusing
        if (windowConfig.focusComponents && Array.isArray(windowConfig.focusComponents) && componentId) {
          if (!windowConfig.focusComponents.includes(componentId)) return false;
        }
        
        return shouldLogCategory !== false;
      }
    }
    
    // Fallback to internal config
    if (!this.config.enabled) return false;
    
    // If specific components are configured, only log those
    if (this.config.focus.components?.length && componentId) {
      if (!this.config.focus.components.includes(componentId)) return false;
    }
    
    return this.config.focus[category] !== false;
  }

  static logWithAction(
    category: string,
    componentId: string,
    message: string,
    data: any,
    suggestedAction?: string,
    logCategory: keyof ReactivityDebugConfig['focus'] = 'stateChanges'
  ) {
    if (!this.shouldLog(logCategory, componentId)) return;

    // Check if we should only show actionable logs
    const windowConfig = typeof window !== 'undefined' ? (window as any).logReactivity : null;
    const actionableOnly = windowConfig?.actionableOnly ?? this.config.output.actionable;
    
    // Only show actionable logs if configured AND there's no suggested action
    if (actionableOnly && !suggestedAction) return;

    const logEntry = {
      category,
      componentId,
      timestamp: Date.now(),
      message,
      data,
      suggestedAction
    };

    // Add to correlation window
    this.addToCorrelationWindow(componentId, {
      type: category,
      timestamp: logEntry.timestamp,
      data: logEntry
    });

    console.log(`[${category}] ${componentId}: ${message}`);
    
    const level = windowConfig?.level ?? this.config.level;
    if (level !== 'minimal') {
      console.log('Data:', data);
    }
    
    if (suggestedAction) {
      console.warn('💡 Suggested Action:', suggestedAction);
    }

    // Show correlated events if enabled
    const correlateEvents = windowConfig?.correlateEvents ?? this.config.output.correlateEvents;
    if (correlateEvents) {
      this.showCorrelatedEvents(componentId);
    }
  }

  static logRenderStorm(componentId: string, renderCount: number, timeWindow: number) {
    console.log('[🔍 DEBUG] logRenderStorm called:', { componentId, renderCount, timeWindow, shouldLog: this.shouldLog('renderStorms', componentId) });
    
    if (!this.shouldLog('renderStorms', componentId)) return;
    
    const suggestedAction = renderCount > 20 
      ? 'CRITICAL: Check for infinite re-render loop. Look for state updates in render functions or useEffect without proper dependencies.'
      : renderCount > this.RENDER_STORM_THRESHOLD
      ? 'WARNING: Frequent re-renders detected. Consider memoizing expensive computations or checking dependency arrays.'
      : undefined;

    this.logWithAction(
      '🚨 RENDER STORM',
      componentId,
      `${renderCount} renders in ${timeWindow/1000}s`,
      { renderCount, timeWindow, threshold: this.RENDER_STORM_THRESHOLD },
      suggestedAction,
      'renderStorms'
    );
  }

  static logQueryKeyChange(componentId: string, oldKey: any, newKey: any, url?: string) {
    console.log('[🔍 DEBUG] logQueryKeyChange called:', { componentId, shouldLog: this.shouldLog('apiCalls', componentId) });
    
    if (!this.shouldLog('apiCalls', componentId)) return;

    const suggestedAction = this.analyzeQueryKeyChange(oldKey, newKey);

    this.logWithAction(
      '🔄 API REFETCH',
      componentId,
      'Query key changed triggering new API call',
      { 
        oldKey: this.config.level === 'minimal' ? '[hidden]' : oldKey,
        newKey: this.config.level === 'minimal' ? '[hidden]' : newKey,
        url,
        changeType: typeof oldKey !== typeof newKey ? 'type_change' : 'value_change'
      },
      suggestedAction,
      'apiCalls'
    );
  }

  static logQueryInvalidation(componentId: string, invalidatedBy?: string, reason?: string) {
    if (!this.shouldLog('apiCalls', componentId)) return;

    const now = Date.now();
    const existing = this.queryInvalidationCounts.get(componentId);

    if (!existing || (now - existing.lastReset) > this.CORRELATION_WINDOW_MS) {
      this.queryInvalidationCounts.set(componentId, {
        count: 1,
        lastReset: now,
        invalidationChain: [invalidatedBy || 'unknown']
      });
    } else {
      existing.count++;
      if (invalidatedBy && !existing.invalidationChain.includes(invalidatedBy)) {
        existing.invalidationChain.push(invalidatedBy);
      }
    }

    const cascadeDetected = existing && existing.count >= this.INVALIDATION_CASCADE_THRESHOLD;
    
    if (cascadeDetected) {
      const suggestedAction = this.analyzeCascadePattern(existing.invalidationChain);
      
      this.logWithAction(
        '🔄 QUERY CASCADE',
        componentId,
        `Query invalidated ${existing.count} times in ${this.CORRELATION_WINDOW_MS/1000}s`,
        {
          invalidationChain: existing.invalidationChain,
          cascadePattern: this.detectCascadePattern(existing.invalidationChain),
          lastInvalidatedBy: invalidatedBy,
          reason
        },
        suggestedAction,
        'apiCalls'
      );
    } else {
      console.log(`[🔄 QUERY INVALIDATED] ${componentId} invalidated by ${invalidatedBy || 'unknown'}${reason ? ' (' + reason + ')' : ''}`);
    }
  }

  private static addToCorrelationWindow(componentId: string, event: any) {
    const now = Date.now();
    const window = this.eventCorrelationWindow.get(componentId) || {
      events: [],
      windowStart: now
    };

    // Clean old events
    window.events = window.events.filter(e => 
      (now - e.timestamp) < this.CORRELATION_WINDOW_MS
    );

    window.events.push(event);
    this.eventCorrelationWindow.set(componentId, window);
  }

  private static showCorrelatedEvents(componentId: string) {
    const window = this.eventCorrelationWindow.get(componentId);
    if (!window || window.events.length < 2) return;

    const recentEvents = window.events.slice(-3); // Show last 3 events
    console.log('🔗 Related events:', recentEvents.map(e => `${e.type} (${Date.now() - e.timestamp}ms ago)`));
  }

  private static detectCascadePattern(invalidationChain: string[]): string {
    if (invalidationChain.length <= 1) return 'single';
    
    const unique = new Set(invalidationChain);
    if (unique.size === 1) return 'self_invalidation_loop';
    if (unique.size === 2) return 'ping_pong_cascade';
    if (invalidationChain.length > unique.size * 2) return 'circular_cascade';
    return 'chain_cascade';
  }

  private static analyzeCascadePattern(invalidationChain: string[]): string {
    const pattern = this.detectCascadePattern(invalidationChain);
    
    switch (pattern) {
      case 'self_invalidation_loop':
        return 'CRITICAL: Query is invalidating itself. Check for state updates in onLoaded callbacks or circular dependencies.';
      case 'ping_pong_cascade':
        return `WARNING: Two queries invalidating each other: ${[...new Set(invalidationChain)].join(' ↔ ')}. Review their invalidates properties or shared dependencies.`;
      case 'circular_cascade':
        return 'CRITICAL: Multiple queries in circular invalidation. Map out query dependencies and break the cycle.';
      case 'chain_cascade':
        return `WARNING: Query chain reaction detected: ${invalidationChain.join(' → ')}. Consider batching updates or reducing invalidation scope.`;
      default:
        return 'Review query invalidation logic and dependencies.';
    }
  }

  private static analyzeQueryKeyChange(oldKey: any, newKey: any): string | undefined {
    if (!oldKey || !newKey) return undefined;

    // Check for common issues
    if (JSON.stringify(oldKey) === JSON.stringify(newKey)) {
      return 'Keys are deep equal but reference changed. Consider memoizing the key calculation.';
    }

    if (Array.isArray(oldKey) && Array.isArray(newKey) && oldKey.length !== newKey.length) {
      return 'Query key array length changed. Check if dependencies are being added/removed unexpectedly.';
    }

    return undefined;
  }
}

// Convenience function for quick setup
export function setupReactivityDebugging(options: {
  enabled?: boolean;
  focusComponents?: string[];
  level?: 'minimal' | 'detailed' | 'verbose';
  actionableOnly?: boolean;
} = {}) {
  ReactivityDebugger.configure({
    enabled: options.enabled ?? true,
    level: options.level ?? 'minimal',
    focus: {
      components: options.focusComponents,
      apiCalls: true,
      stateChanges: true,
      userInteractions: true,
      renderStorms: true
    },
    output: {
      actionable: options.actionableOnly ?? true,
      correlateEvents: true,
      suppressNoisy: true
    }
  });
}

// Export to window for standalone builds
if (typeof window !== 'undefined') {
  (window as any).ReactivityDebugger = ReactivityDebugger;
  (window as any).setupReactivityDebugging = setupReactivityDebugging;
  console.log('[🔧 REACTIVITY DEBUG] ReactivityDebugger exported to window');
}
