const CACHE_NAME = 'rafiq-ramadan-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './quran.html',
  './hadith.html',
  './stories.html',
  './quran_audio.html',
  './videos.html',
  './wird.html',
  './zakat.html',
  './qa.html',
  './css/style.css',
  './css/quran.css',
  './css/quran_audio.css',
  './js/main.js',
  './js/prayers.js',
  './js/storage.js',
  './js/quran.js',
  './js/quran_audio.js',
  './js/videos.js',
  './js/wird.js',
  './js/zakat.js',
  './data/quran.json',
  './data/duas.json',
  './data/hadith.json',
  './data/stories.json',
  './data/qa.json',
  './data/videos.json',
  './manifest.json',
  './image/icon-192.png',
  './image/icon-512.png'
];

// Install Event: Cache Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
          console.warn('[Service Worker] Some assets failed to cache:', error);
          // Continue even if some assets fail
        });
      })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  event.waitUntil(self.clients.claim());
});

// Fetch Event: Serve from Cache or Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
