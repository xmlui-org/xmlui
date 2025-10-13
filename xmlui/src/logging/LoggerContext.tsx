import type React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

type LogEntry = {
  timestamp: Date;
  args: any[];
};

type LogContextType = {
  logs: LogEntry[];
  addLog: (args: any[]) => void;
};

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LoggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((args: any[]) => {
    const newEntry = { timestamp: new Date(), args };
    setLogs(prev => [...prev, newEntry]);
  }, []);

  return (
    <LogContext.Provider value={{ logs, addLog }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogger = () => {
  const context = useContext(LogContext);
  if (!context) throw new Error('useLogger must be used within LoggerProvider');
  return context;
};
