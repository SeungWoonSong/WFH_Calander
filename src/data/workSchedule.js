// 요일별 출근 패턴
export const workPatterns = {
  1: ["월", "화", "수"],
  2: ["화", "수", "목"],
  3: ["수", "목", "금"],
  4: ["목", "금", "월"],
  5: ["금", "월", "화"],
  6: ["월", "화", "수"],
  7: ["수", "목", "금"],
};

// 초기 팀별 패턴 (2025년 1월 기준)
const initialTeamPatterns = {
  Orcas: 1,
  ApplePie: 2,
  Adelie: 3,
  Skywalker: 4,
  Carina: 5,
  Glider: 6,
  Moonwalker: 7,
};

// 월별 패턴 계산 함수
const getMonthlyPattern = (startPattern, monthOffset) => {
  // (시작 패턴 + 월 오프셋 - 1) % 7 + 1
  // -1과 +1을 하는 이유는 패턴이 1부터 7까지이기 때문
  return ((startPattern + monthOffset - 1) % 7) + 1;
};

// 특정 년월의 팀별 스케줄 생성
const generateMonthlySchedule = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);
  // 2025-01 기준으로 몇 개월이 지났는지 계산
  const monthsOffset = (year - 2025) * 12 + (month - 1);
  
  const schedule = {};
  Object.entries(initialTeamPatterns).forEach(([team, startPattern]) => {
    schedule[team] = getMonthlyPattern(startPattern, monthsOffset);
  });
  
  return schedule;
};

// 팀별 월간 출근 스케줄
export const getTeamSchedule = (yearMonth) => {
  return generateMonthlySchedule(yearMonth);
};

// 공휴일 데이터 (YYYY-MM-DD 형식)
export const holidays = [
  { date: "2025-01-01", name: "신정" },
  { date: "2025-01-27", name: "설날 임시공휴일" },
  { date: "2025-01-28", name: "설날 당일" },
  { date: "2025-01-29", name: "설날 연휴" },
  { date: "2025-01-30", name: "설날 연휴" },
  { date: "2025-03-01", name: "삼일절" },
  { date: "2025-05-01", name: "근로자의 날" },
  { date: "2025-05-05", name: "어린이날" },
  { date: "2025-05-06", name: "어린이날 대체공휴일" },
  { date: "2025-06-06", name: "현충일" },
  { date: "2025-07-04", name: "창립기념일" },
  { date: "2025-08-15", name: "광복절" },
  { date: "2025-10-03", name: "개천절" },
  { date: "2025-10-05", name: "추석 연휴" },
  { date: "2025-10-06", name: "추석 당일" },
  { date: "2025-10-07", name: "추석 연휴" },
  { date: "2025-10-08", name: "추석 대체공휴일" },
  { date: "2025-10-09", name: "한글날" },
  { date: "2025-12-25", name: "성탄절" },
  { date: "2025-12-31", name: "연말" },
];

// 권장 휴무일 데이터 (YYYY-MM-DD 형식)
export const recommendedHolidays = [
  { date: "2025-01-31", name: "1월 마지막 금요일" },
  { date: "2025-02-21", name: "2월 마지막 금요일" },
  { date: "2025-03-21", name: "3월 마지막 금요일" },
  { date: "2025-04-18", name: "4월 마지막 금요일" },
  { date: "2025-05-02", name: "5월 첫째 금요일" },
  { date: "2025-08-14", name: "광복절 연휴" },
  { date: "2025-09-19", name: "9월 마지막 금요일" },
  { date: "2025-10-10", name: "한글날 연휴" },
  { date: "2025-11-03", name: "11월 첫째 월요일" },
  { date: "2025-11-13", name: "11월 둘째 목요일" },
  { date: "2025-12-24", name: "성탄절 연휴" },
  { date: "2025-12-26", name: "성탄절 연휴" },
  { date: "2025-12-29", name: "연말 휴무" },
  { date: "2025-12-30", name: "연말 휴무" },
];
