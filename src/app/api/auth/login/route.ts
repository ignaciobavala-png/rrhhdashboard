import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export async function POST(request: Request) {
  const { pin } = (await request.json()) as { pin?: string };

  if (!pin || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN de 6 dígitos requerido' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('verify_pin', { pin });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = data as {
    ok: boolean;
    locked?: boolean;
    retry_seconds?: number;
    remaining?: number;
  };

  if (!result.ok) {
    if (result.locked) {
      const min = Math.ceil((result.retry_seconds ?? 300) / 60);
      return NextResponse.json(
        { error: `Demasiados intentos. Probá de nuevo en ${min} min.` },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: `PIN incorrecto. Te quedan ${result.remaining ?? 0} intentos.` },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE
  });
  return response;
}
