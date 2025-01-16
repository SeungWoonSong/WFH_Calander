# WFH Calendar (Work From Home Calendar)

팀별 재택/출근 현황을 한눈에 확인할 수 있는 웹 애플리케이션입니다.

## 주요 기능

### 1. 팀별 근무 현황 확인
- 7개 팀(Orcas, ApplePie, Adelie, Skywalker, Carina, Glider, Moonwalker)의 일일 근무 상태 확인
- 상태 구분:
  - 🏢 사무실 출근
  - 🏠 재택
  - 📅 권장휴무 재택
  - 😴 쉬는 날

### 2. 출근 패턴
각 팀은 아래 7가지 패턴 중 하나로 운영됩니다:
1. 월화수 출근
2. 화수목 출근
3. 수목금 출근
4. 목금월 출근
5. 금월화 출근
6. 월화수 출근
7. 수목금 출근

### 3. 휴일 정보
- 공휴일 목록 확인
- 권장휴무일 목록 확인
- 각 날짜별 요일 정보 제공

## 기술 스택

- React
- Emotion (CSS-in-JS)
- date-fns (날짜 처리)

## 설치 및 실행

1. 필수 요구사항:
   ```bash
   Node.js 14.0.0 이상
   ```

2. 설치:
   ```bash
   npm install
   # 또는
   yarn install
   ```

3. 개발 서버 실행:
   ```bash
   npm start
   # 또는
   yarn start
   ```

## 데이터 관리

### 공휴일/권장휴무일 수정
`src/data/workSchedule.js` 파일에서 관리:
```javascript
export const holidays = [
  { date: "YYYY-MM-DD", name: "휴일명" },
  // ...
];

export const recommendedHolidays = [
  { date: "YYYY-MM-DD", name: "휴무일명" },
  // ...
];
```

### 팀 정보 수정
```javascript
export const teams = {
  팀이름: 출근패턴번호,
  // ...
};
```

## 반응형 디자인

- 데스크톱: 카드 형태의 그리드 레이아웃
- 모바일: 테이블 형태의 컴팩트한 레이아웃
- 브레이크포인트: 768px

## 라이선스

MIT License

## 기여하기

1. 이 저장소를 포크합니다
2. 새로운 브랜치를 생성합니다
3. 변경사항을 커밋합니다
4. 브랜치에 푸시합니다
5. Pull Request를 생성합니다