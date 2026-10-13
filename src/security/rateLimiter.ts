/**
 * Anti-Brute-Force & Rate Limiting Module
 * Defends authentication endpoints against credential stuffing and password dictionary attacks.
 */

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const STORAGE_KEY = 'speedjobs_security_rate_limits_v1';

class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private maxAttempts: number = 5;
  private windowMs: number = 60 * 1000; // 1 minute window
  private lockoutDurationMs: number = 90 * 1000; // 90 seconds lockout

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const [key, val] of Object.entries(parsed)) {
          this.attempts.set(key, val as AttemptRecord);
        }
      }
    } catch {}
  }

  private saveState() {
    try {
      const obj: Record<string, AttemptRecord> = {};
      for (const [key, val] of this.attempts.entries()) {
        obj[key] = val;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {}
  }

  /**
   * Check if an action is currently blocked by rate limit
   */
  public isBlocked(identifier: string): { blocked: boolean; remainingSeconds: number } {
    const key = identifier.toLowerCase().trim();
    const record = this.attempts.get(key);
    const now = Date.now();

    if (!record) return { blocked: false, remainingSeconds: 0 };

    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { blocked: true, remainingSeconds };
    }

    // Lock expired: reset
    if (record.lockedUntil && record.lockedUntil <= now) {
      this.attempts.delete(key);
      this.saveState();
      return { blocked: false, remainingSeconds: 0 };
    }

    // Sliding window expiration
    if (now - record.firstAttempt > this.windowMs) {
      this.attempts.delete(key);
      this.saveState();
      return { blocked: false, remainingSeconds: 0 };
    }

    return { blocked: false, remainingSeconds: 0 };
  }

  /**
   * Record a failed attempt. If exceeding threshold, triggers lockout.
   */
  public recordFailure(identifier: string): {
    locked: boolean;
    remainingAttempts: number;
    lockoutSeconds: number;
  } {
    const key = identifier.toLowerCase().trim();
    const now = Date.now();
    let record = this.attempts.get(key);

    if (!record || now - record.firstAttempt > this.windowMs) {
      record = { count: 1, firstAttempt: now, lockedUntil: null };
    } else {
      record.count += 1;
    }

    if (record.count >= this.maxAttempts) {
      record.lockedUntil = now + this.lockoutDurationMs;
      this.attempts.set(key, record);
      this.saveState();
      return {
        locked: true,
        remainingAttempts: 0,
        lockoutSeconds: Math.ceil(this.lockoutDurationMs / 1000),
      };
    }

    this.attempts.set(key, record);
    this.saveState();
    return {
      locked: false,
      remainingAttempts: this.maxAttempts - record.count,
      lockoutSeconds: 0,
    };
  }

  /**
   * Clear failed attempts upon successful login/verification
   */
  public recordSuccess(identifier: string) {
    const key = identifier.toLowerCase().trim();
    this.attempts.delete(key);
    this.saveState();
  }
}

export const rateLimiter = new RateLimiter();
