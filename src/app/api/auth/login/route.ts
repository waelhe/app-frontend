/**
 * Server-side login proxy route.
 *
 * Handles the complete OAuth2 Authorization Code flow with PKCE,
 * all done server-side so the user never leaves the frontend.
 *
 * Uses shared modules:
 * - @/lib/server-auth for the full CSRF → Login → Authorize → Token flow
 * - @/lib/pkce for PKCE generation
 */

import { type NextRequest, NextResponse } from 'next/server';
import { acquireTokenViaPKCE } from '@/lib/server-auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Username and password are required' },
        { status: 400 },
      );
    }

    console.log(`[Auth Login] Attempting login for user: ${username}`);

    const result = await acquireTokenViaPKCE(username, password, 'Auth Login');

    if ('error' in result) {
      const status = result.status;
      const isInvalidCredentials = result.error === 'Invalid credentials';

      return NextResponse.json(
        {
          error: isInvalidCredentials ? 'invalid_credentials' : (result as { error: string }).error,
          error_description: isInvalidCredentials
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة'
            : result.description ?? result.error,
          ...(status === 502 && { needsBrowserAuth: true }),
        },
        { status },
      );
    }

    console.log('[Auth Login] Token obtained successfully');

    return NextResponse.json({
      accessToken: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('[Auth Login] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 },
    );
  }
}
