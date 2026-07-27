// ===== 굿즈샵 서비스 워커 =====
// 역할: "앱 화면"(내 정적 파일)만 캐시해서 오프라인에서도 껍데기가 뜨게 함.
// 절대 하지 않는 것: 로그인·상품데이터·결제 같은 동적/외부 요청 캐시.
//   → Supabase·토스·상품이미지(교차 출처)는 건드리지 않고 그대로 네트워크로 보냄.
//
// 배포로 파일을 바꾸면 아래 CACHE 버전 문자열을 올리세요(예: v1 → v2).
// 그래야 사용자 기기의 옛 캐시가 정리되고 새 파일을 받습니다.
const CACHE = "굿즈샵-v1";

// 미리 받아둘 앱 셸(모두 동일 출처 정적 파일). 상대경로라 GitHub Pages 하위 경로도 OK.
const SHELL = [
  "./",
  "./index.html",
  "./login.html",
  "./orders.html",
  "./admin.html",
  "./success.html",
  "./fail.html",
  "./style.css",
  "./app.js",
  "./config.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// 설치: 앱 셸을 캐시에 담고 곧바로 활성화.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// 활성화: 옛 버전 캐시 삭제 + 열린 탭 즉시 제어.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) GET 이 아니거나(=POST 등), 2) 교차 출처면 → 손대지 않고 그대로 네트워크.
  //    이게 핵심 안전장치: Supabase 인증/DB, 토스 결제, 상품 이미지는 절대 캐시되지 않는다.
  if (req.method !== "GET" || url.origin !== self.location.origin) {
    return; // 브라우저 기본 동작(네트워크)에 맡김
  }

  // 페이지 이동(HTML): network-first → 온라인이면 항상 최신(결제 success/fail 도 stale 안 됨),
  //                    오프라인이면 캐시로 폴백.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  // 그 외 동일 출처 정적 자산(css/js/아이콘): cache-first → 없으면 네트워크 후 캐시.
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
