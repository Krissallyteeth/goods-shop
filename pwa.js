// ===== PWA: 서비스 워커 등록 + "홈 화면에 추가" 안내 =====
// 모든 페이지에서 app.js 뒤에 로드됩니다. 백엔드(Supabase·토스)와 무관한 프런트 전용.

// 1) 서비스 워커 등록 (오프라인 캐시 담당)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW 등록 실패:", e));
  });
}

// 2) 설치 안내 배너 -----------------------------------------------------------
(function installBanner() {
  const DISMISS_KEY = "pwa-install-dismissed"; // 한 번 닫으면 다시 안 뜨게
  let deferredPrompt = null; // Android/Chrome 의 설치 이벤트 저장용

  // 이미 앱으로 설치돼 실행 중이면(홈 화면 아이콘) 아무것도 안 함
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const alreadyDismissed = localStorage.getItem(DISMISS_KEY) === "1";

  if (isStandalone || !isMobile || alreadyDismissed) return;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    const el = document.getElementById("pwa-banner");
    if (el) el.remove();
  }

  // 배너 DOM 을 직접 만들어 body 에 붙임 (각 HTML 수정 최소화)
  function showBanner(innerHTML) {
    if (document.getElementById("pwa-banner")) return;
    const bar = document.createElement("div");
    bar.id = "pwa-banner";
    bar.className = "pwa-banner";
    bar.innerHTML = innerHTML;
    document.body.appendChild(bar);
  }

  // (A) Android/Chrome: 브라우저가 주는 설치 이벤트를 가로채 커스텀 배너로 안내
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // 브라우저 기본 미니 배너 막고
    deferredPrompt = e; // 나중에 우리가 prompt() 호출
    showBanner(
      `<span class="pwa-text">turingshop을 홈 화면에 추가할까요?</span>
       <span class="pwa-actions">
         <button class="btn" id="pwa-add" style="width:auto;min-height:40px;padding:8px 16px;">추가</button>
         <button class="btn secondary" id="pwa-later" style="width:auto;min-height:40px;padding:8px 16px;">나중에</button>
       </span>`
    );
    document.getElementById("pwa-add").addEventListener("click", async () => {
      const el = document.getElementById("pwa-banner");
      if (el) el.remove();
      deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(() => {});
      deferredPrompt = null;
      localStorage.setItem(DISMISS_KEY, "1"); // 응답했으면 다시 안 띄움
    });
    document.getElementById("pwa-later").addEventListener("click", dismiss);
  });

  // 설치가 끝나면 배너 정리
  window.addEventListener("appinstalled", dismiss);

  // (B) iOS Safari: beforeinstallprompt 가 없음 → 수동 안내 문구만
  if (isIOS && !window.navigator.standalone) {
    // 페이지가 다 뜬 뒤 살짝 안내
    window.addEventListener("load", () => {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
      showBanner(
        `<span class="pwa-text">Safari 공유 버튼 → "홈 화면에 추가"로 앱처럼 쓸 수 있어요.</span>
         <span class="pwa-actions">
           <button class="btn secondary" id="pwa-later" style="width:auto;min-height:40px;padding:8px 16px;">닫기</button>
         </span>`
      );
      document.getElementById("pwa-later").addEventListener("click", dismiss);
    });
  }
})();
