# cnolplay.com

크놀(CNOL) 소개 사이트 — 크놀뮤직 · 크놀AD 상세 설명.

- 호스팅: Vercel (main 브랜치에 커밋하면 자동 배포)
- 도메인: cnolplay.com / www.cnolplay.com (DNS는 Cloudflare, Vercel로 연결)
- 문의 폼: Supabase `cnolplay_inquiries` 테이블에 저장 (공개 키는 저장만 가능, 조회는 Supabase 대시보드에서)

## 파일

| 파일 | 내용 |
| --- | --- |
| `index.html` | 홈 — 두 서비스 소개, 비교, 문의 폼 |
| `music.html` | 크놀뮤직 상세 (`/music`) |
| `ad.html` | 크놀AD 상세 (`/ad`) |
| `style.css`, `main.js` | 공통 스타일·스크립트 (문의 폼 전송 포함) |
| `vercel.json` | 깔끔한 주소(.html 생략), 예전 주소(/company, /features) → 홈 이동, 보안 헤더 |

정적 HTML이라 빌드 과정이 없습니다. 문구를 고치려면 해당 HTML 파일을 직접 수정하면 됩니다.
