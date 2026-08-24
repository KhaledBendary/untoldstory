import type { Service, PortfolioItem, BlogPost } from '@/types/api';

// Asset URLs (images, storage files) always point at the upstream API domain
// directly — <img>/<Image> requests aren't subject to CORS, so no proxying
// is needed here (unlike JSON API calls in api-client.ts).
const ASSET_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.globaluntoldstory.com/api/v1'
).replace('/api/v1', '');

/**
 * Helper to get the correct image URL for a Service, handling both API and fallback properties
 */
export function getServiceImage(service: Service, fallbackUrl: string = '/images/hero-giza-pyramids.jpg'): string {
  const possibleUrls = [service.imageUrl].filter(Boolean) as string[];
  return resolveImageUrl(possibleUrls[0] || fallbackUrl);
}

/**
 * Helper to get the correct image URL for a PortfolioItem
 */
export function getProjectImage(project: PortfolioItem, fallbackUrl: string = '/images/hero-giza-pyramids.jpg'): string {
  const possibleUrls = [project.image, project.img].filter(Boolean) as string[];
  return resolveImageUrl(possibleUrls[0] || fallbackUrl);
}

/**
 * Helper to get the correct image URL for a BlogPost
 */
export function getPostImage(post: BlogPost, fallbackUrl: string = '/images/hero-giza-pyramids.jpg'): string {
  const possibleUrls = [post.featuredImage].filter(Boolean) as string[];
  return resolveImageUrl(possibleUrls[0] || fallbackUrl);
}

/**
 * Resolves an image URL, handling:
 * - Full URLs (http/https)
 * - Absolute paths (starts with /)
 * - Laravel storage paths (like storage/images/...)
 * - Falls back to a default image
 */
function resolveImageUrl(url: string, fallback: string = '/images/hero-giza-pyramids.jpg'): string {
  if (!url) return fallback;
  
  // If it's already a valid URL (http/https), return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it starts with /, it's already an absolute path
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's a Laravel storage path (like storage/images/...), prepend the asset base URL
  if (url.startsWith('storage/')) {
    return `${ASSET_BASE_URL}/${url}`;
  }
  
  // Otherwise, assume it's a relative path and prepend /
  return `/${url}`;
}
