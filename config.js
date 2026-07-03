// ===== Supabase 공개 설정 =====
// 아래 두 값은 브라우저에 노출돼도 안전한 "공개용" 값입니다.
// (RLS 로 데이터 접근을 막기 때문에 anon 키는 공개되어도 괜찮습니다.)
// ⚠️ service_role 키 / 토스 시크릿 키는 절대 여기에 넣지 마세요!

window.SUPABASE_URL = "https://ghptwxrixgogkvpxahoo.supabase.co";

// publishable 키 (신규 권장 형식)
window.SUPABASE_ANON_KEY = "sb_publishable_oSLv_iw9Cvq525qjEsX7Vw_60XvrqV4";

// 토스페이먼츠 "클라이언트 키"(테스트)는 공개용이라 여기에 둬도 됩니다.
// 아래는 토스 공개 테스트 키입니다. (시크릿 키 아님! 실제 청구 없음)
// 내 토스 계정 키를 쓰려면 이 값과 Edge Function 의 TOSS_SECRET_KEY 를 세트로 바꾸세요.
window.TOSS_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
