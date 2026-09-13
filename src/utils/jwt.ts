// RFC 7519 JWT Utility (Pure Client-Side Safe Mock with base64url encoding)
import { JWTPayload, JWTRole } from '../types';

function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Generate signed mock JWT (HS256 signature simulation)
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresInSeconds: number = 900): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  // Simulated HMAC-SHA256 signature using fixed mock secret
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  let hash = 0;
  for (let i = 0; i < signatureInput.length; i++) {
    const char = signatureInput.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const mockSignature = base64UrlEncode(`sig_pharmxpress_${Math.abs(hash).toString(16)}`);

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

export function verifyAndDecodeJWT(token: string): { valid: boolean; payload: JWTPayload | null; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, payload: null, error: 'Invalid JWT structure: must have 3 segments' };
    }

    const payloadJson = base64UrlDecode(parts[1]);
    const payload: JWTPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, payload, error: 'Token has expired' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, payload: null, error: err.message || 'Malformed token' };
  }
}

// Helper to inspect decoded segments for dev debugging
export function inspectJWTRaw(token: string): { header: any; payload: any; signature: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return {
      header: JSON.parse(base64UrlDecode(parts[0])),
      payload: JSON.parse(base64UrlDecode(parts[1])),
      signature: parts[2],
    };
  } catch {
    return null;
  }
}

// Permission checking based on role
export function canPerformAction(
  role: JWTRole,
  action: 'approve_disposal' | 'trigger_recall' | 'approve_return' | 'manage_pricing' | 'view_compliance' | 'place_order'
): boolean {
  switch (action) {
    case 'approve_disposal':
    case 'trigger_recall':
    case 'manage_pricing':
      return role === 'manufacturer_admin';
    case 'approve_return':
      return role === 'manufacturer_admin' || role === 'manufacturer_staff';
    case 'view_compliance':
      return role === 'manufacturer_admin' || role === 'manufacturer_staff';
    case 'place_order':
      return role === 'distributor';
    default:
      return false;
  }
}
