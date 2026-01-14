import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabaseServerClient';
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';

export async function GET(request: NextRequest) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      environment: 'unknown',
    },
  };

  try {
    // Check database connectivity
    const supabase = await createServerClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);

    if (error) {
      health.status = 'degraded';
      health.checks.database = 'error';
      health.checks.databaseError = error.message;
    } else {
      health.checks.database = 'ok';
    }
  } catch (error: any) {
    health.status = 'degraded';
    health.checks.database = 'error';
    health.checks.databaseError = error?.message || 'Unknown error';
  }

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingEnvVars.length > 0) {
    health.status = 'degraded';
    health.checks.environment = 'error';
    health.checks.missingEnvVars = missingEnvVars;
  } else {
    health.checks.environment = 'ok';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  const response = NextResponse.json(health, { status: statusCode });
  return setCorsHeaders(request, response);
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}

