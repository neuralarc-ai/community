import { NextRequest, NextResponse } from 'next/server';
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';
import { convertToOpenAPI } from '@/lib/convertToOpenAPI';

async function getApiDocs(request: NextRequest) {
  // Get the base URL from the request
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  
  // Fetch from the JSON endpoint, not the page (to avoid circular dependency)
  try {
    const response = await fetch(`${baseUrl}/api/docs/json`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'OpenAPI-Converter',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch API docs: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching API docs:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiDocs = await getApiDocs(request);
    
    // Get the base URL from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    const openAPISpec = convertToOpenAPI(apiDocs, baseUrl);
    
    const response = NextResponse.json(openAPISpec);
    return setCorsHeaders(request, response);
  } catch (error: any) {
    console.error('Error generating OpenAPI spec:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to generate OpenAPI specification', details: error.message },
      { status: 500 }
    );
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}

