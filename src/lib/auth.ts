import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Checks if the current request is from an authenticated Clerk user.
 * Returns null if authenticated, or a 401 NextResponse if not.
 * Usage in API routes:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
