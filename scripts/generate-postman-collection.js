const fs = require('fs');
const path = require('path');

async function fetchDocs(baseUrl = 'http://localhost:3000') {
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

function convertToPostmanCollection(docs, baseUrl = 'http://localhost:3000') {
  const collection = {
    info: {
      name: docs.info.title,
      description: docs.info.description,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      _exporter_id: 'community-portal-api',
    },
    variable: [
      {
        key: 'base_url',
        value: baseUrl.replace(/\/$/, '') + docs.info.baseUrl,
        type: 'string',
      },
      {
        key: 'auth_token',
        value: '',
        type: 'string',
        description: 'Supabase session token (if using Bearer token auth)',
      },
    ],
    item: [],
  };

  // Convert each endpoint group to a Postman folder
  docs.endpoints.forEach((group) => {
    const folder = {
      name: group.description,
      item: [],
    };

    group.routes.forEach((route) => {
      const pathParts = route.path.replace(/^\/api/, '').split('/');
      const url = {
        raw: `{{base_url}}${route.path.replace(/\[(\w+)\]/g, ':$1')}`,
        host: ['{{base_url}}'],
        path: pathParts.map((part) => {
          // Convert [id] to :id for Postman
          if (part.startsWith('[') && part.endsWith(']')) {
            const varName = part.slice(1, -1);
            return `:${varName}`;
          }
          return part;
        }),
      };

      // Add path variables
      const pathVars = [];
      pathParts.forEach((part) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const varName = part.slice(1, -1);
          pathVars.push({
            key: varName,
            value: '1', // Default value
            description: `${varName} parameter`,
          });
        }
      });
      if (pathVars.length > 0) {
        url.variable = pathVars;
      }

      // Add query parameters
      if (route.queryParameters && route.queryParameters.length > 0) {
        url.query = route.queryParameters.map((param) => ({
          key: param.name,
          value: param.type === 'number' ? '0' : '',
          description: param.description,
          disabled: !param.required,
        }));
      }

      const request = {
        name: `${route.method} ${route.path.replace(/\[(\w+)\]/g, ':$1')}`,
        request: {
          method: route.method,
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
              disabled: !['POST', 'PUT', 'PATCH'].includes(route.method),
            },
          ],
          url: url,
        },
        response: [],
      };

      // Add authentication header if required
      if (route.authentication === true || typeof route.authentication === 'string') {
        request.request.header.push({
          key: 'Authorization',
          value: 'Bearer {{auth_token}}',
          description: 'Supabase Auth token',
        });
      }

      // Add request body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(route.method) && route.requestBody) {
        const bodyObj = {};
        if (typeof route.requestBody === 'object') {
          Object.entries(route.requestBody).forEach(([key, value]) => {
            // Parse the value type from description
            if (typeof value === 'string') {
              if (value.includes('required')) {
                if (value.includes('array')) {
                  bodyObj[key] = [];
                } else if (value.includes('boolean')) {
                  bodyObj[key] = false;
                } else if (value.includes('number') || value.includes('uuid')) {
                  bodyObj[key] = value.includes('uuid') ? '00000000-0000-0000-0000-000000000000' : 0;
                } else {
                  bodyObj[key] = '';
                }
              } else if (value.includes('optional')) {
                // Add optional fields with example values
                if (value.includes('array')) {
                  bodyObj[key] = [];
                } else if (value.includes('boolean')) {
                  bodyObj[key] = false;
                } else if (value.includes('number')) {
                  bodyObj[key] = 0;
                } else if (value.includes('uuid')) {
                  bodyObj[key] = '00000000-0000-0000-0000-000000000000';
                } else {
                  bodyObj[key] = '';
                }
              }
            }
          });
        }

        request.request.body = {
          mode: 'raw',
          raw: JSON.stringify(bodyObj, null, 2),
          options: {
            raw: {
              language: 'json',
            },
          },
        };
      }

      // Add description
      request.request.description = route.description;

      folder.item.push(request);
    });

    collection.item.push(folder);
  });

  return collection;
}

async function main() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const outputPath = process.argv[2] || path.join(process.cwd(), 'Community_Portal_API.postman_collection.json');
  
  console.log(`Fetching API docs from ${baseUrl}/api/docs...`);
  
  try {
    const docs = await fetchDocs(baseUrl);
    const collection = convertToPostmanCollection(docs, baseUrl);
    
    fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), 'utf-8');
    console.log(`✅ Postman collection generated successfully at: ${outputPath}`);
    console.log(`\nTo import into Postman:`);
    console.log(`1. Open Postman`);
    console.log(`2. Click "Import" button`);
    console.log(`3. Select the file: ${outputPath}`);
    console.log(`4. Update the base_url variable with your actual API URL`);
  } catch (error) {
    console.error('❌ Failed to generate Postman collection:', error.message);
    console.error('\nMake sure the development server is running: npm run dev');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertToPostmanCollection, fetchDocs };

