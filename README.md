# 생기재가복지센터 홈페이지

## 로컬에서 실행하기

Node.js 18 이상이 설치된 환경에서 아래 명령을 실행합니다. 외부 패키지를 사용하지 않으므로 `npm install`은 필요하지 않습니다.

```powershell
cd "D:\생기재가복지센터\vitality homepage"
npm run dev
```

브라우저에서 <http://localhost:5173>을 열면 홈페이지를 확인할 수 있습니다.

다른 포트를 사용하려면 다음과 같이 실행합니다.

```powershell
$env:PORT=3000
npm run dev
```

홈페이지 소스는 `site/dist` 폴더에 있습니다.

- `site/dist/index.html`: 페이지 구조와 문구
- `site/dist/styles.css`: 디자인과 반응형 스타일
- `site/dist/script.js`: 메뉴와 화면 동작
