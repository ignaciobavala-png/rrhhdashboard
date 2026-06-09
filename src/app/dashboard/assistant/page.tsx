'use client';

import { useState, useCallback } from 'react';
import { ChatInterface } from '@/features/ai-assistant/components/chat-interface';
import { ActionLog } from '@/features/ai-assistant/components/action-log';
import type { LogEntry } from '@/features/ai-assistant/components/action-log';
import type { ProposedAction } from '@/features/ai-assistant/api/types';

export default function AssistantPage() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  const addLogEntry = useCallback((entry: Omit<LogEntry, 'id'>) => {
    setLogEntries((prev) => [...prev, { ...entry, id: crypto.randomUUID() }]);
  }, []);

  const updateLogAction = useCallback((entryId: string, action: ProposedAction) => {
    setLogEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, action } : e)));
  }, []);

  return (
    <div className='flex h-[calc(100vh-4rem)] divide-x'>
      <div className='flex-1 min-w-0'>
        <ChatInterface onLogEntry={addLogEntry} onLogActionUpdate={updateLogAction} />
      </div>
      <div className='w-72 shrink-0'>
        <ActionLog entries={logEntries} />
      </div>
    </div>
  );
}
