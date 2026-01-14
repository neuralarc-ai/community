/**
 * Converts the custom API docs format to OpenAPI 3.0 specification
 */

interface QueryParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface Route {
  method: string;
  path: string;
  description: string;
  queryParameters?: QueryParameter[];
  requestBody?: any;
  authentication?: boolean | string;
  authorization?: string;
  rateLimit?: string;
  fluxPoints?: number;
  prerequisites?: string;
  response: {
    status: number;
    type?: string;
    schema?: any;
  };
}

interface EndpointGroup {
  path: string;
  methods: string[];
  description: string;
  routes: Route[];
}

interface ApiDocs {
  info: {
    title: string;
    version: string;
    description: string;
    baseUrl: string;
  };
  authentication: {
    type: string;
    method: string;
    serverSide: string;
  };
  rateLimiting: {
    get: string;
    post: string;
    headers: string[];
  };
  cors: string;
  responseFormat: {
    success: string;
    error: {
      format: string;
      statusCodes: number[];
    };
  };
  endpoints: EndpointGroup[];
}

function parseType(typeString: string): { type: string; format?: string; items?: any } {
  if (typeString.includes('uuid')) {
    return { type: 'string', format: 'uuid' };
  }
  if (typeString.includes('array')) {
    return {
      type: 'array',
      items: { type: 'string' },
    };
  }
  if (typeString.includes('boolean')) {
    return { type: 'boolean' };
  }
  if (typeString.includes('number') || typeString.includes('integer')) {
    return { type: 'number' };
  }
  if (typeString.includes('timestamp') || typeString.includes('date')) {
    return { type: 'string', format: 'date-time' };
  }
  return { type: 'string' };
}

function convertRequestBody(requestBody: any): any {
  if (!requestBody) return undefined;

  if (typeof requestBody === 'string') {
    return {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {},
          },
        },
      },
    };
  }

  const properties: Record<string, any> = {};
  const required: string[] = [];

  Object.entries(requestBody).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const isRequired = value.includes('required');
      const parsed = parseType(value);

      properties[key] = {
        ...parsed,
        description: value,
      };

      if (isRequired) {
        required.push(key);
      }
    } else {
      properties[key] = {
        type: typeof value,
        example: value,
      };
    }
  });

  return {
    required: required.length > 0,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties,
          ...(required.length > 0 && { required }),
        },
      },
    },
  };
}

function convertResponse(response: Route['response'], errorFormat?: string): any {
  const responses: Record<string, any> = {};

  if (response.status >= 200 && response.status < 300) {
    responses[response.status.toString()] = {
      description: getStatusText(response.status),
      content: {
        'application/json': {
          schema: response.schema
            ? {
                type: 'object',
                properties: Object.entries(response.schema).reduce(
                  (acc, [key, value]) => {
                    acc[key] = {
                      type: typeof value === 'string' ? 'string' : 'object',
                      description: String(value),
                    };
                    return acc;
                  },
                  {} as Record<string, any>
                ),
              }
            : {
                type: 'object',
              },
        },
      },
    };
  }

  // Add common error responses
  if (errorFormat) {
    [400, 401, 403, 404, 429, 500].forEach((status) => {
      if (status !== response.status) {
        responses[status.toString()] = {
          description: getStatusText(status),
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                  },
                },
              },
              example: JSON.parse(errorFormat),
            },
          },
        };
      }
    });
  }

  return responses;
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
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

export function convertToOpenAPI(docs: ApiDocs, baseUrl: string = 'http://localhost:3000'): any {
  const openAPI: any = {
    openapi: '3.0.0',
    info: {
      title: docs.info.title,
      version: docs.info.version,
      description: docs.info.description,
    },
    servers: [
      {
        url: baseUrl,
        description: 'Development server',
      },
    ],
    tags: [],
    paths: {},
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: docs.authentication.method,
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sb-access-token',
          description: docs.authentication.method,
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  };

  // Convert endpoints to OpenAPI paths
  docs.endpoints.forEach((group) => {
    // Add tag
    const tagName = group.description.replace(' API', '').replace(' API', '');
    if (!openAPI.tags.find((t: any) => t.name === tagName)) {
      openAPI.tags.push({
        name: tagName,
        description: group.description,
      });
    }

    group.routes.forEach((route) => {
      // Convert path from /api/posts/[id] to /api/posts/{id}
      const openAPIPath = route.path.replace(/\[(\w+)\]/g, '{$1}');
      
      if (!openAPI.paths[openAPIPath]) {
        openAPI.paths[openAPIPath] = {};
      }

      const method = route.method.toLowerCase();
      const pathItem: any = {
        summary: route.description,
        tags: [tagName],
        responses: convertResponse(route.response, docs.responseFormat.error.format),
      };

      // Add parameters (path and query)
      const parameters: any[] = [];

      // Extract path parameters
      const pathParamMatches = route.path.match(/\[(\w+)\]/g);
      if (pathParamMatches) {
        pathParamMatches.forEach((match) => {
          const paramName = match.slice(1, -1);
          parameters.push({
            name: paramName,
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: `${paramName} parameter`,
          });
        });
      }

      // Add query parameters
      if (route.queryParameters && route.queryParameters.length > 0) {
        route.queryParameters.forEach((param) => {
          parameters.push({
            name: param.name,
            in: 'query',
            required: param.required,
            schema: {
              type: param.type === 'number' ? 'integer' : 'string',
            },
            description: param.description,
          });
        });
      }

      if (parameters.length > 0) {
        pathItem.parameters = parameters;
      }

      // Add request body
      if (['post', 'put', 'patch'].includes(method)) {
        const requestBody = convertRequestBody(route.requestBody);
        if (requestBody) {
          pathItem.requestBody = requestBody;
        }
      }

      // Add security
      if (route.authentication === true || typeof route.authentication === 'string') {
        pathItem.security = [
          { BearerAuth: [] },
          { CookieAuth: [] },
        ];
      }

      // Add description with additional info
      let description = route.description;
      if (route.authorization) {
        description += `\n\n**Authorization:** ${route.authorization}`;
      }
      if (route.rateLimit) {
        description += `\n\n**Rate Limit:** ${route.rateLimit}`;
      }
      if (route.fluxPoints) {
        description += `\n\n**Flux Points:** Awards ${route.fluxPoints} Flux points on successful operation`;
      }
      if (route.prerequisites) {
        description += `\n\n**Prerequisites:** ${route.prerequisites}`;
      }

      pathItem.description = description;

      openAPI.paths[openAPIPath][method] = pathItem;
    });
  });

  return openAPI;
}

