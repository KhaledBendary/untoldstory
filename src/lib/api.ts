import { apiClient } from './api-client';
import { documentaryBodyFor } from "@/data/documentary-body";
import { stripTranslatorNote, unwrapPastedEditorMarkup } from "@/lib/seo";
import type {
  HomeData,
  LayoutData,
  Service,
  PortfolioItem,
  BlogPost,
  Page,
  About,
  Testimonial,
  FAQ,
  SEOMeta,
  ContactForm,
  LeadForm,
  NewsletterSubscribe,
  NewsletterUnsubscribe,
  ApiResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminUser,
  DashboardStats,
  ContactRequest,
  Lead,
} from '@/types/api';

type ApiEnvelope<T> = { success: boolean; locale: string; data: T };

type CollectionData<T> = { items: T[] };

type PaginatedData<T> = { items: T[]; pagination: {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
} };

/*
 * Drop CMS text that lost its encoding, wherever it appears.
 *
 * Several Arabic records store their text in a column that turned every letter
 * into "?", and it was reaching the page: a portfolio h1 read
 * "???? ?????? ?????? ??? ????????" to visitors, and the same string went out
 * as the meta description. Guards were added at the two places it was noticed
 * — the About team, then buildDescription — and each time it turned up
 * somewhere else, because the problem is the data, not the display.
 *
 * unwrap is where every record enters the app, so scrub here and no consumer
 * can receive it. The fields become undefined and the existing fallbacks take
 * over, which is what those fallbacks are for.
 *
 * This hides the damage; it does not repair it. The Arabic text needs
 * re-entering in the CMS before the real words can appear.
 */
const UNREADABLE = /\?{3,}/;

function scrubUnreadable<T>(value: T, depth = 0): T {
  if (depth > 6) return value;
  if (typeof value === "string") return (UNREADABLE.test(value) ? undefined : value) as T;
  if (Array.isArray(value)) return value.map((item) => scrubUnreadable(item, depth + 1)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) out[key] = scrubUnreadable(item, depth + 1);
    return out as T;
  }
  return value;
}

/*
 * The documentary service record holds the commercial body in every language
 * but English — the wrong text was translated eight times over and is now
 * indexable in all of them. Correct it here, where records enter, rather than
 * at each caller: three separate code paths fetch a service, and the last bug
 * of this shape was fixed three times before it was fixed once.
 *
 * documentaryBodyFor returns nothing once the stored text reads as a
 * documentary page, so a CMS fix retires the correction by itself.
 */
/*
 * Repair the rich-text fields as records arrive.
 *
 * Several bodies were pasted out of a chat assistant's answer panel, keeping
 * its container markup and its opening line — readers were shown "Ecco la
 * traduzione in italiano:" and, on one page, eleven blocks of Spanish before
 * the Italian began. Cleaning it at render hid it from the page but still sent
 * every byte to the browser inside the flight payload; the same mistake was
 * made with unreadable Arabic text and fixed here in the end.
 */
const RICH_TEXT_FIELDS = ["fullDesc", "body", "content", "description"] as const;

function repairCmsText<T>(value: T): T {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => repairCmsText(item)) as T;

  const record = value as Record<string, unknown>;
  let changed: Record<string, unknown> | null = null;
  for (const field of RICH_TEXT_FIELDS) {
    const text = record[field];
    if (typeof text !== "string" || !text) continue;
    const repaired = stripTranslatorNote(unwrapPastedEditorMarkup(text));
    if (repaired !== text) (changed ??= { ...record })[field] = repaired;
  }
  return (changed ?? record) as T;
}

function correctKnownBadBodies<T>(value: T, locale?: string): T {
  if (!locale || !value || typeof value !== "object") return value;

  const fix = (service: Record<string, unknown>) => {
    service = repairCmsText(service);
    if (service.slug !== "documentary-production-egypt") return service;
    const corrected = documentaryBodyFor(locale, service.fullDesc as string | undefined);
    return corrected ? { ...service, fullDesc: corrected } : service;
  };

  if (Array.isArray(value)) return value.map((item) =>
    item && typeof item === "object" ? fix(item as Record<string, unknown>) : item) as T;
  return fix(value as Record<string, unknown>) as T;
}

function unwrap<T>(res: ApiEnvelope<T>): T {
  return repairCmsText(scrubUnreadable(res.data));
}

// ==================== PUBLIC CONTENT ENDPOINTS ====================

export const api = {
  getHome: async (locale?: string): Promise<HomeData> => {
    const res = await apiClient.get<ApiEnvelope<HomeData>>('/home', {}, { locale });
    return unwrap(res);
  },

  getLayout: async (locale?: string): Promise<LayoutData> => {
    const res = await apiClient.get<ApiEnvelope<LayoutData>>('/layout', {}, { locale });
    return unwrap(res);
  },

  getPageBySlug: async (slug: string, locale?: string): Promise<Page> => {
    const res = await apiClient.get<ApiEnvelope<Page>>(`/pages/${slug}`, {}, { locale });
    return unwrap(res);
  },

  getServices: async (locale?: string): Promise<Service[]> => {
    const res = await apiClient.get<ApiEnvelope<CollectionData<Service>>>('/services', {}, { locale });
    return correctKnownBadBodies(scrubUnreadable(res.data.items), locale);
  },

  getServiceBySlug: async (slug: string, locale?: string): Promise<Service> => {
    const res = await apiClient.get<ApiEnvelope<Service>>(`/services/${slug}`, {}, { locale });
    return correctKnownBadBodies(unwrap(res), locale);
  },

  getPortfolio: async (params?: {
    locale?: string;
    category?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ items: PortfolioItem[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } }> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedData<PortfolioItem>>>('/portfolio', params);
    return { items: repairCmsText(scrubUnreadable(res.data.items)), pagination: res.data.pagination };
  },

  getPortfolioBySlug: async (slug: string, locale?: string): Promise<PortfolioItem> => {
    const res = await apiClient.get<ApiEnvelope<PortfolioItem>>(`/portfolio/${slug}`, {}, { locale });
    return unwrap(res);
  },

  getBlogPosts: async (params?: {
    locale?: string;
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ items: BlogPost[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } }> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedData<BlogPost>>>('/blog', params);
    return { items: repairCmsText(scrubUnreadable(res.data.items)), pagination: res.data.pagination };
  },

  getBlogPostBySlug: async (slug: string, locale?: string): Promise<BlogPost> => {
    const res = await apiClient.get<ApiEnvelope<BlogPost>>(`/blog/${slug}`, {}, { locale });
    return unwrap(res);
  },

  getAbout: async (locale?: string): Promise<About> => {
    const res = await apiClient.get<ApiEnvelope<About>>('/about', {}, { locale });
    return unwrap(res);
  },

  getTestimonials: async (locale?: string): Promise<Testimonial[]> => {
    // API returns array directly in { success, locale, data: [...items] }
    const res = await apiClient.get<ApiEnvelope<Testimonial[]>>('/testimonials', {}, { locale });
    return unwrap(res);
  },

  getFAQs: async (locale?: string): Promise<FAQ[]> => {
    // API returns array directly in { success, locale, data: [...items] }
    const res = await apiClient.get<ApiEnvelope<FAQ[]>>('/faqs', {}, { locale });
    return unwrap(res);
  },

  getSEOMeta: async (type: 'page' | 'blog' | 'service', slug?: string, locale?: string): Promise<SEOMeta> => {
    const endpoint = slug ? `/seo/${type}/${slug}` : `/seo/${type}`;
    const res = await apiClient.get<ApiEnvelope<SEOMeta>>(endpoint, {}, { locale });
    return unwrap(res);
  },

  getSitemap: async (): Promise<string> => {
    const base = apiClient.getBaseUrl().replace('/api/v1', '');
    const response = await fetch(`${base}/sitemap.xml`);
    return await response.text();
  },
};

// ==================== FORM ENDPOINTS ====================

export const formsApi = {
  submitContact: async (data: ContactForm): Promise<ApiResponse<unknown>> => {
    return apiClient.post<ApiResponse<unknown>>('/contact', data);
  },

  submitQuote: async (data: LeadForm): Promise<ApiResponse<unknown>> => {
    return apiClient.post<ApiResponse<unknown>>('/leads/quote', data);
  },

  subscribeNewsletter: async (data: NewsletterSubscribe): Promise<ApiResponse<unknown>> => {
    return apiClient.post<ApiResponse<unknown>>('/newsletter/subscribe', data);
  },

  unsubscribeNewsletter: async (data: NewsletterUnsubscribe): Promise<ApiResponse<unknown>> => {
    return apiClient.post<ApiResponse<unknown>>('/newsletter/unsubscribe', data);
  },
};

// ==================== ADMIN ENDPOINTS ====================

export const adminApi = {
  login: async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
    return apiClient.post<AdminLoginResponse>('/admin/login', credentials);
  },

  logout: async (token: string): Promise<ApiResponse<unknown>> => {
    return apiClient.post<ApiResponse<unknown>>('/admin/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getMe: async (token: string): Promise<AdminUser> => {
    return apiClient.get<AdminUser>('/admin/me', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getDashboard: async (token: string): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/admin/dashboard', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getContactRequests: async (token: string, params?: {
    status?: 'new' | 'read' | 'replied' | 'archived';
    per_page?: number;
  }): Promise<{ items: ContactRequest[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } }> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedData<ContactRequest>>>('/admin/contact-requests', params, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { items: repairCmsText(scrubUnreadable(res.data.items)), pagination: res.data.pagination };
  },

  getContactRequest: async (token: string, id: number): Promise<ContactRequest> => {
    const res = await apiClient.get<ApiEnvelope<ContactRequest>>(`/admin/contact-requests/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(res);
  },

  updateContactRequest: async (token: string, id: number, data: {
    status: 'new' | 'read' | 'replied' | 'archived';
  }): Promise<ContactRequest> => {
    const res = await apiClient.patch<ApiEnvelope<ContactRequest>>(`/admin/contact-requests/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(res);
  },

  getLeads: async (token: string, params?: {
    status?: 'new' | 'contacted' | 'proposal' | 'won' | 'lost' | 'archived';
    per_page?: number;
  }): Promise<{ items: Lead[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } }> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedData<Lead>>>('/admin/leads', params, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { items: repairCmsText(scrubUnreadable(res.data.items)), pagination: res.data.pagination };
  },

  getLead: async (token: string, id: number): Promise<Lead> => {
    const res = await apiClient.get<ApiEnvelope<Lead>>(`/admin/leads/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(res);
  },

  updateLead: async (token: string, id: number, data: {
    status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost' | 'archived';
    assigned_to?: number;
  }): Promise<Lead> => {
    const res = await apiClient.patch<ApiEnvelope<Lead>>(`/admin/leads/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(res);
  },
};

// Health Check
export const healthCheck = async (): Promise<{ status: string }> => {
  const base = apiClient.getBaseUrl().replace('/api/v1', '');
  const response = await fetch(`${base}/up`);
  return await response.json();
};
