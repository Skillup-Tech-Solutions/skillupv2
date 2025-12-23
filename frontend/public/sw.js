// Service Worker for Image Caching
// Strategy: Stale-While-Revalidate for images

const CACHE_NAME = 'skillup-image-cache-v1';
const MAX_CACHE_SIZE = 100; // Max number of cached items

// File types to cache
const CACHEABLE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.pdf'];

// Check if request is for a cacheable file
function isCacheable(url) {
    const pathname = new URL(url).pathname.toLowerCase();
    return CACHEABLE_EXTENSIONS.some(ext => pathname.endsWith(ext));
}

// Limit cache size
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        // Delete oldest items (FIFO)
        const deleteCount = keys.length - maxItems;
        for (let i = 0; i < deleteCount; i++) {
            await cache.delete(keys[i]);
        }
    }
}

// Install event - precache critical assets if needed
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    self.skipWaiting(); // Activate immediately
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim(); // Take control of all pages
});

// Fetch event - Stale-While-Revalidate for images
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET requests for cacheable files
    if (request.method !== 'GET' || !isCacheable(request.url)) {
        return;
    }

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // Try to get from cache first (stale)
            const cachedResponse = await cache.match(request);

            // Fetch fresh version in background (revalidate)
            const fetchPromise = fetch(request)
                .then(async (networkResponse) => {
                    // Only cache successful responses
                    if (networkResponse.ok) {
                        // Clone response before caching (streams can only be read once)
                        cache.put(request, networkResponse.clone());
                        // Trim cache to prevent bloat
                        await trimCache(CACHE_NAME, MAX_CACHE_SIZE);
                    }
                    return networkResponse;
                })
                .catch((error) => {
                    console.log('[SW] Fetch failed, serving cached version:', error);
                    return cachedResponse; // Fall back to cached version
                });

            // Return cached version immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        })()
    );
});
