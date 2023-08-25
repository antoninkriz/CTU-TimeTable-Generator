import { MetadataRoute } from 'next';
import { BASE_URL } from '@src/consts';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
    },
  ];
}
