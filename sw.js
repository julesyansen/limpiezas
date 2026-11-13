// MOORIA: service worker. Permite abrir la app SIN señal.
// Con internet: siempre intenta primero la red (las actualizaciones llegan al tiro).
// Sin internet: abre la última versión guardada en el teléfono.
var CACHE = "mooria-v2";
var LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all([
      fetch("./", { cache: "reload" }).then(function (r) { if (r.ok) return c.put("./", r); }).catch(function () {}),
      fetch(LIB, { mode: "no-cors" }).then(function (r) { return c.put(LIB, r); }).catch(function () {})
    ]);
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (r.url === LIB) {
    e.respondWith(caches.match(LIB).then(function (m) {
      var net = fetch(r).then(function (res) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(LIB, cp); }); return res; });
      return m || net;
    }));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r.mode === "navigate" ? "./" : r, cp); }); }
    return res;
  }).catch(function () {
    return caches.match(r, { ignoreSearch: true }).then(function (m) { return m || caches.match("./"); });
  }));
});
