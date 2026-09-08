import type { MetadataRoute } from 'next';
import content from '@/data/content.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://planeon.ai';
  const modified = new Date('2026-09-01T00:00:00+08:00');
  const routes = [
    '',
    '/blueprint',
    '/journey',
    '/roadmap',
    '/explorer',
    '/assessment',
    '/whitepaper',
    '/about',
  ];
  return [
    {
      url: `${base}/transformation`,
      lastModified: new Date('2026-09-08T00:00:00+08:00'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    ...routes.map((route) => ({
      url: `${base}${route}`,
      lastModified: modified,
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...Object.values(content.harnesses).map((harness) => ({
      url: `${base}/blueprint/${harness.n}`,
      lastModified: modified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
