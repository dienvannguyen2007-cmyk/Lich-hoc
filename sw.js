// Service Worker — Lịch Học & Thu Nhập
const CACHE = "lich-hoc-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json"
];

// Cài đặt: cache các file cần thiết
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Kích hoạt: xóa cache cũ
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: dùng cache trước, fallback về network
self.addEventListener("fetch", e => {
  // Bỏ qua Google Fonts và GAS (cần mạng)
  if (e.request.url.includes("fonts.googleapis") ||
      e.request.url.includes("script.google.com")) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache các response hợp lệ
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
