/**
 * FRIENDLY NEIGHBOR CIVIC AI — Service Worker
 * =============================================
 * Offline-First Strategy for Poll Day Survival
 *
 * Cache-First:     App shell, GeoJSON maps, audio, storyteller scripts, images
 * Network-First:   Misinformation firewall, logistics alerts, live results
 * Stale-While-Revalidate: Multilingual i18n assets
 */

const CACHE_VERSION = 'fn-cache-v3';
const RUNTIME_CACHE = 'fn-runtime-v3';
const LAW_LIBRARY_CACHE = 'fn-law-library-v1';

// ── App Shell — Cache-First (survive with ZERO internet) ──
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/data/india_pc_2019.json', // Heavy map data
  '/favicon.svg',
];

// ── Install: Pre-cache the app shell ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

// ── Activate: Clean old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== RUNTIME_CACHE)
          .map((key) => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// ── Fetch Strategy Router ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith('http')) return;

  // ── Strategy 1: Network-First (live data) ──
  if (isLiveDataRequest(url)) {
    event.respondWith(isLawLibraryRequest(url) ? staleWhileRevalidateLawLibrary(request) : networkFirst(request));
    return;
  }

  // ── Strategy 2: Stale-While-Revalidate (i18n) ──
  if (isI18nRequest(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // ── Strategy 3: Cache-First (everything else = app shell) ──
  event.respondWith(cacheFirst(request));
});

// ── Pattern Matchers ──
function isLiveDataRequest(url) {
  const livePatterns = [
    '/api/',
    'rumor-firewall',
    'logistics-alerts',
    'simulated-results',
  ];
  return livePatterns.some((p) => url.pathname.includes(p) || url.href.includes(p));
}

function isLawLibraryRequest(url) {
  return url.pathname.includes('/api/law-library/');
}

function isI18nRequest(url) {
  return url.pathname.includes('/i18n/') || url.pathname.includes('/locales/');
}

// ── Cache-First Strategy ──
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Offline fallback: return the cached index.html for navigation
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

// ── Network-First Strategy ──
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true, message: 'Data will sync when back online' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503,
    });
  }
}

async function staleWhileRevalidateLawLibrary(request) {
  const cache = await caches.open(LAW_LIBRARY_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise || new Response(JSON.stringify({
    offline: true,
    message: 'Document is not cached yet.',
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 503,
  });
}

// ── Stale-While-Revalidate Strategy ──
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(RUNTIME_CACHE);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ── Background Sync: Village Square Offline Q&A ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-questions') {
    event.waitUntil(syncPendingQuestions());
  }
});

async function syncPendingQuestions() {
  try {
    // Open IndexedDB and read pending questions
    const db = await openDB();
    const tx = db.transaction('pendingQuestions', 'readonly');
    const store = tx.objectStore('pendingQuestions');
    const questions = await getAllFromStore(store);

    for (const q of questions) {
      try {
        await fetch('/api/village-square/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(q),
        });
        // Remove synced question
        const delTx = db.transaction('pendingQuestions', 'readwrite');
        delTx.objectStore('pendingQuestions').delete(q.id);
      } catch (err) {
        console.log('[SW] Sync failed for question:', q.id);
      }
    }

    // Notify user
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          message: "Neighbor, I've got your question! I'll get you an answer as soon as I'm back in range.",
        });
      });
    });
  } catch (err) {
    console.log('[SW] Background sync error:', err);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FriendlyNeighborDB', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('pendingQuestions', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => resolve([]);
  });
}

console.log('[SW] Friendly Neighbor Service Worker loaded — your civic companion is ready!');
