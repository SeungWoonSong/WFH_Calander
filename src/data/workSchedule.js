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
export const initialTeamPatterns = {
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
  return ((startPattern + monthOffset - 1) % 7) + 1;
};

// 재택 기간을 계산하는 함수
const getWFHPeriod = (year, month) => {
  // 2025년 각 월별 재택 기간 (이미지 기반)
  const wfhPeriods2025 = {
    1: { start: '1/6', end: '1/31' },
    2: { start: '2/3', end: '2/28' },
    3: { start: '3/3', end: '3/28' },
    4: { start: '3/31', end: '4/25' },
    5: { start: '4/28', end: '5/30' },
    6: { start: '6/2', end: '6/27' },
    7: { start: '6/30', end: '8/1' },
    8: { start: '8/4', end: '8/29' },
    9: { start: '9/1', end: '9/26' },
    10: { start: '9/29', end: '10/31' },
    11: { start: '11/3', end: '11/28' },
    12: { start: '12/1', end: '12/26' }
  };

  // 2025년이면 하드코딩된 기간 사용
  if (year === 2025 && wfhPeriods2025[month]) {
    return wfhPeriods2025[month];
  }

  // 2025년이 아닌 경우 주(week) 기반 계산
  // 각 월의 주 수 패턴 (5월, 7월, 10월은 5주, 나머지는 4주)
  const weekCounts = {
    1: 4, 2: 4, 3: 4, 4: 4, 5: 5, 6: 4,
    7: 5, 8: 4, 9: 4, 10: 5, 11: 4, 12: 4
  };

  // 연도의 첫 날 요일 확인
  const firstDayOfYear = new Date(year, 0, 1);
  const firstDayOfWeek = firstDayOfYear.getDay(); // 0=일, 1=월, ..., 6=토
  
  // 첫 주의 시작일 계산 (첫 번째 월요일)
  let firstMonday = new Date(year, 0, 1);
  if (firstDayOfWeek !== 1) { // 1월 1일이 월요일이 아니면
    const daysToMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek;
    firstMonday = new Date(year, 0, 1 + daysToMonday);
  }
  
  // 시작 주 계산
  let startWeek = 1;
  for (let m = 1; m < month; m++) {
    startWeek += weekCounts[m];
  }
  
  // 시작일과 종료일 계산
  const startDate = new Date(firstMonday);
  startDate.setDate(startDate.getDate() + (startWeek - 1) * 7);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + weekCounts[month] * 7 - 3); // 금요일까지 (-3일)
  
  // 날짜 포맷팅
  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  return {
    start: formatDate(startDate),
    end: formatDate(endDate)
  };
};

// 특정 년월의 팀별 스케줄 생성
const generateMonthlySchedule = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);
  const monthsOffset = (year - 2025) * 12 + (month - 1);

  const schedule = {};
  Object.entries(initialTeamPatterns).forEach(([team, startPattern]) => {
    const pattern = getMonthlyPattern(startPattern, monthsOffset);
    const period = getWFHPeriod(year, month);
    schedule[team] = {
      pattern,
      period: `${period.start} ~ ${period.end}`
    };
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
