import React, { useState } from 'react';
import styled from '@emotion/styled';
import { format, isWeekend } from 'date-fns';
import { teams, holidays, recommendedHolidays, workPatterns } from './data/workSchedule';

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
`;

const StatusBoard = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const TeamCard = styled.div`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  
  h3 {
    margin: 0 0 10px 0;
    color: #2c3e50;
  }
  
  p {
    margin: 0;
    padding: 8px;
    border-radius: 4px;
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
  }
`;

const TeamButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 20px;
`;

const TeamButton = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: 15px;
  margin-top: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-weight: bold;
`;

const HolidaySection = styled.div`
  margin-top: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TabButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: ${props => props.active ? '#3498db' : '#e0e0e0'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#d0d0d0'};
  }
`;

const HolidayList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
`;

const HolidayItem = styled.li`
  padding: 10px 15px;
  margin: 5px 0;
  background-color: #f8f9fa;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: #e9ecef;
  }

  .date {
    color: #2c3e50;
    font-weight: 500;
  }

  .name {
    color: #7f8c8d;
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
                <span className="date">{date}</span>
                <span className="name">{name}</span>
              </HolidayItem>
            ))
          ) : (
            recommendedHolidays.map(({ date, name }) => (
              <HolidayItem key={date}>
                <span className="date">{date}</span>
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
