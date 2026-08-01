/* ============================================
   Service Worker - 离线缓存
   每日打卡 · 自律成长工作台
   ============================================ */

const CACHE_VERSION = 'v1.3.1';
const CACHE_NAME = `checkin-app-${CACHE_VERSION}`;

// 需要缓存的资源列表
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './detail-reading.html',
  './detail-eating.html',
  './detail-exercise.html',
  './detail-weight.html',
  './detail-baking.html',
  './detail-fashion.html',
  './detail-finance.html',
  './detail-media.html',
  './detail-news.html',
  './detail-photo.html',
  './detail-podcast.html',
  './detail-review.html',
  './inspiration.html',
  './detail-common.css',
  './detail-common.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

/* ============================================
   安装：预缓存核心资源
   ============================================ */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 预缓存资源');
      return cache.addAll(CACHE_URLS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

/* ============================================
   激活：清理旧缓存
   ============================================ */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] 删除旧缓存:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

/* ============================================
   请求拦截：缓存优先，网络回退
   ============================================ */
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  // 导航请求：网络优先，回退到缓存（确保页面最新）
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 成功获取，更新缓存
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 离线时回退到缓存
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // 静态资源：缓存优先，网络回退
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // 后台更新缓存
        fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
        }).catch(() => {});
        return cached;
      }
      // 缓存没有，从网络获取
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});

/* ============================================
   消息通信：支持手动更新
   ============================================ */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
