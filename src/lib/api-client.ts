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

/**
 * The upstream API is a shared-host Laravel app that intermittently 500s while
 * a build walks every page — the same URLs return 200 the moment the burst
 * passes. Retrying patiently is what keeps prerendered pages from shipping
 * their empty retry state, so back off far enough to outlast a bad window.
 *
 * During `next build` on Vercel the host is often unreachable, and six long
 * retries across hundreds of pages stall the deploy until it errors. Fail
 * faster there, and trip a short circuit so the rest of the build uses
 * editorial fallbacks instead of waiting on a dead connection.
 */
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const RETRY_ATTEMPTS = IS_BUILD ? 2 : 6;
const RETRY_DELAYS_MS = IS_BUILD ? [400, 1000] : [500, 1500, 3000, 6000, 10000];
const CIRCUIT_AFTER = 3;
const CIRCUIT_MS = 60_000;

type CircuitState = { fails: number; openedAt: number };
const CIRCUIT_KEY = Symbol.for("globaluntoldstory.api-client.circuit");
const circuitScope = globalThis as unknown as Record<symbol, CircuitState | undefined>;
const circuit: CircuitState =
  circuitScope[CIRCUIT_KEY] ?? (circuitScope[CIRCUIT_KEY] = { fails: 0, openedAt: 0 });

function circuitOpen() {
  if (circuit.fails < CIRCUIT_AFTER) return false;
  if (Date.now() - circuit.openedAt > CIRCUIT_MS) {
    circuit.fails = 0;
    circuit.openedAt = 0;
    return false;
  }
  return true;
}

function noteNetworkFailure() {
  circuit.fails += 1;
  if (circuit.fails >= CIRCUIT_AFTER) circuit.openedAt = Date.now();
}

function noteSuccess() {
  circuit.fails = 0;
  circuit.openedAt = 0;
}

/** Spread simultaneous retries so they don't re-collide on the same tick. */
function backoffFor(attempt: number): number {
  const base = RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
  return base + Math.floor(Math.random() * 400);
}

/**
 * Seconds Next.js may serve a cached API response before refetching.
 *
 * This also makes the build survivable: `next build` renders with many workers
 * at once, and every page hits the API twice (generateMetadata, then the page
 * body). Un-deduped, that burst made the upstream Laravel app return 500s, and
 * pages silently fell back to default metadata. Going through Next's data cache
 * collapses identical URLs into one request.
 */
const SERVER_REVALIDATE_SECONDS = 86400;

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


/**
 * In-process response cache for server reads.
 *
 * A build renders 490 pages and every page of a locale asks for that locale's
 * list endpoints, so the same URL was being fetched hundreds of times. Next's
 * data cache does not span build workers, and the upstream API collapses well
 * before that volume — pages then rendered their empty retry state with no
 * <h1>. Caching the in-flight promise per URL collapses all of it into one
 * request, and the TTL matches the revalidate window so a long-running server
 * still picks up CMS edits.
 */
/**
 * Bundlers hand each route graph its own copy of this module, so a plain
 * module-scope counter would give every copy its own budget and the real
 * concurrency would be a multiple of the limit. Anchoring the state on
 * globalThis makes all copies inside one process share a single gate.
 */
type ApiRuntimeState = {
  cache: Map<string, { at: number; value: Promise<unknown> }>;
  inFlight: number;
  waiting: Array<() => void>;
};

const RUNTIME_KEY = Symbol.for("globaluntoldstory.api-client.runtime");
const globalScope = globalThis as unknown as Record<symbol, ApiRuntimeState | undefined>;

const runtime: ApiRuntimeState =
  globalScope[RUNTIME_KEY] ??
  (globalScope[RUNTIME_KEY] = { cache: new Map(), inFlight: 0, waiting: [] });

const responseCache = runtime.cache;

function cachedRead<T>(url: string, load: () => Promise<T>): Promise<T> {
  const hit = responseCache.get(url);
  const now = Date.now();
  if (hit && now - hit.at < SERVER_REVALIDATE_SECONDS * 1000) return hit.value as Promise<T>;

  const value = load().catch((error) => {
    // A failure must not be cached, or one blip poisons the whole build.
    responseCache.delete(url);
    throw error;
  });
  responseCache.set(url, { at: now, value });
  return value;
}

async function acquireSlot(): Promise<() => void> {
  while (runtime.inFlight >= MAX_SERVER_CONCURRENCY) {
    await new Promise<void>(resolve => runtime.waiting.push(resolve));
  }
  runtime.inFlight++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    runtime.inFlight--;
    runtime.waiting.shift()?.();
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

    const isServerRead =
      typeof window === 'undefined' && (options.method ?? 'GET') === 'GET' && !options.body;
    if (isServerRead) {
      return cachedRead<T>(url, () => this.fetchWithRetry<T>(url, options, requestOptions, true));
    }
    return this.fetchWithRetry<T>(url, options, requestOptions, false);
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    requestOptions: ApiRequestOptions | undefined,
    isCacheableServerRead: boolean,
  ): Promise<T> {

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...requestOptions?.headers,
    };

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    let lastError: ApiError = new ApiError('API request failed: no attempts made');

    if (isCacheableServerRead && circuitOpen()) {
      throw new ApiError("API circuit open: upstream unreachable");
    }

    // Server-side reads also go through Next's data cache, so a rebuilt page
    // can reuse a response across processes. The browser is left alone.
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
          noteSuccess();
          return await response.json();
        }
      } catch (error) {
        // fetch() itself threw (network error, DNS failure, etc.) — no
        // status available, treated as retryable below.
        noteNetworkFailure();
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
      await wait(backoffFor(attempt));
    }

    // Name the URL: "API request failed: 500" alone gives no way to tell which
    // endpoint, locale or slug actually broke.
    console.error(`API request error [${url}]:`, lastError.message);
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
