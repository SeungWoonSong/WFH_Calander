import React, { useState } from 'react';
import styled from '@emotion/styled';
import { format, isWeekend, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { teams, holidays, recommendedHolidays, workPatterns } from './data/workSchedule';

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

const TeamCard = styled.div`
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
        case '사무실 출근':
          return '#e3f2fd';
        case '재택':
          return '#f1f8e9';
        case '권장휴무 재택':
          return '#fff3e0';
        case '쉬는 날':
          return '#ffebee';
        default:
          return '#f5f5f5';
      }
    }};
    color: ${props => {
      switch (props.status) {
        case '사무실 출근':
          return '#1565c0';
        case '재택':
          return '#2e7d32';
        case '권장휴무 재택':
          return '#ef6c00';
        case '쉬는 날':
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

  @media (max-width: 768px) {
    display: none;
  }
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

const HolidayItem = styled.li`
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

function App() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('holidays');
  const today = new Date();
  const currentDate = format(today, 'yyyy-MM-dd');
  const currentDayName = format(today, 'E');
  
  const getWorkStatus = (team) => {
    // 주말인 경우
    if (isWeekend(today)) {
      return '쉬는 날';
    }
    
    // 공휴일인 경우
    if (holidays.some(h => h.date === currentDate)) {
      return '쉬는 날';
    }
    
    const teamPattern = teams[team];
    const workDays = workPatterns[teamPattern];
    const isWorkDay = workDays.includes(
      currentDayName === 'Mon' ? '월' :
      currentDayName === 'Tue' ? '화' :
      currentDayName === 'Wed' ? '수' :
      currentDayName === 'Thu' ? '목' :
      currentDayName === 'Fri' ? '금' : ''
    );
    
    // 권장 휴무일인 경우
    if (recommendedHolidays.some(h => h.date === currentDate)) {
      return '권장휴무 재택';
    }
    
    return isWorkDay ? '사무실 출근' : '재택';
  };

  const formatDateWithDay = (dateString) => {
    const date = parseISO(dateString);
    const dayName = format(date, 'EEE', { locale: ko });
    return `${dateString} (${dayName})`;
  };

  return (
    <AppContainer>
      <Title>팀별 근무 현황</Title>
      <StatusBoard>
        <TeamGrid>
          {Object.keys(teams).map((team) => (
            <TeamCard key={team} status={getWorkStatus(team)}>
              <h3>{team}</h3>
              <p>{getWorkStatus(team)}</p>
            </TeamCard>
          ))}
        </TeamGrid>
      </StatusBoard>
      
      <TeamButtons>
        {Object.keys(teams).map((team) => (
          <TeamButton
            key={team}
            onClick={() => setSelectedTeam(team)}
          >
            {team}
          </TeamButton>
        ))}
      </TeamButtons>
      
      {selectedTeam && (
        <StatusMessage>
          {selectedTeam} 팀은 오늘 {getWorkStatus(selectedTeam)} 입니다.
        </StatusMessage>
      )}

      <HolidaySection>
        <TabButtons>
          <TabButton 
            active={activeTab === 'holidays'} 
            onClick={() => setActiveTab('holidays')}
          >
            공휴일
          </TabButton>
          <TabButton 
            active={activeTab === 'recommended'} 
            onClick={() => setActiveTab('recommended')}
          >
            권장휴무일
          </TabButton>
        </TabButtons>

        <HolidayList>
          {activeTab === 'holidays' ? (
            holidays.map(({ date, name }) => (
              <HolidayItem key={date}>
                <div className="date-section">
                  <span>{formatDateWithDay(date)}</span>
                </div>
                <span className="name">{name}</span>
              </HolidayItem>
            ))
          ) : (
            recommendedHolidays.map(({ date, name }) => (
              <HolidayItem key={date}>
                <div className="date-section">
                  <span>{formatDateWithDay(date)}</span>
                </div>
                <span className="name">{name}</span>
              </HolidayItem>
            ))
          )}
        </HolidayList>
      </HolidaySection>
    </AppContainer>
  );
}

export default App;
