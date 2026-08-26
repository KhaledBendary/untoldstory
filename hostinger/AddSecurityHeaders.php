<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Drop this into the Laravel app on Hostinger and register it in
 * bootstrap/app.php (Laravel 11+) or app/Http/Kernel.php:
 *
 *   ->withMiddleware(fn ($m) => $m->append(\App\Http\Middleware\AddSecurityHeaders::class))
 *
 * Also set expose_php = Off in php.ini / .htaccess: php_flag expose_php Off
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
