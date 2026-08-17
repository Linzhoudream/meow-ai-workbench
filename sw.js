// 猫咪报 · 林舟编辑部 — Service Worker (PWA 离线缓存)
const CACHE_NAME = "meow-editor-v1";
const ASSETS = [
  "workbench-desktop.html",
  "manifest.json",
  "assets/greet-banner.jpg",
  "assets/paper-texture.jpg"
];

// 安装：预缓存核心文件
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// 请求：缓存优先，网络回退
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if(response && response.status === 200){
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached || new Response("离线模式，暂无缓存", {status: 503}));
    })
  );
});