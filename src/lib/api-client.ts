// Thrown by ApiClient on any non-2xx response or network failure. Callers
// can check `status` to tell a real "this doesn't exist" (404) apart from a
// transient failure (network blip, 5xx, timeout) that a retry would fix —
// the two were previously indistinguishable, which is why a brief hiccup
// rendered the same permanent "not found" page as a real missing resource.
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function isRetryable(status?: number): boolean {
  // No status means the request never got a response (network error, DNS
  // failure, timeout) — worth retrying. A 4xx means the server responded
  // and said no; retrying won't change that.
  return status === undefined || status >= 500 || status === 429;
}

const RETRY_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [300, 800, 2000];

/**
 * Seconds Next.js may serve a cached API response before refetching.
 *
 * This also makes the build survivable: `next build` renders with many workers
 * at once, and every page hits the API twice (generateMetadata, then the page
 * body). Un-deduped, that burst made the upstream Laravel app return 500s, and
 * pages silently fell back to default metadata. Going through Next's data cache
 * collapses identical URLs into one request.
 */
const SERVER_REVALIDATE_SECONDS = 300;

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * The upstream Laravel API starts failing with 500s at roughly eleven
 * concurrent requests (measured: 10 parallel all returned 200; 20 parallel
 * produced nine 500s). `next build` renders many pages at once and each one
 * hits several endpoints, which is what silently degraded pages to fallback
 * metadata. Cap our own in-flight server requests below that cliff.
 *
 * Browser requests are untouched — they arrive spread over real user sessions.
 */
const MAX_SERVER_CONCURRENCY = 4;

let inFlight = 0;
const waiting: Array<() => void> = [];

async function acquireSlot(): Promise<() => void> {
  if (inFlight >= MAX_SERVER_CONCURRENCY) {
    await new Promise<void>(resolve => waiting.push(resolve));
  }
  inFlight++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    inFlight--;
    waiting.shift()?.();
  };
}

const UPSTREAM_API_BASE_URL =
  process.env.API_BASE_URL || 'https://api.globaluntoldstory.com/api/v1';

// In the browser, hit our own origin (proxied via next.config.ts rewrites)
// instead of the upstream API domain directly. This avoids CORS errors,
// since the upstream server may not send Access-Control-Allow-Origin for
// this site. On the server (SSR/RSC), talk to the upstream API directly.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window === 'undefined' ? UPSTREAM_API_BASE_URL : '/api/v1');
const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || 'en';

interface ApiRequestOptions {
  locale?: string;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private defaultLocale: string;

  constructor(baseUrl: string, defaultLocale: string) {
    this.baseUrl = baseUrl;
    this.defaultLocale = defaultLocale;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | undefined>,
  ): string {
    const base = typeof window === 'undefined' ? undefined : window.location.origin;
    const url = new URL(`${this.baseUrl}${endpoint}`, base);
    const locale = params?.locale || this.defaultLocale;

    url.searchParams.append('locale', String(locale));

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (
          key !== 'locale' &&
          value !== undefined &&
          value !== null &&
          value !== ''
        ) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requestOptions?: ApiRequestOptions,
    queryParams?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const locale =
      requestOptions?.locale || queryParams?.locale || this.defaultLocale;
    const url = this.buildUrl(endpoint, { ...queryParams, locale });

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...requestOptions?.headers,
    };

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    let lastError: ApiError = new ApiError('API request failed: no attempts made');

    // Server-side reads go through Next's data cache so concurrent renders of
    // the same URL share a single upstream request. The browser is left alone.
    const isCacheableServerRead =
      typeof window === 'undefined' && (options.method ?? 'GET') === 'GET' && !options.body;
    const cacheInit: RequestInit & { next?: { revalidate: number } } = isCacheableServerRead
      ? { next: { revalidate: SERVER_REVALIDATE_SECONDS } }
      : {};

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      const release = isCacheableServerRead ? await acquireSlot() : null;
      try {
        const response = await fetch(url, {
          ...cacheInit,
          ...options,
          headers,
        });

        if (!response.ok) {
          lastError = new ApiError(
            `API request failed: ${response.status} ${response.statusText}`,
            response.status,
          );
        } else {
          return await response.json();
        }
      } catch (error) {
        // fetch() itself threw (network error, DNS failure, etc.) — no
        // status available, treated as retryable below.
        lastError = new ApiError(
          error instanceof Error ? error.message : 'Network request failed',
        );
      } finally {
        // Released before the backoff wait so a sleeping retry doesn't hold a
        // slot another request could be using.
        release?.();
      }

      const isLastAttempt = attempt === RETRY_ATTEMPTS - 1;
      if (isLastAttempt || !isRetryable(lastError.status)) break;
      await wait(RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]);
    }

    console.error('API request error:', lastError);
    throw lastError;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, options, params);
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: 'POST', body: JSON.stringify(data) },
      options,
    );
  }

  async patch<T>(
    endpoint: string,
    data: unknown,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: 'PATCH', body: JSON.stringify(data) },
      options,
    );
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      { method: 'PUT', body: JSON.stringify(data) },
      options,
    );
  }

  async delete<T>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, options);
  }
}

export const apiClient = new ApiClient(API_BASE_URL, DEFAULT_LOCALE);
