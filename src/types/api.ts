// Common API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Content Types
export interface Service {
  id: string;
  slug: string;
  icon: string;
  imageUrl: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  price: string;
  features: string[];
  isFeatured: boolean;
  sortOrder?: number;
  seo?: Record<string, unknown>;
}

export interface PortfolioItem {
  slug: string;
  title: string;
  client?: string;
  image?: string;
  img?: string;
  video?: string;
  category?: string;
  categorySlug?: string;
  duration?: string | null;
  budget?: string | null;
  results?: string;
  metric?: string;
  gridSize?: string;
  isFeatured?: boolean;
  categoryIcon?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  publishedAt: string;
  category: string;
  categorySlug: string;
  authorName: string;
  authorImage: string | null;
  featuredImage: string | null;
  body: string;
  readTimeMinutes: number;
  tags: string[];
  isFeatured: boolean;
  seo?: Record<string, unknown>;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface About {
  page: {
    title: string;
    subtitle: string;
    badge: string;
  };
  team: CmsRecord[];
  timeline: CmsRecord[];
  skills: CmsRecord[];
  values: CmsRecord[];
  stats: CmsRecord[];
  partnerLabels: string[];
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  type: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  message: string;
  locale?: string;
}

export interface LeadForm {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  service_id?: number;
  message?: string;
  budget?: string;
  locale?: string;
}

export interface NewsletterSubscribe {
  email: string;
  locale?: string;
}

export interface NewsletterUnsubscribe {
  token: string;
}

// Layout Types (matches actual API shape)
export interface LayoutData {
  site_config: {
    name: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    workingHours: string;
    socialLinks: {
      instagram: string;
      twitter?: string;
      linkedin: string;
      youtube?: string;
      facebook?: string;
      vimeo?: string;
      tiktok?: string;
    };
  };
  nav_links: Array<{
    href: string;
    label: string;
  }>;
  footer: {
    brandDesc: string;
    aboutTitle: string;
    aboutLinks: Array<{ label: string; href: string }>;
    servicesTitle: string;
    serviceLinks: Array<{ label: string; href: string }>;
    quickLinks: Array<{ label: string; href: string }>;
    contactUs: string;
    emailLabel: string;
    allRights: string;
    adminDashboard: string;
    offices: Array<{ region: string; address: string; phone: string }>;
  };
  announcement: {
    text: string;
    enabled: boolean;
  } | null;
  common_labels: Record<string, string>;
  partner_labels: string[];
  client_logos: Array<{
    name: string;
    displayName: string;
  }>;
}

/**
 * A CMS record whose fields vary by content type. `unknown` values force a
 * check at the point of use, which `any` silently skipped.
 */
export type CmsRecord = Record<string, unknown>;

// Home Page Types
export interface HomeData {
  hero_slides: CmsRecord[];
  hero: {
    badge: string;
    headline1: string;
    headline2: string;
    headline3: string;
    subtext: string;
    cta1: { label: string; href: string };
    cta2: { label: string; href: string };
    image: string;
    quoteBadge: string;
  };
  hero_split: CmsRecord | null;
  stats: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
  services: Service[];
  home_data: Record<string, string>;
  work_showcase: {
    badge: string;
    title: string;
    subtitle: string;
    viewAll: string;
    projects: PortfolioItem[];
  };
  process: {
    badge: string;
    title: string;
    steps: Array<{
      step: string;
      title: string;
      desc: string;
    }>;
  };
  testimonials: Testimonial[];
  photography: {
    badge: string;
    title: string;
    description: string;
    tagline: string;
    image: string;
    icon: string;
  };
  awards: Array<{
    icon: string;
    color: string;
    title: string;
    organization: string;
    yearLabel: string;
  }>;
  blog_preview: BlogPost[];
  faq: {
    badge: string;
    title: string;
    list: Array<{ q: string; a: string }>;
  };
  cta_banner: {
    title: string;
    text: string;
    cta_label: string;
    cta_url: string;
  };
  seo: Record<string, unknown>;
}

// SEO Types
export interface SEOMeta {
  title: string;
  description: string;
  keywords?: string[];
  og_image?: string;
}

// Admin Types
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    roles: string[];
  };
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export interface DashboardStats {
  contact_requests: number;
  leads: number;
  newsletter: number;
  published_posts: number;
}

export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  service_id?: number;
  message?: string;
  budget?: string;
  status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost' | 'archived';
  assigned_to?: number;
  created_at: string;
}
