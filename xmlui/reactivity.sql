-- Reactivity events tracking table
CREATE TABLE IF NOT EXISTS reactivity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  event_type TEXT NOT NULL,
  component_type TEXT,
  component_id TEXT,
  message TEXT,
  data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient querying of recent events
CREATE INDEX IF NOT EXISTS idx_reactivity_timestamp ON reactivity_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_reactivity_type ON reactivity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_reactivity_component ON reactivity_events(component_id);

-- Sample event types we'll track:
-- 'component_render'
-- 'datasource_status_change' 
-- 'api_call_start'
-- 'api_call_success'
-- 'api_call_error'
-- 'variable_change'
-- 'dependency_change'
-- 'reactivity_trigger'
