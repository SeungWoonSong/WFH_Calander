import React, { useState, useMemo, memo } from 'react';
import styled from '@emotion/styled';
import { format, isWeekend, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { workPatterns, holidays, recommendedHolidays, getTeamSchedule, initialTeamPatterns } from './data/workSchedule';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Title = styled.h1`
  text-align: center;
  color: #1a237e;
  margin-bottom: 40px;
  font-size: 2.5rem;
  font-weight: 700;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(90deg, #1a237e, #3949ab);
    border-radius: 2px;
  }
`;

const StatusBoard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 15px;
    margin-bottom: 30px;
  }
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    display: table;
    width: 100%;
    margin-bottom: 20px;
  }
`;

const TeamCardWrapper = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    display: table-row;
    padding: 0;
    border-radius: 0;
    border: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  h3 {
    margin: 0 0 15px 0;
    color: #1a237e;
    font-size: 1.2rem;

    @media (max-width: 768px) {
      display: table-cell;
      padding: 12px;
      margin: 0;
      font-size: 1rem;
      vertical-align: middle;
      border-bottom: 1px solid #f0f0f0;
      text-align: center;
      width: 120px;
    }
  }
  
  p {
    margin: 0;
    padding: 10px;
    border-radius: 10px;
    font-weight: 500;
    background-color: ${props => {
      switch (props.status) {
        case 'Office':
          return '#e3f2fd';
        case 'Home':
          return '#f1f8e9';
        case 'Flexible Home':
          return '#fff3e0';
        case 'Weekend':
          return '#ffebee';
        case 'Holiday':
          return '#ffebee';
        default:
          return '#f5f5f5';
      }
    }};
    color: ${props => {
      switch (props.status) {
        case 'Office':
          return '#1565c0';
        case 'Home':
          return '#2e7d32';
        case 'Flexible Home':
          return '#ef6c00';
        case 'Weekend':
          return '#c62828';
        case 'Holiday':
          return '#c62828';
        default:
          return '#424242';
      }
    }};

    @media (max-width: 768px) {
      display: table-cell;
      padding: 12px;
      margin: 0;
      border-radius: 6px;
      vertical-align: middle;
      border-bottom: 1px solid #f0f0f0;
      text-align: center;
      font-size: 0.9rem;
      min-width: 120px;
    }
  }
`;

const TeamButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin: 40px 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TeamButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: 20px;
  margin: 30px 0;
  background: #ffffff;
  border-radius: 15px;
  font-weight: 600;
  color: #1a237e;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 1.1rem;

  .office-days {
    margin-top: 10px;
    font-size: 0.95rem;
    color: #666;
    
    .schedule-row {
      margin: 8px 0;
    }

    strong {
      color: #1565c0;
      font-weight: 600;
    }

    .month {
      font-weight: 700;
    }

    .tag {
      font-size: 0.8rem;
      color: #666;
      font-weight: normal;
      font-style: italic;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const StatusText = styled.span`
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: ${props => {
    switch (props.status) {
      case 'Office':
        return '#e3f2fd';
      case 'Home':
        return '#f1f8e9';
      case 'Flexible Home':
        return '#fff3e0';
      case 'Weekend':
        return '#ffebee';
      case 'Holiday':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'Office':
        return '#1565c0';
      case 'Home':
        return '#2e7d32';
      case 'Flexible Home':
        return '#ef6c00';
      case 'Weekend':
        return '#c62828';
      case 'Holiday':
        return '#c62828';
      default:
        return '#424242';
    }
  }};
`;

const HolidaySection = styled.div`
  margin-top: 40px;
  padding: 30px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    margin-top: 30px;
    padding: 20px;
  }
`;

const TabButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;

  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 10px;
  }
`;

const TabButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: ${props => props.active ? 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 1rem;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)' : '#f0f0f0'};
    transform: translateY(-2px);
  }
`;

const HolidayList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c5cae9;
    border-radius: 4px;
    
    &:hover {
      background: #9fa8da;
    }
  }
`;

const HolidayItemWrapper = styled.li`
  padding: 15px 20px;
  margin: 8px 0;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .date-section {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1a237e;
    font-weight: 600;
    font-size: 0.95rem;

    .day {
      color: #666;
      font-weight: normal;
    }
  }

  .name {
    color: #666;
    font-size: 0.95rem;
  }

  @media (max-width: 768px) {
    padding: 12px 15px;
    
    .date-section {
      font-size: 0.9rem;
    }
    
    .name {
      font-size: 0.9rem;
    }
  }
`;

const TeamCard = memo(({ team, status }) => (
  <TeamCardWrapper status={status}>
    <h3>{team}</h3>
    <p>{status}</p>
  </TeamCardWrapper>
));

const HolidayItem = memo(({ date, name, formatDateWithDay }) => (
  <HolidayItemWrapper>
    <div className="date-section">
      <span>{formatDateWithDay(date)}</span>
    </div>
    <span className="name">{name}</span>
  </HolidayItemWrapper>
));

const ChartView = styled.div`
  background: #ffffff;
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(5, 1fr);
  gap: 2px;
  margin-top: 20px;
`;

const ChartHeader = styled.div`
  background: #f8f9fa;
  padding: 10px;
  font-weight: bold;
  text-align: center;
  border-radius: 5px;
`;

const ChartCell = styled.div`
  padding: 10px;
  text-align: center;
  background: ${props => props.isOfficeDay ? '#e3f2fd' : '#f1f8e9'};
  color: ${props => props.isOfficeDay ? '#1565c0' : '#2e7d32'};
  border-radius: 5px;
  font-weight: 500;
`;

const ChartTeamName = styled.div`
  padding: 10px;
  font-weight: bold;
  text-align: left;
  display: flex;
  align-items: center;
`;

const ViewToggle = styled.button`
  padding: 8px 16px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #3949ab;
  }
`;

const MonthSelector = styled.div`
  display: grid;
  grid-template-columns: 40px 200px 40px;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const MonthDisplay = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 200px;
  text-align: center;
`;

const NavigationButton = styled.button`
  padding: 8px 12px;
  background: #ffffff;
  color: #1a237e;
  border: 1px solid #1a237e;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: #e8eaf6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function App() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('holidays');
  const [showChart, setShowChart] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const today = useMemo(() => new Date(), []);
  const nextMonth = useMemo(() => {
    const next = new Date(today);
    next.setMonth(next.getMonth() + 1);
    return next;
  }, [today]);

  const currentDate = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);
  const currentDayName = useMemo(() => format(today, 'E'), [today]);
  const currentYearMonth = useMemo(() => format(today, 'yyyy-MM'), [today]);
  const currentMonth = useMemo(() => format(today, 'MMMM'), [today]);
  const nextMonthName = useMemo(() => format(nextMonth, 'MMMM'), [nextMonth]);
  const nextMonthYearMonth = useMemo(() => format(nextMonth, 'yyyy-MM'), [nextMonth]);

  const getMonthInfo = (offset) => {
    const date = new Date(today);
    date.setMonth(date.getMonth() + offset);
    return {
      yearMonth: format(date, 'yyyy-MM'),
      monthName: format(date, 'MMMM'),
      isValid: date.getFullYear() >= 2025 && (date.getFullYear() > 2025 || date.getMonth() >= 0)
    };
  };

  const renderTeamChart = () => {
    const weekDays = ['월', '화', '수', '목', '금'];
    const monthInfo = getMonthInfo(monthOffset);
    const monthSchedule = monthInfo.isValid ? getTeamSchedule(monthInfo.yearMonth) : null;
    
    return (
      <ChartView>
        <ViewToggle onClick={() => setShowChart(false)}>
          Switch to Card View
        </ViewToggle>
        <MonthSelector>
          <NavigationButton 
            onClick={() => setMonthOffset(prev => prev - 1)}
            disabled={!getMonthInfo(monthOffset - 1).isValid}
          >
            &lt;
          </NavigationButton>
          <MonthDisplay>
            {monthInfo.monthName} {format(new Date(monthInfo.yearMonth), 'yyyy')}
          </MonthDisplay>
          <NavigationButton 
            onClick={() => setMonthOffset(prev => prev + 1)}
          >
            &gt;
          </NavigationButton>
        </MonthSelector>
        {monthInfo.isValid ? (
          <>
            <ChartGrid>
              <ChartHeader>Team</ChartHeader>
              {weekDays.map(day => (
                <ChartHeader key={day}>{day}</ChartHeader>
              ))}
              
              {Object.entries(monthSchedule).map(([team, schedule]) => (
                <React.Fragment key={team}>
                  <ChartTeamName>{team}</ChartTeamName>
                  {weekDays.map(day => {
                    const isOfficeDay = workPatterns[schedule.pattern].includes(day);
                    return (
                      <ChartCell key={`${team}-${day}`} isOfficeDay={isOfficeDay}>
                        {isOfficeDay ? 'Office' : 'Home'}
                      </ChartCell>
                    );
                  })}
                </React.Fragment>
              ))}
            </ChartGrid>
            <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
              WFH Period: {getTeamOfficeDays(Object.keys(monthSchedule)[0], monthInfo.yearMonth).period}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No schedule data available before January 2025
          </div>
        )}
      </ChartView>
    );
  };

  const getTeamOfficeDays = useMemo(() => (team, yearMonth) => {
    const monthSchedule = getTeamSchedule(yearMonth);
    const teamSchedule = monthSchedule[team];
    const workDays = workPatterns[teamSchedule.pattern];
    
    return {
      workDays: workDays.map(day => {
        switch(day) {
          case '월': return 'Mon';
          case '화': return 'Tue';
          case '수': return 'Wed';
          case '목': return 'Thu';
          case '금': return 'Fri';
          default: return day;
        }
      }),
      period: teamSchedule.period
    };
  }, []);

  const getWorkStatus = useMemo(() => (team) => {
    if (isWeekend(today)) {
      return 'Weekend';
    }
    
    if (holidays.some(h => h.date === currentDate)) {
      return 'Holiday';
    }
    
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
    
    if (recommendedHolidays.some(h => h.date === currentDate)) {
      return 'Flexible Home';
    }
    
    return isWorkDay ? 'Office' : 'Home';
  }, [currentDate, currentDayName, today, currentYearMonth]);

  const formatDateWithDay = useMemo(() => (dateString) => {
    const date = parseISO(dateString);
    const dayName = format(date, 'EEE', { locale: ko });
    return `${dateString} (${dayName})`;
  }, []);

  return (
    <AppContainer>
      <Title>Work From Home Schedule</Title>
      {!showChart ? (
        <>
          <ViewToggle onClick={() => setShowChart(true)}>
            Switch to Chart View
          </ViewToggle>
          <StatusBoard>
            <TeamGrid>
              {Object.keys(initialTeamPatterns).map((team) => (
                <TeamCard key={team} team={team} status={getWorkStatus(team)} />
              ))}
            </TeamGrid>
          </StatusBoard>
          
          <TeamButtons>
            {Object.keys(initialTeamPatterns).map((team) => (
              <TeamButton
                key={team}
                onClick={() => setSelectedTeam(team)}
              >
                {team}
              </TeamButton>
            ))}
          </TeamButtons>
        </>
      ) : renderTeamChart()}
      
      {selectedTeam && (
        <StatusMessage>
          {selectedTeam} team is <StatusText status={getWorkStatus(selectedTeam)}>{getWorkStatus(selectedTeam)}</StatusText> today
          <div className="office-days">
            <div className="schedule-row">
              <strong><span className="month">{currentMonth}</span> Schedule</strong> <span className="tag">(Current)</span>:
              <div>Office Days: {getTeamOfficeDays(selectedTeam, currentYearMonth).workDays.join(', ')}</div>
              <div>WFH Period: {getTeamOfficeDays(selectedTeam, currentYearMonth).period}</div>
            </div>
            <div className="schedule-row">
              <strong><span className="month">{nextMonthName}</span> Schedule</strong> <span className="tag">(Upcoming)</span>:
              <div>Office Days: {getTeamOfficeDays(selectedTeam, nextMonthYearMonth).workDays.join(', ')}</div>
              <div>WFH Period: {getTeamOfficeDays(selectedTeam, nextMonthYearMonth).period}</div>
            </div>
          </div>
        </StatusMessage>
      )}

      <HolidaySection>
        <TabButtons>
          <TabButton 
            active={activeTab === 'holidays'} 
            onClick={() => setActiveTab('holidays')}
          >
            Holidays
          </TabButton>
          <TabButton 
            active={activeTab === 'recommended'} 
            onClick={() => setActiveTab('recommended')}
          >
            Recommended Holidays
          </TabButton>
        </TabButtons>

        <HolidayList>
          {activeTab === 'holidays' ? (
            holidays.map(({ date, name }) => (
              <HolidayItem key={date} date={date} name={name} formatDateWithDay={formatDateWithDay} />
            ))
          ) : (
            recommendedHolidays.map(({ date, name }) => (
              <HolidayItem key={date} date={date} name={name} formatDateWithDay={formatDateWithDay} />
            ))
          )}
        </HolidayList>
      </HolidaySection>
    </AppContainer>
  );
}

export default App;
