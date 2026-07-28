// ===== 공통 헬퍼 =====
// 모든 페이지가 이 파일을 씁니다. (config.js → supabase CDN → app.js 순서로 로드)

// Supabase 클라이언트 하나 만들어서 공유합니다.
const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// 관리자 계정 이메일 (이 이메일로 로그인하면 관리자 메뉴가 보입니다)
const ADMIN_EMAIL = "admin@admin.com";

// 지금 로그인한 사용자를 돌려줍니다. (없으면 null)
async function getUser() {
  const { data } = await sb.auth.getUser();
  return data.user;
}

// 로그아웃 후 로그인 페이지로 이동
async function logout() {
  await sb.auth.signOut();
  location.href = "login.html";
}

// 로그인이 필요한 페이지에서 호출: 로그인 안 했으면 login.html 로 보냅니다.
async function requireLogin() {
  const user = await getUser();
  if (!user) {
    location.href = "login.html";
    return null;
  }
  return user;
}

// 가격을 "12,000원" 형태로 표시
function won(n) {
  return Number(n).toLocaleString("ko-KR") + "원";
}

// 주문 상태를 한글 배지로
function statusLabel(status) {
  const map = {
    PAID: '<span class="badge badge-paid">결제완료</span>',
    PENDING: '<span class="badge badge-pending">결제대기</span>',
    FAILED: '<span class="badge badge-failed">결제실패</span>',
  };
  return map[status] || status;
}

// 날짜를 보기 좋게
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}

// 상단 네비게이션을 그립니다. (로그인 상태·관리자 여부에 따라 메뉴가 달라짐)
async function renderNav(active) {
  // 백엔드(Supabase)가 응답하지 않아도 내비게이션은 떠야 하므로, 실패 시 비로그인으로 취급.
  let user = null;
  try {
    user = await getUser();
  } catch {
    user = null;
  }
  const isAdmin = user && user.email === ADMIN_EMAIL;
  const link = (href, label) =>
    `<a href="${href}" class="${active === href ? "active" : ""}">${label}</a>`;

  let right = "";
  if (user) {
    right =
      link("orders.html", "내 결제내역") +
      (isAdmin ? link("admin.html", "관리자") : "") +
      `<button class="nav-btn" onclick="logout()">로그아웃</button>`;
  } else {
    right = link("login.html", "로그인");
  }

  const nav = document.createElement("header");
  nav.className = "nav";
  nav.innerHTML =
    `<a href="index.html" class="brand">🛍️ 굿즈샵</a>` +
    `<nav>${link("index.html", "상품")}${right}</nav>`;
  document.body.prepend(nav);
}
