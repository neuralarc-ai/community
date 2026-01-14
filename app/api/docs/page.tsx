import ReactSwagger from './react-swagger';

export const dynamic = 'force-dynamic';

async function getOpenAPISpec() {
  // Construct the full URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/docs/openapi`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching OpenAPI spec:', error);
    return null;
  }
}

export default async function DocsPage() {
  const spec = await getOpenAPISpec();

  if (!spec) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
        <p className="text-red-500">Failed to load API documentation. Please make sure the server is running.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ReactSwagger spec={spec} />
    </div>
  );
}

