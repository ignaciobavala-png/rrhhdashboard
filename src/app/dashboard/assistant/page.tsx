'use client';

import { useState, useCallback } from 'react';
import { ChatInterface } from '@/features/ai-assistant/components/chat-interface';
import { ActionLog } from '@/features/ai-assistant/components/action-log';
import { SessionList } from '@/features/ai-assistant/components/session-list';
import type { LogEntry } from '@/features/ai-assistant/components/action-log';
import type { ProposedAction, ChatMessage } from '@/features/ai-assistant/api/types';

export default function AssistantPage() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<ChatMessage[]>([]);
  const [chatKey, setChatKey] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const addLogEntry = useCallback((entry: Omit<LogEntry, 'id'>) => {
    setLogEntries((prev) => [...prev, { ...entry, id: crypto.randomUUID() }]);
  }, []);

  const updateLogAction = useCallback((entryId: string, action: ProposedAction) => {
    setLogEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, action } : e)));
  }, []);

  const handleSelectSession = useCallback((sessionId: string, messages: ChatMessage[]) => {
    setActiveSessionId(sessionId);
    setLoadedMessages(messages);
    setLogEntries([]);
    setChatKey((k) => k + 1);
  }, []);

  const handleNewSession = useCallback(() => {
    setActiveSessionId(null);
    setLoadedMessages([]);
    setLogEntries([]);
    setChatKey((k) => k + 1);
  }, []);

  const handleSessionCreated = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setRefreshTrigger((n) => n + 1);
  }, []);

  return (
    <div className='flex h-[calc(100vh-4rem)] divide-x overflow-hidden'>
      <div className='hidden md:block w-52 shrink-0'>
        <SessionList
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          refreshTrigger={refreshTrigger}
        />
      </div>
      <div className='flex-1 min-w-0'>
        <ChatInterface
          key={chatKey}
          initialSessionId={activeSessionId}
          initialMessages={loadedMessages}
          onLogEntry={addLogEntry}
          onLogActionUpdate={updateLogAction}
          onSessionCreated={handleSessionCreated}
        />
      </div>
      <div className='hidden md:block w-72 shrink-0'>
        <ActionLog entries={logEntries} />
      </div>
    </div>
  );
}
