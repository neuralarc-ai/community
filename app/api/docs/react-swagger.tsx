'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading API Documentation...</p>
      </div>
    </div>
  ),
});

type Props = {
  spec: Record<string, any>;
};

function ReactSwagger({ spec }: Props) {
  useEffect(() => {
    // Suppress React warnings from swagger-ui-react library
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      // Filter out warnings from swagger-ui-react about deprecated lifecycle methods
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('UNSAFE_componentWillReceiveProps') ||
          args[0].includes('ModelCollapse') ||
          args[0].includes('ParameterRow') ||
          args[0].includes('componentWillReceiveProps'))
      ) {
        // Suppress these specific warnings from swagger-ui-react library
        return;
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      // Filter out warnings from swagger-ui-react
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('UNSAFE_componentWillReceiveProps') ||
          args[0].includes('ModelCollapse') ||
          args[0].includes('ParameterRow'))
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };
    
    // Restore original console methods on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div className="swagger-container">
      <SwaggerUI 
        spec={spec}
        deepLinking={true}
        displayOperationId={false}
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
        docExpansion="list"
        filter={true}
        showExtensions={true}
        showCommonExtensions={true}
      />
    </div>
  );
}

export default ReactSwagger;
