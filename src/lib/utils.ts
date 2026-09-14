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
export function getServiceImagePosition(service: Pick<Service, 'slug'>): string {
  const positions: Record<string, string> = {
    'commercial-video-production': '75% 55%',
    'commercial-photography': '50% 43%',
    'dubbing-voice-over-localization': '30% 50%',
    'event-production-live-streaming-egypt': '80% 65%',
    'motion-graphics-cgi-vfx-ai': '50% 35%',
    'original-ip-development': '50% 65%',
    'performance-marketing-creative-strategy': '70% 45%',
    'podcast-production': '70% 25%',
    'post-production': '50% 35%',
    'tv-show-production-live-broadcast': '50% 25%',
  };
  return positions[service.slug] ?? '50% 50%';
}

export function getServiceImage(service: Pick<Service, 'slug' | 'imageUrl'>, fallbackUrl: string = '/images/hero-giza-pyramids.jpg'): string {
  const referenceImages: Record<string, string> = {
    'commercial-video-production': '/images/commercial-advertising-production-services-egypt.webp',
    'commercial-photography': '/images/commercial-product-photography-clorox.webp',
    'dubbing-voice-over-localization': '/images/dubbing-voice-over-localization-services.webp',
    'event-production-live-streaming-egypt': '/images/event-coverage-live-production-egypt.webp',
    'motion-graphics-cgi-vfx-ai': '/images/motion-graphics-cgi-vfx-ai-production.webp',
    'original-ip-development': '/images/original-ip-development-tv-format-creation.webp',
    'performance-marketing-creative-strategy': '/images/performance-marketing-creative-strategy-analytics.webp',
    'podcast-production': '/images/podcast-video-podcast-production.webp',
    'post-production': '/images/post-production-video-editing-finishing.webp',
    'tv-show-production-live-broadcast': '/images/tv-show-production-live-broadcast.webp',
  };
  if (referenceImages[service.slug]) return referenceImages[service.slug];
  const possibleUrls = [service.imageUrl].filter(Boolean) as string[];
  return resolveImageUrl(possibleUrls[0] || fallbackUrl);
}

/**
 * Helper to get the correct image URL for a PortfolioItem
 */
export function getProjectImage(project: Pick<PortfolioItem, 'image' | 'img'>, fallbackUrl: string = '/images/hero-giza-pyramids.jpg'): string {
  const possibleUrls = [project.image, project.img].filter(Boolean) as string[];
  return resolveImageUrl(possibleUrls[0] || fallbackUrl);
}

/**
 * Helper to get the correct image URL for a BlogPost
 */
export function getPostImage(post: Pick<BlogPost, 'featuredImage'>, fallbackUrl: string = '/images/hero-giza-pyramids.jpg'): string {
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
