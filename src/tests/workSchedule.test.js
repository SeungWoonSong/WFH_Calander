import { format } from 'date-fns';
import { workPatterns, getTeamSchedule } from '../data/workSchedule';

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

// 테스트 실행 함수
function runTests() {
  console.log('=== 재택 주기 계산 테스트 ===');
  
  // 4월 29일 테스트 (문제가 발생했던 날짜)
  const testDate = new Date('2025-04-29');
  console.log(`테스트 날짜: ${format(testDate, 'yyyy-MM-dd')} (${format(testDate, 'E')})`);
  
  // 각 팀에 대해 테스트
  const teams = ['Orcas', 'ApplePie', 'Adelie', 'Skywalker', 'Carina', 'Glider', 'Moonwalker'];
  
  console.log('\n[4월 스케줄]');
  const aprilSchedule = getTeamSchedule('2025-04');
  teams.forEach(team => {
    console.log(`${team}: 패턴 ${aprilSchedule[team].pattern}, 기간 ${aprilSchedule[team].period}`);
  });
  
  console.log('\n[5월 스케줄]');
  const maySchedule = getTeamSchedule('2025-05');
  teams.forEach(team => {
    console.log(`${team}: 패턴 ${maySchedule[team].pattern}, 기간 ${maySchedule[team].period}`);
  });
  
  console.log('\n[테스트 결과]');
  console.log('팀\t\t원래 로직\t\t개선된 로직\t\t차이');
  console.log('-----------------------------------------------------------');
  
  teams.forEach(team => {
    const originalStatus = getWorkStatusOriginal(team, testDate);
    const newStatus = getWorkStatus(team, testDate);
    const isDifferent = originalStatus !== newStatus;
    
    console.log(`${team}\t\t${originalStatus}\t\t${newStatus}\t\t${isDifferent ? '다름 ⚠️' : '같음'}`);
  });
  
  // 추가 테스트: 4월 28일과 4월 30일도 테스트
  const testDate1 = new Date('2025-04-28');
  const testDate2 = new Date('2025-04-30');
  
  console.log('\n[추가 테스트: 4월 28일]');
  console.log(`테스트 날짜: ${format(testDate1, 'yyyy-MM-dd')} (${format(testDate1, 'E')})`);
  console.log('팀\t\t원래 로직\t\t개선된 로직\t\t차이');
  console.log('-----------------------------------------------------------');
  
  teams.forEach(team => {
    const originalStatus = getWorkStatusOriginal(team, testDate1);
    const newStatus = getWorkStatus(team, testDate1);
    const isDifferent = originalStatus !== newStatus;
    
    console.log(`${team}\t\t${originalStatus}\t\t${newStatus}\t\t${isDifferent ? '다름 ⚠️' : '같음'}`);
  });
  
  console.log('\n[추가 테스트: 4월 30일]');
  console.log(`테스트 날짜: ${format(testDate2, 'yyyy-MM-dd')} (${format(testDate2, 'E')})`);
  console.log('팀\t\t원래 로직\t\t개선된 로직\t\t차이');
  console.log('-----------------------------------------------------------');
  
  teams.forEach(team => {
    const originalStatus = getWorkStatusOriginal(team, testDate2);
    const newStatus = getWorkStatus(team, testDate2);
    const isDifferent = originalStatus !== newStatus;
    
    console.log(`${team}\t\t${originalStatus}\t\t${newStatus}\t\t${isDifferent ? '다름 ⚠️' : '같음'}`);
  });
}

// 테스트 실행
runTests();
