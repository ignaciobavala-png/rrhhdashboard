import { NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/features/ai-assistant/lib/system-prompt';
import type { ChatRequest } from '@/features/ai-assistant/api/types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'DEEPSEEK_API_KEY no configurada' }, { status: 500 });
  }

  const body = (await request.json()) as ChatRequest;
  const { messages, mode } = body;

  if (!messages?.length) {
    return NextResponse.json({ error: 'messages requerido' }, { status: 400 });
  }

  const systemPrompt = await buildSystemPrompt(mode ?? 'chat');
  // Visible en logs de Vercel: cuánto contexto se manda en cada mensaje
  console.warn(
    `[ai/chat] system prompt: ${systemPrompt.length} chars (~${Math.round(systemPrompt.length / 3.5)} tokens) | mode=${mode ?? 'chat'} | historial=${messages.length} mensajes`
  );

  const payload = {
    model: 'deepseek-chat',
    stream: true,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.3,
    max_tokens: 2048
  };

  const upstream = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    return NextResponse.json({ error: err }, { status: upstream.status });
  }

  // Stream the response directly to the client
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}
