// Portal Authentication Utilities
// Manages portal user sessions via secure tokens

export interface PortalSession {
  token: string;
  expiresAt: string;
  portalUserId: string;
  email: string;
}

/**
 * Set portal session in secure cookie
 */
export function setPortalSession(token: string, expiresAt: string, portalUserId: string, email: string): void {
  const sessionData: PortalSession = {
    token,
    expiresAt,
    portalUserId,
    email
  };
  
  // Store in localStorage for now (in production, use secure HTTP-only cookies)
  localStorage.setItem('portal_session', JSON.stringify(sessionData));
  
  // Also set a simple token cookie for compatibility
  document.cookie = `pt=${token}; Path=/; Max-Age=604800; Secure; SameSite=Lax`;
}

/**
 * Get current portal session
 */
export function getPortalSession(): PortalSession | null {
  try {
    const sessionData = localStorage.getItem('portal_session');
    if (!sessionData) return null;
    
    const session: PortalSession = JSON.parse(sessionData);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      clearPortalSession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Get portal token from session
 */
export function getPortalToken(): string | null {
  const session = getPortalSession();
  return session?.token || null;
}

/**
 * Get portal user ID from session
 */
export function getPortalUserId(): string | null {
  const session = getPortalSession();
  return session?.portalUserId || null;
}

/**
 * Get portal user email from session
 */
export function getPortalUserEmail(): string | null {
  const session = getPortalSession();
  return session?.email || null;
}

/**
 * Check if user has active portal session
 */
export function isPortalAuthenticated(): boolean {
  // Development bypass - always allow access in development
  if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
    return true;
  }
  return getPortalSession() !== null;
}

/**
 * Clear portal session
 */
export function clearPortalSession(): void {
  localStorage.removeItem('portal_session');
  document.cookie = 'pt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Validate portal token with server
 */
export async function validatePortalToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/portal/validate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) return false;
    
    const result = await response.json();
    return result.valid === true;
  } catch {
    return false;
  }
}

/**
 * Log portal user action for audit trail
 */
export async function logPortalAction(
  action: string, 
  resourceType?: string, 
  resourceId?: string
): Promise<void> {
  try {
    const session = getPortalSession();
    if (!session) return;
    
    await fetch('/api/portal/log-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        resourceType,
        resourceId,
        portalUserId: session.portalUserId,
      }),
    });
  } catch (error) {
    console.error('Failed to log portal action:', error);
  }
}
