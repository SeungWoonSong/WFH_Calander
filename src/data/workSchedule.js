// 팀별 월간 출근 스케줄
export const teamSchedules = {
  "2025-01": {
    Orcas: 1,      // 월화수 출근
    ApplePie: 2,   // 화수목 출근
    Adelie: 3,     // 수목금 출근
    Skywalker: 4,  // 목금월 출근
    Carina: 5,     // 금월화 출근
    Glider: 6,     // 월화수 출근
    Moonwalker: 7, // 수목금 출근
  },
  "2025-02": {
    Orcas: 2,      // 화수목 출근
    ApplePie: 3,   // 수목금 출근
    Adelie: 4,     // 목금월 출근
    Skywalker: 5,  // 금월화 출근
    Carina: 6,     // 월화수 출근
    Glider: 7,     // 수목금 출근
    Moonwalker: 1, // 월화수 출근
  },
  "2025-03": {
    Orcas: 3,      // 수목금 출근
    ApplePie: 4,   // 목금월 출근
    Adelie: 5,     // 금월화 출근
    Skywalker: 6,  // 월화수 출근
    Carina: 7,     // 수목금 출근
    Glider: 1,     // 월화수 출근
    Moonwalker: 2, // 화수목 출근
  },
  "2025-04": {
    Orcas: 4,      // 목금월 출근
    ApplePie: 5,   // 금월화 출근
    Adelie: 6,     // 월화수 출근
    Skywalker: 7,  // 수목금 출근
    Carina: 1,     // 월화수 출근
    Glider: 2,     // 화수목 출근
    Moonwalker: 3, // 수목금 출근
  },
  "2025-05": {
    Orcas: 5,      // 금월화 출근
    ApplePie: 6,   // 월화수 출근
    Adelie: 7,     // 수목금 출근
    Skywalker: 1,  // 월화수 출근
    Carina: 2,     // 화수목 출근
    Glider: 3,     // 수목금 출근
    Moonwalker: 4, // 목금월 출근
  },
  "2025-06": {
    Orcas: 6,      // 월화수 출근
    ApplePie: 7,   // 수목금 출근
    Adelie: 1,     // 월화수 출근
    Skywalker: 2,  // 화수목 출근
    Carina: 3,     // 수목금 출근
    Glider: 4,     // 목금월 출근
    Moonwalker: 5, // 금월화 출근
  },
  "2025-07": {
    Orcas: 7,      // 수목금 출근
    ApplePie: 1,   // 월화수 출근
    Adelie: 2,     // 화수목 출근
    Skywalker: 3,  // 수목금 출근
    Carina: 4,     // 목금월 출근
    Glider: 5,     // 금월화 출근
    Moonwalker: 6, // 월화수 출근
  },
  "2025-08": {
    Orcas: 1,      // 월화수 출근
    ApplePie: 2,   // 화수목 출근
    Adelie: 3,     // 수목금 출근
    Skywalker: 4,  // 목금월 출근
    Carina: 5,     // 금월화 출근
    Glider: 6,     // 월화수 출근
    Moonwalker: 7, // 수목금 출근
  },
  "2025-09": {
    Orcas: 2,      // 화수목 출근
    ApplePie: 3,   // 수목금 출근
    Adelie: 4,     // 목금월 출근
    Skywalker: 5,  // 금월화 출근
    Carina: 6,     // 월화수 출근
    Glider: 7,     // 수목금 출근
    Moonwalker: 1, // 월화수 출근
  },
  "2025-10": {
    Orcas: 3,      // 수목금 출근
    ApplePie: 4,   // 목금월 출근
    Adelie: 5,     // 금월화 출근
    Skywalker: 6,  // 월화수 출근
    Carina: 7,     // 수목금 출근
    Glider: 1,     // 월화수 출근
    Moonwalker: 2, // 화수목 출근
  },
  "2025-11": {
    Orcas: 4,      // 목금월 출근
    ApplePie: 5,   // 금월화 출근
    Adelie: 6,     // 월화수 출근
    Skywalker: 7,  // 수목금 출근
    Carina: 1,     // 월화수 출근
    Glider: 2,     // 화수목 출근
    Moonwalker: 3, // 수목금 출근
  },
  "2025-12": {
    Orcas: 5,      // 금월화 출근
    ApplePie: 6,   // 월화수 출근
    Adelie: 7,     // 수목금 출근
    Skywalker: 1,  // 월화수 출근
    Carina: 2,     // 화수목 출근
    Glider: 3,     // 수목금 출근
    Moonwalker: 4, // 목금월 출근
  }
};

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
