import { ChatInterface } from '@/features/ai-assistant/components/chat-interface';

export default function AssistantPage() {
  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col'>
      <ChatInterface />
    </div>
  );
}
