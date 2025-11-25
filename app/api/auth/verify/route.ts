import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromHeader, verifyUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getAuthTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await verifyUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user,
    });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify token',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

