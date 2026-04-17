# SunTalk Admin

SunTalk 채팅앱 관리자 웹페이지 (React + Ant Design)

## 로컬 개발

```bash
npm install
npm start
```

## Docker 배포

Admin은 backend 저장소의 `docker-compose.yml`을 통해 함께 배포됩니다.

```bash
# /opt 디렉토리에 두 저장소를 나란히 클론
git clone https://github.com/road2dr/suntalk-backend.git
git clone https://github.com/road2dr/suntalk-admin.git

cd suntalk-backend
docker compose up -d
```

### 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| REACT_APP_API_URL | Backend API URL | `/api` (Docker) |

Docker 배포 시 nginx가 `/api/` 요청을 backend로 프록시합니다.