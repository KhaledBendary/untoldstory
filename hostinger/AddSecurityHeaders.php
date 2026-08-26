<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Hostinger install (api.globaluntoldstory.com):
 *
 * 1. File Manager → domain folder → app/Http/Middleware/
 *    Upload this file as AddSecurityHeaders.php
 * 2. Open bootstrap/app.php and append the middleware:
 *
 *    ->withMiddleware(function ($middleware) {
 *        $middleware->append(\App\Http\Middleware\AddSecurityHeaders::class);
 *    })
 *
 * 3. Merge hostinger/.htaccess Header rules into Laravel public/.htaccess
 *    (do not replace the RewriteEngine block).
 * 4. php_flag expose_php Off (already in that .htaccess snippet).
 */
class AddSecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->remove('X-Powered-By');
        $response->headers->remove('platform');
        $response->headers->remove('panel');

        $response->headers->set('X-Content-Type-Options', 'nosniff', false);
        $response->headers->set('X-Frame-Options', 'DENY', false);
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin', false);
        $response->headers->set(
            'Strict-Transport-Security',
            'max-age=63072000; includeSubDomains; preload',
            false,
        );
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=()',
            false,
        );

        if (str_starts_with($request->path(), 'admin')) {
            $response->headers->set(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests",
                false,
            );
        }

        return $response;
    }
}
