import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker and monitoring
 * GET /api/health
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'mentor-futuro-app',
    },
    { status: 200 }
  );
}
