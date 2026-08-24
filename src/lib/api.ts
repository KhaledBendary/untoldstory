import { apiClient } from './api-client';
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

function unwrap<T>(res: ApiEnvelope<T>): T {
  return res.data;
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
    return res.data.items;
  },

  getServiceBySlug: async (slug: string, locale?: string): Promise<Service> => {
    const res = await apiClient.get<ApiEnvelope<Service>>(`/services/${slug}`, {}, { locale });
    return unwrap(res);
  },

  getPortfolio: async (params?: {
    locale?: string;
    category?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ items: PortfolioItem[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } }> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedData<PortfolioItem>>>('/portfolio', params);
    return { items: res.data.items, pagination: res.data.pagination };
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
    return { items: res.data.items, pagination: res.data.pagination };
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
    return { items: res.data.items, pagination: res.data.pagination };
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
    return { items: res.data.items, pagination: res.data.pagination };
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
