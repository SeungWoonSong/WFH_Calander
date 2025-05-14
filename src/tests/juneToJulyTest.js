const { format } = require('date-fns');
const { workPatterns, getTeamSchedule } = require('../data/workSchedule');

// App.js에서 사용하는 getWorkStatus 함수를 테스트용으로 재구현
function getWorkStatus(team, testDate) {
  const today = testDate;
  const currentDayName = format(today, 'E');
  const currentYearMonth = format(today, 'yyyy-MM');
  
  // 현재 날짜가 어느 달의 재택 주기에 속하는지 확인하는 함수
  const isInWFHPeriod = (date, yearMonth) => {
    const schedule = getTeamSchedule(yearMonth);
    const teamSchedule = schedule[team];
    const [startMonth, startDay] = teamSchedule.period.split(' ~ ')[0].split('/').map(Number);
    const [endMonth, endDay] = teamSchedule.period.split(' ~ ')[1].split('/').map(Number);
    
    const [year] = yearMonth.split('-').map(Number);
    const currentDay = date.getDate();
    const currentMonth = date.getMonth() + 1;
    
    // 시작일과 종료일이 같은 달에 있는 경우
    if (startMonth === endMonth) {
      return currentMonth === startMonth && currentDay >= startDay && currentDay <= endDay;
    }
    
    // 시작일과 종료일이 다른 달에 걸쳐 있는 경우
    return (currentMonth === startMonth && currentDay >= startDay) || 
           (currentMonth === endMonth && currentDay <= endDay);
  };
  
  // 현재 날짜가 현재 달의 재택 주기에 속하는지 확인
  const isInCurrentMonthWFH = isInWFHPeriod(today, currentYearMonth);
  
  // 다음 달의 연월 계산
  const nextMonthDate = new Date(today);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonthYearMonth = format(nextMonthDate, 'yyyy-MM');
  
  // 이전 달의 연월 계산
  const prevMonthDate = new Date(today);
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthYearMonth = format(prevMonthDate, 'yyyy-MM');
  
  // 현재 날짜가 다음 달의 재택 주기에 속하는지 확인
  const isInNextMonthWFH = isInWFHPeriod(today, nextMonthYearMonth);
  
  // 현재 날짜가 이전 달의 재택 주기에 속하는지 확인
  const isInPrevMonthWFH = isInWFHPeriod(today, prevMonthYearMonth);
  
  // 현재 날짜가 속한 달의 재택 주기 정보 가져오기
  let targetMonthYearMonth = currentYearMonth;
  if (!isInCurrentMonthWFH && isInNextMonthWFH) {
    targetMonthYearMonth = nextMonthYearMonth;
  } else if (!isInCurrentMonthWFH && isInPrevMonthWFH) {
    targetMonthYearMonth = prevMonthYearMonth;
  }
  
  const targetMonthSchedule = getTeamSchedule(targetMonthYearMonth);
  const teamSchedule = targetMonthSchedule[team];
  const workDays = workPatterns[teamSchedule.pattern];
  const isWorkDay = workDays.includes(
    currentDayName === 'Mon' ? '월' :
    currentDayName === 'Tue' ? '화' :
    currentDayName === 'Wed' ? '수' :
    currentDayName === 'Thu' ? '목' :
    currentDayName === 'Fri' ? '금' : ''
  );
  
  return isWorkDay ? 'Office' : 'Home';
}

// 원래 로직 (현재 달의 패턴만 확인)
function getWorkStatusOriginal(team, testDate) {
  const today = testDate;
  const currentDayName = format(today, 'E');
  const currentYearMonth = format(today, 'yyyy-MM');
  
  // Get current month's schedule
  const currentMonthSchedule = getTeamSchedule(currentYearMonth);
  
  // Get team's current work pattern
  const teamSchedule = currentMonthSchedule[team];
  const workDays = workPatterns[teamSchedule.pattern];
  const isWorkDay = workDays.includes(
    currentDayName === 'Mon' ? '월' :
    currentDayName === 'Tue' ? '화' :
    currentDayName === 'Wed' ? '수' :
    currentDayName === 'Thu' ? '목' :
    currentDayName === 'Fri' ? '금' : ''
  );
  
  return isWorkDay ? 'Office' : 'Home';
}

// 6월 30일 테스트 및 주변 날짜 테스트
function runJuneToJulyTest() {
  console.log('=== 6월에서 7월로 넘어가는 재택 주기 테스트 ===');
  
  // 테스트 날짜 설정 (6월 28일 ~ 7월 2일)
  const testDates = [
    new Date('2025-06-28'), // 토요일
    new Date('2025-06-29'), // 일요일
    new Date('2025-06-30'), // 월요일 - 6월 마지막 날
    new Date('2025-07-01'), // 화요일 - 7월 첫 날
    new Date('2025-07-02')  // 수요일
  ];
  
  // 각 팀에 대해 테스트
  const teams = ['Orcas', 'ApplePie', 'Adelie', 'Skywalker', 'Carina', 'Glider', 'Moonwalker'];
  
  // 6월과 7월의 스케줄 정보 출력
  console.log('\n[6월 스케줄]');
  const juneSchedule = getTeamSchedule('2025-06');
  teams.forEach(team => {
    console.log(`${team}: 패턴 ${juneSchedule[team].pattern}, 기간 ${juneSchedule[team].period}`);
  });
  
  console.log('\n[7월 스케줄]');
  const julySchedule = getTeamSchedule('2025-07');
  teams.forEach(team => {
    console.log(`${team}: 패턴 ${julySchedule[team].pattern}, 기간 ${julySchedule[team].period}`);
  });
  
  // 각 날짜별 테스트 결과 출력
  testDates.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'E');
    
    console.log(`\n[테스트 날짜: ${dateStr} (${dayName})]`);
    console.log('팀\t\t원래 로직\t\t개선된 로직\t\t차이\t\t적용된 패턴');
    console.log('--------------------------------------------------------------------------------');
    
    teams.forEach(team => {
      const originalStatus = getWorkStatusOriginal(team, date);
      const newStatus = getWorkStatus(team, date);
      const isDifferent = originalStatus !== newStatus;
      
      // 어떤 패턴이 적용되었는지 확인
      const currentYearMonth = format(date, 'yyyy-MM');
      const nextMonthDate = new Date(date);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonthYearMonth = format(nextMonthDate, 'yyyy-MM');
      
      // 현재 날짜가 어느 달의 재택 주기에 속하는지 확인
      const isInCurrentMonthWFH = isInWFHPeriod(date, currentYearMonth, team);
      const isInNextMonthWFH = isInWFHPeriod(date, nextMonthYearMonth, team);
      
      let appliedPattern = '현재 달';
      if (!isInCurrentMonthWFH && isInNextMonthWFH) {
        appliedPattern = '다음 달';
      }
      
      console.log(`${team}\t\t${originalStatus}\t\t${newStatus}\t\t${isDifferent ? '다름 ⚠️' : '같음'}\t\t${appliedPattern}`);
    });
  });
  
  // 재택 주기 확인 함수
  function isInWFHPeriod(date, yearMonth, team) {
    const schedule = getTeamSchedule(yearMonth);
    const teamSchedule = schedule[team];
    const [startMonth, startDay] = teamSchedule.period.split(' ~ ')[0].split('/').map(Number);
    const [endMonth, endDay] = teamSchedule.period.split(' ~ ')[1].split('/').map(Number);
    
    const currentDay = date.getDate();
    const currentMonth = date.getMonth() + 1;
    
    // 시작일과 종료일이 같은 달에 있는 경우
    if (startMonth === endMonth) {
      return currentMonth === startMonth && currentDay >= startDay && currentDay <= endDay;
    }
    
    // 시작일과 종료일이 다른 달에 걸쳐 있는 경우
    return (currentMonth === startMonth && currentDay >= startDay) || 
           (currentMonth === endMonth && currentDay <= endDay);
  }
}

// 테스트 실행
runJuneToJulyTest();
