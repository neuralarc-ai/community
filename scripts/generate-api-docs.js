const fs = require('fs');
const path = require('path');
const http = require('http');

function getStatusText(status) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown';
}

function formatQueryParameters(params) {
  if (!params || params.length === 0) return '';
  
  return params.map(param => {
    const required = param.required ? '(required)' : '(optional)';
    return `- \`${param.name}\` ${required}: ${param.description || `${param.type} parameter`}`;
  }).join('\n');
}

function formatRequestBody(body) {
  if (!body) return '';
  
  if (typeof body === 'string') {
    return body;
  }
  
  if (typeof body === 'object') {
    return Object.entries(body)
      .map(([key, value]) => {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        return `  "${key}": ${valueStr}`;
      })
      .join(',\n');
  }
  
  return JSON.stringify(body, null, 2);
}

function generateMarkdown(docs) {
  let markdown = `# ${docs.info.title} - API Endpoints\n\n`;
  markdown += `${docs.info.description}\n\n`;
  markdown += `**Version:** ${docs.info.version}\n`;
  markdown += `**Base URL:** \`${docs.info.baseUrl}\`\n\n`;
  
  markdown += `---\n\n`;
  
  markdown += `## Authentication\n\n`;
  markdown += `Type: ${docs.authentication.type}\n`;
  markdown += `Method: ${docs.authentication.method}\n`;
  markdown += `Server-side: ${docs.authentication.serverSide}\n\n`;
  
  markdown += `---\n\n`;
  
  markdown += `## Rate Limiting\n\n`;
  markdown += `- **GET requests**: ${docs.rateLimiting.get}\n`;
  markdown += `- **POST requests**: ${docs.rateLimiting.post}\n\n`;
  markdown += `Rate limit information is included in response headers:\n`;
  docs.rateLimiting.headers.forEach(header => {
    markdown += `- \`${header}\`: ${header === 'X-RateLimit-Limit' ? 'Maximum requests allowed' : header === 'X-RateLimit-Remaining' ? 'Remaining requests in current window' : 'Timestamp when rate limit resets'}\n`;
  });
  markdown += `\n`;
  
  markdown += `---\n\n`;
  
  markdown += `## CORS\n\n`;
  markdown += `${docs.cors}\n\n`;
  
  markdown += `---\n\n`;
  
  markdown += `## Response Format\n\n`;
  markdown += `All endpoints return JSON responses. Error responses follow this format:\n`;
  markdown += `\`\`\`json\n${docs.responseFormat.error.format}\n\`\`\`\n\n`;
  
  markdown += `---\n\n`;
  
  // Generate endpoint documentation
  docs.endpoints.forEach((group, groupIndex) => {
    markdown += `## ${group.description}\n\n`;
    
    group.routes.forEach((route, routeIndex) => {
      markdown += `### ${route.method} \`${route.path}\`\n\n`;
      markdown += `${route.description}\n\n`;
      
      if (route.queryParameters && route.queryParameters.length > 0) {
        markdown += `**Query Parameters:**\n`;
        markdown += `${formatQueryParameters(route.queryParameters)}\n\n`;
      }
      
      if (route.requestBody) {
        markdown += `**Request Body:**\n`;
        markdown += `\`\`\`json\n`;
        if (typeof route.requestBody === 'object') {
          markdown += `{\n${formatRequestBody(route.requestBody)}\n}\n`;
        } else {
          markdown += `${route.requestBody}\n`;
        }
        markdown += `\`\`\`\n\n`;
      }
      
      if (route.authentication) {
        const authText = typeof route.authentication === 'string' 
          ? route.authentication 
          : 'Required';
        markdown += `**Authentication:** ${authText}\n`;
      }
      
      if (route.authorization) {
        markdown += `**Authorization:** ${route.authorization}\n`;
      }
      
      if (route.rateLimit) {
        markdown += `**Rate Limit:** ${route.rateLimit}\n`;
      }
      
      if (route.fluxPoints) {
        markdown += `**Flux Points:** Awards ${route.fluxPoints} Flux points on successful operation\n`;
      }
      
      if (route.prerequisites) {
        markdown += `**Prerequisites:** ${route.prerequisites}\n`;
      }
      
      markdown += `**Response:** \`${route.response.status} ${getStatusText(route.response.status)}\`\n`;
      
      if (route.response.type) {
        markdown += `**Response Type:** ${route.response.type}\n`;
      }
      
      if (route.response.schema) {
        markdown += `**Response Schema:**\n`;
        markdown += `\`\`\`json\n${JSON.stringify(route.response.schema, null, 2)}\n\`\`\`\n`;
      }
      
      if (routeIndex < group.routes.length - 1 || groupIndex < docs.endpoints.length - 1) {
        markdown += `\n---\n\n`;
      }
    });
  });
  
  markdown += `\n## Error Responses\n\n`;
  markdown += `All endpoints may return the following error responses:\n\n`;
  
  docs.responseFormat.error.statusCodes.forEach(statusCode => {
    const statusText = getStatusText(statusCode);
    markdown += `### ${statusCode} ${statusText}\n`;
    markdown += `\`\`\`json\n${docs.responseFormat.error.format}\n\`\`\`\n\n`;
  });
  
  return markdown;
}

async function fetchDocs(baseUrl = 'http://localhost:3000') {
  // Use fetch if available (Node 18+), otherwise fall back to http/https
  if (typeof fetch !== 'undefined') {
    try {
      const response = await fetch(`${baseUrl}/api/docs`);
      if (!response.ok) {
        throw new Error(`Failed to fetch docs: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch docs: ${error.message}`);
    }
  }

  // Fallback for older Node versions
  return new Promise((resolve, reject) => {
    const https = require('https');
    const http = require('http');
    const url = new URL(`${baseUrl}/api/docs`);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const docs = JSON.parse(data);
            resolve(docs);
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        } else {
          reject(new Error(`Failed to fetch docs: ${res.statusCode} ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const outputPath = process.argv[2] || path.join(process.cwd(), 'API_ENDPOINTS.md');
  
  console.log(`Fetching API docs from ${baseUrl}/api/docs...`);
  
  try {
    const docs = await fetchDocs(baseUrl);
    const markdown = generateMarkdown(docs);
    
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`✅ API endpoints documentation generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error('❌ Failed to generate API docs:', error.message);
    console.error('\nMake sure the development server is running: npm run dev');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { generateMarkdown, fetchDocs };

