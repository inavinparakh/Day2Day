const CACHE_NAME = 'ndp-v1';
const APP_SHELL = [
  './',
  'index.html',
  'styles.css',
  'manifest.json',
  'config.js',
  'db.js',
  'utils.js',
  'categories.js',
  'tasks.js',
  'ui.js',
  'calendar.js',
  'notifications.js',
  'alarms.js',
  'backup.js',
  'google-drive.js',
  'settings.js',
  'app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

