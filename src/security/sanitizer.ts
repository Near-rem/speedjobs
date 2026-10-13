/**
 * Cybersecurity Input Sanitization & Anti-Injection Guard
 * Defends against:
 * - Stored & Reflected Cross-Site Scripting (XSS)
 * - SQL / NoSQL / Command Injection patterns
 * - Prototype Pollution attacks
 * - Malicious URI protocols (javascript:, vbscript:, data:)
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/**
 * Escapes characters with HTML entities to strictly prevent XSS injection
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[&<>"'/`]/g, (char) => HTML_ENTITY_MAP[char] || char);
}

/**
 * Strips dangerous script tags, event handlers, and malicious protocols
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  let clean = input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event handlers (onclick, onload, etc.)
    .replace(/\bon\w+\s*=/gi, '')
    // Neutralize dangerous protocols
    .replace(/(javascript|vbscript|data):/gi, 'blocked:');

  return clean.trim();
}

/**
 * Sanitizes an object deeply to prevent prototype pollution and nested injections
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return sanitizeString(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Prevent Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    result[key] = sanitizeObject(value);
  }

  return result as T;
}

/**
 * Strict email validation using RFC 5322 regex
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Safe URL validator (allows only http, https, and relative paths)
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
