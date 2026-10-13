/**
 * Security Cryptography Service
 * Utilizes native Web Crypto API (SubtleCrypto) for high-entropy secure operations:
 * - PBKDF2-SHA256 password hashing with random salt
 * - Cryptographically secure token generation
 * - Password strength and entropy analysis
 */

export interface HashResult {
  hash: string;
  salt: string;
}

/**
 * Generate a cryptographically secure random hex string
 */
export function generateSecureRandomToken(byteLength: number = 32): string {
  const bytes = new Uint8Array(byteLength);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a password using PBKDF2 with SHA-256 and salt
 */
export async function hashPassword(password: string, existingSalt?: string): Promise<HashResult> {
  const enc = new TextEncoder();
  const saltBytes = existingSalt
    ? new Uint8Array(existingSalt.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
    : window.crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedKey))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const saltHex = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { hash: hashHex, salt: saltHex };
}

/**
 * Verify a candidate password against an existing hash and salt
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  try {
    const computed = await hashPassword(password, salt);
    // Constant-time comparison
    if (computed.hash.length !== hash.length) return false;
    let diff = 0;
    for (let i = 0; i < hash.length; i++) {
      diff |= computed.hash.charCodeAt(i) ^ hash.charCodeAt(i);
    }
    return diff === 0;
  } catch (err) {
    return false;
  }
}

export interface PasswordStrength {
  score: number; // 0 to 4
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
}

/**
 * Strict password complexity evaluator
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  if (!password) {
    return { score: 0, level: 'weak', feedback: ['Password is required'] };
  }

  let score = 0;
  if (password.length >= 8) score++;
  else feedback.push('Minimum 8 characters');

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('At least one uppercase letter (A-Z)');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('At least one lowercase letter (a-z)');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('At least one number (0-9)');

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  else feedback.push('At least one special symbol (!@#$%...)');

  // Normalize score into 0-4
  const normalized = Math.min(4, Math.max(0, Math.floor((score / 6) * 4)));
  const levels: ('weak' | 'fair' | 'good' | 'strong')[] = ['weak', 'fair', 'good', 'strong'];
  const level = levels[Math.min(3, normalized)];

  return { score: normalized, level, feedback };
}
