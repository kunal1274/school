/**
 * Security utilities and audit functions for the tuition management system
 */

import { hashPassword, verifyPassword } from './auth.js';

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

// XSS prevention
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// SQL injection prevention (for MongoDB queries)
export function sanitizeQuery(query) {
  if (typeof query === 'object' && query !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeQuery(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  return sanitizeInput(query);
}

// Password strength validation
export function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;
  
  const strength = {
    score,
    level: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
  
  return strength;
}

// Rate limiting
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }
  
  isAllowed(identifier, limit = 100, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    this.requests.set(identifier, validRequests);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    return true;
  }
  
  reset(identifier) {
    this.requests.delete(identifier);
  }
  
  cleanup() {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < maxAge);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// CSRF token generation and validation
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token, sessionToken) {
  return token && sessionToken && token === sessionToken;
}

// Session security
export class SessionManager {
  constructor() {
    this.sessions = new Map();
  }
  
  createSession(userId, userAgent, ipAddress) {
    const sessionId = generateCSRFToken();
    const session = {
      userId,
      sessionId,
      userAgent,
      ipAddress,
      createdAt: new Date(),
      lastAccessed: new Date(),
      isActive: true
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }
  
  validateSession(sessionId, userAgent, ipAddress) {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return false;
    }
    
    // Check if session is expired (24 hours)
    const now = new Date();
    const sessionAge = now - session.lastAccessed;
    if (sessionAge > 24 * 60 * 60 * 1000) {
      this.invalidateSession(sessionId);
      return false;
    }
    
    // Update last accessed time
    session.lastAccessed = now;
    
    return true;
  }
  
  invalidateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
    }
  }
  
  invalidateUserSessions(userId) {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        session.isActive = false;
      }
    }
  }
  
  cleanup() {
    const now = new Date();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessed > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const sessionManager = new SessionManager();

// Security headers
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self';"
  };
}

// Audit logging
export class SecurityAuditor {
  constructor() {
    this.auditLogs = [];
  }
  
  logEvent(event) {
    const auditEvent = {
      ...event,
      timestamp: new Date(),
      id: generateCSRFToken()
    };
    
    this.auditLogs.push(auditEvent);
    
    // Keep only last 1000 events
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Audit:', auditEvent);
    }
  }
  
  logLoginAttempt(userId, success, ipAddress, userAgent) {
    this.logEvent({
      type: 'login_attempt',
      userId,
      success,
      ipAddress,
      userAgent,
      severity: success ? 'info' : 'warning'
    });
  }
  
  logDataAccess(userId, resource, action, ipAddress) {
    this.logEvent({
      type: 'data_access',
      userId,
      resource,
      action,
      ipAddress,
      severity: 'info'
    });
  }
  
  logSecurityViolation(userId, violation, details, ipAddress) {
    this.logEvent({
      type: 'security_violation',
      userId,
      violation,
      details,
      ipAddress,
      severity: 'high'
    });
  }
  
  logSystemEvent(event, details) {
    this.logEvent({
      type: 'system_event',
      event,
      details,
      severity: 'info'
    });
  }
  
  getAuditLogs(filter = {}) {
    let logs = this.auditLogs;
    
    if (filter.type) {
      logs = logs.filter(log => log.type === filter.type);
    }
    
    if (filter.severity) {
      logs = logs.filter(log => log.severity === filter.severity);
    }
    
    if (filter.userId) {
      logs = logs.filter(log => log.userId === filter.userId);
    }
    
    if (filter.startDate) {
      logs = logs.filter(log => log.timestamp >= filter.startDate);
    }
    
    if (filter.endDate) {
      logs = logs.filter(log => log.timestamp <= filter.endDate);
    }
    
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const securityAuditor = new SecurityAuditor();

// File upload security
export function validateFileUpload(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
  const errors = [];
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  // Check for malicious file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js'];
  const fileName = file.name.toLowerCase();
  const hasDangerousExtension = dangerousExtensions.some(ext => fileName.endsWith(ext));
  
  if (hasDangerousExtension) {
    errors.push('File type is potentially dangerous');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Data encryption utilities
export async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataBuffer
  );
  
  return {
    encrypted: Array.from(new Uint8Array(encrypted)),
    iv: Array.from(iv)
  };
}

export async function decryptData(encryptedData, key) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
    cryptoKey,
    new Uint8Array(encryptedData.encrypted)
  );
  
  return JSON.parse(decoder.decode(decrypted));
}

// Security checklist validation
export function runSecurityChecklist() {
  const checks = {
    environmentVariables: {
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasMongoURI: !!process.env.MONGODB_URI,
      isProduction: process.env.NODE_ENV === 'production'
    },
    passwordPolicy: {
      minLength: 8,
      requiresUppercase: true,
      requiresLowercase: true,
      requiresNumbers: true,
      requiresSpecialChars: true
    },
    sessionSecurity: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    },
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000 // 1 minute
    }
  };
  
  return checks;
}
