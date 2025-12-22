/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sysoiuamongbmifwtgup.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            // WARNING: 'unsafe-inline' is added here to resolve CSP errors during development.
            // For production, consider using nonces or hashes for inline scripts for better security.
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} *; img-src 'self' data: blob: https://images.unsplash.com ${process.env.NEXT_PUBLIC_SUPABASE_URL};`,
          },
          // #region agent log
          // #endregion
          // TODO: Add more security headers as needed
        ],
      },
    ];
  },
};

module.exports = nextConfig;
