/**
 * Server-side register proxy route.
 *
 * Creates a new user in the backend via the admin API.
 * Uses shared modules:
 * - @/lib/server-auth for acquiring admin JWT via PKCE
 * - @/lib/pkce for PKCE generation
 */

import { type NextRequest, NextResponse } from 'next/server';
import { acquireTokenViaPKCE } from '@/lib/server-auth';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';
const ADMIN_USERNAME = process.env.AUTH_ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD ?? '';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { displayName, email, password, role = 'CONSUMER' } = body;

    // Validate required fields
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Name, email, and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    if (!ADMIN_PASSWORD) {
      console.error('[Auth Register] Admin password not configured');
      return NextResponse.json(
        {
          error: 'server_error',
          error_description: 'User registration is not available. Admin credentials not configured.',
        },
        { status: 503 },
      );
    }

    console.log(`[Auth Register] Attempting to register user: ${email}`);

    // Step 1: Get admin JWT via full PKCE flow
    const adminAuthResult = await acquireTokenViaPKCE(ADMIN_USERNAME, ADMIN_PASSWORD, 'Auth Register');

    if ('error' in adminAuthResult) {
      return NextResponse.json(
        { error: 'server_error', error_description: adminAuthResult.error },
        { status: adminAuthResult.status },
      );
    }

    const adminToken = adminAuthResult.token;

    // Step 2: Create user via admin API with JWT Bearer auth
    console.log('[Auth Register] Creating user via admin API...');
    const createResponse = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        username: email,
        password,
        displayName,
        role,
      }),
    });

    if (!createResponse.ok) {
      const errorBody = await createResponse.text();
      console.error(`[Auth Register] User creation failed: ${createResponse.status} ${errorBody}`);

      if (createResponse.status === 401 || createResponse.status === 403) {
        return NextResponse.json(
          {
            error: 'registration_limited',
            error_description: 'Registration is temporarily limited. Please use the provided demo accounts or contact support.',
          },
          { status: 503 },
        );
      }

      if (createResponse.status === 409) {
        return NextResponse.json(
          { error: 'conflict', error_description: 'A user with this email already exists' },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: 'server_error', error_description: `Registration failed: ${errorBody}` },
        { status: 502 },
      );
    }

    const userData = await createResponse.json();
    console.log(`[Auth Register] User created successfully: ${email}`);

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('[Auth Register] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 },
    );
  }
}
