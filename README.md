# cnolplay.com

크놀(CNOL) 소개 사이트 — 크놀뮤직 · 크놀AD 상세 설명.

- 호스팅: Vercel (main 브랜치에 커밋하면 자동 배포)
- 도메인: cnolplay.com / www.cnolplay.com (DNS는 Cloudflare, Vercel로 연결)
- 디자인: Material Design 3 (CNOL 브랜드 색으로 테마), 글꼴 Pretendard, 아이콘 Material Symbols
- 모션: HR Motion Kit (`motion-head.js`, `motion.css`, `motion.js` — whrcompany.com 메인과 같은 파일). 부채꼴 카드·카드 넘기기·페이지 전환은 그대로 쓰고, 스크롤 등장(떠오르기)과 마우스 기울기·자석 효과는 끔
- 문의 폼: Supabase `cnolplay_inquiries` 테이블에 저장 + support@whrcompany.com 으로 메일 자동 전달(FormSubmit, 제목 `[크놀플레이 문의] …`)

## 파일

| 파일 | 내용 |
| --- | --- |
| `index.html` | 홈 — 부채꼴 카드, 두 서비스 소개, 카드 넘기기, 비교, 문의 폼 |
| `music.html` | 크놀뮤직 상세 (`/music`) |
| `ad.html` | 크놀AD 상세 (`/ad`) |
| `style.css` | 머티리얼 디자인 스타일 + 모션 키트 색 설정 |
| `main.js` | 리플, 상단 바, 메뉴, 문의 버튼, 문의 폼 전송(저장 + 메일) |
| `motion-head.js` · `motion.css` · `motion.js` | HR Motion Kit (수정 없이 그대로) |
| `favicon.svg` · `favicon.ico` · `logo-mark.svg` | CNOL C 로고 |
| `vercel.json` | 깔끔한 주소(.html 생략), 예전 주소(/company, /features) → 홈 이동, 보안 헤더 |

정적 HTML이라 빌드 과정이 없습니다. 문구를 고치려면 해당 HTML 파일을 직접 수정하면 됩니다.
