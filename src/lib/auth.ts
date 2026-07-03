// Sesión firmada con HMAC-SHA256 vía Web Crypto: compatible con Edge (middleware)
// y Node (route handlers). El token es `exp.firma` donde exp es epoch en segundos.

export const SESSION_COOKIE = 'rrhh_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET no configurada');
  return secret;
}

async function hmacKey(usage: KeyUsage): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

function toBase64Url(buf: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(buf)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function createSessionToken(): Promise<string> {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE);
  const key = await hmacKey('sign');
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(exp));
  return `${exp}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  try {
    const key = await hmacKey('verify');
    return await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(sig) as BufferSource,
      new TextEncoder().encode(exp)
    );
  } catch {
    return false;
  }
}
