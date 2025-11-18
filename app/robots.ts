import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://avoidtherain.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/dev/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

