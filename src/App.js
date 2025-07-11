import React, { useState, useMemo, memo, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import { format, isWeekend, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { workPatterns, holidays, recommendedHolidays, getTeamSchedule, initialTeamPatterns } from './data/workSchedule';

// 글로벌 스타일 추가 (다크모드 지원)
const globalStyles = (isDarkMode) => css`
  body {
    margin: 0;
    padding: 0;
    transition: background-color 0.3s ease;
    background-color: ${isDarkMode ? '#121212' : '#f8f9fa'};
  }

  * {
    box-sizing: border-box;
  }
`;

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
    : 'linear-gradient(135deg, #f8f9fa 0%, #e8eaf6 100%)'};
  min-height: 100vh;
  color: ${props => props.isDarkMode ? '#ffffff' : '#000000'};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  position: relative;

  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: ${props => props.isDarkMode ? '#90caf9' : '#1a237e'};
  margin: 0;
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
    background: ${props => props.isDarkMode 
      ? 'linear-gradient(90deg, #90caf9, #64b5f6)' 
      : 'linear-gradient(90deg, #1a237e, #3949ab)'};
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    
    &:after {
      width: 80px;
      height: 3px;
    }
  }
`;

const DarkModeToggle = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.isDarkMode ? '#424242' : '#ffffff'};
  border: 2px solid ${props => props.isDarkMode ? '#616161' : '#e0e0e0'};
  border-radius: 50px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  color: ${props => props.isDarkMode ? '#ffffff' : '#000000'};

  &:hover {
    transform: translateY(-50%) translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    position: fixed;
    right: 20px;
    top: 20px;
    z-index: 100;
    transform: none;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const StatusBoard = styled.div`
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'};
  border-radius: 20px;
  padding: 20px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 10px 20px rgba(0, 0, 0, 0.5)' 
    : '0 10px 20px rgba(0, 0, 0, 0.05)'};
  margin-bottom: 40px;
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.8)'};
  overflow-x: auto;
  position: relative;

  @media (max-width: 768px) {
    padding: 15px;
    margin-bottom: 25px;
    border-radius: 15px;
  }
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 20px;
  }
`;

const TeamCardWrapper = styled.div`
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  padding: 20px;
  border-radius: 15px;
  text-align: left;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background-color: ${props => {
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
          return '#9e9e9e';
      }
    }};
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.isDarkMode 
      ? '0 8px 16px rgba(0, 0, 0, 0.5)' 
      : '0 8px 16px rgba(0, 0, 0, 0.1)'};
  }

  @media (max-width: 768px) {
    padding: 15px 15px 15px 20px;
    margin-bottom: 5px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    
    &:active {
      background-color: ${props => props.isDarkMode ? '#424242' : '#f5f5f5'};
    }
  }

  h3 {
    margin: 0 0 15px 0;
    color: ${props => props.isDarkMode ? '#90caf9' : '#1a237e'};
    font-size: 1.2rem;

    @media (max-width: 768px) {
      margin: 0;
      font-size: 1rem;
      flex: 1;
    }
  }
  
  p {
    margin: 0;
    padding: 10px;
    border-radius: 10px;
    font-weight: 500;
    background-color: ${props => {
      const isDark = props.isDarkMode;
      switch (props.status) {
        case 'Office':
          return isDark ? 'rgba(21, 101, 192, 0.2)' : '#e3f2fd';
        case 'Home':
          return isDark ? 'rgba(46, 125, 50, 0.2)' : '#f1f8e9';
        case 'Flexible Home':
          return isDark ? 'rgba(239, 108, 0, 0.2)' : '#fff3e0';
        case 'Weekend':
          return isDark ? 'rgba(198, 40, 40, 0.2)' : '#ffebee';
        case 'Holiday':
          return isDark ? 'rgba(198, 40, 40, 0.2)' : '#ffebee';
        default:
          return isDark ? 'rgba(158, 158, 158, 0.2)' : '#f5f5f5';
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
          return props.isDarkMode ? '#9e9e9e' : '#424242';
      }
    }};
    display: inline-block;
    text-align: center;

    @media (max-width: 768px) {
      padding: 8px 12px;
      font-size: 0.9rem;
      border-radius: 20px;
      min-width: 80px;
    }
  }
`;

const TeamButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin: 40px 0;

  @media (max-width: 768px) {
    display: flex;
    overflow-x: auto;
    padding: 10px 0;
    margin: 20px 0;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TeamButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' 
    : 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)'};
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9rem;
    flex: 0 0 auto;
    margin-right: 10px;
    white-space: nowrap;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
  
  &.active {
    background: ${props => props.isDarkMode 
      ? 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)' 
      : 'linear-gradient(135deg, #4527a0 0%, #7e57c2 100%)'};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const StatusMessage = styled.div`
  text-align: left;
  padding: 20px;
  margin: 30px 0;
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  border-radius: 15px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#90caf9' : '#1a237e'};
  box-shadow: ${props => props.isDarkMode 
    ? '0 4px 6px rgba(0, 0, 0, 0.5)' 
    : '0 4px 6px rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  font-size: 1.1rem;
  position: relative;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: ${props => props.isDarkMode 
      ? 'linear-gradient(to bottom, #90caf9, #64b5f6)' 
      : 'linear-gradient(to bottom, #1a237e, #3949ab)'};
  }

  .team-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
  
  .team-name {
    font-size: 1.3rem;
    font-weight: 700;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }

  .office-days {
    margin-top: 15px;
    font-size: 0.95rem;
    color: ${props => props.isDarkMode ? '#b0bec5' : '#666'};
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 15px;
    }
    
    .schedule-row {
      margin: 8px 0;
      padding: 15px;
      background: ${props => props.isDarkMode 
        ? 'rgba(255, 255, 255, 0.05)' 
        : '#f8f9fa'};
      border-radius: 10px;
      box-shadow: ${props => props.isDarkMode 
        ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
        : '0 2px 4px rgba(0, 0, 0, 0.05)'};
    }

    strong {
      color: ${props => props.isDarkMode ? '#64b5f6' : '#1565c0'};
      font-weight: 600;
      display: block;
      margin-bottom: 8px;
    }

    .month {
      font-weight: 700;
    }

    .tag {
      font-size: 0.8rem;
      color: ${props => props.isDarkMode ? '#90a4ae' : '#666'};
      font-weight: normal;
      font-style: italic;
      margin-left: 5px;
      padding: 2px 8px;
      background: ${props => props.isDarkMode 
        ? 'rgba(144, 202, 249, 0.2)' 
        : '#e8eaf6'};
      border-radius: 10px;
    }
    
    .schedule-detail {
      margin-top: 8px;
      padding-left: 10px;
      border-left: 2px solid ${props => props.isDarkMode ? '#424242' : '#e0e0e0'};
    }
  }

  @media (max-width: 768px) {
    padding: 15px;
    margin: 20px 0;
    font-size: 1rem;
  }
`;

const StatusText = styled.span`
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: ${props => {
    const isDark = props.isDarkMode;
    switch (props.status) {
      case 'Office':
        return isDark ? 'rgba(21, 101, 192, 0.2)' : '#e3f2fd';
      case 'Home':
        return isDark ? 'rgba(46, 125, 50, 0.2)' : '#f1f8e9';
      case 'Flexible Home':
        return isDark ? 'rgba(239, 108, 0, 0.2)' : '#fff3e0';
      case 'Weekend':
        return isDark ? 'rgba(198, 40, 40, 0.2)' : '#ffebee';
      case 'Holiday':
        return isDark ? 'rgba(198, 40, 40, 0.2)' : '#ffebee';
      default:
        return isDark ? 'rgba(158, 158, 158, 0.2)' : '#f5f5f5';
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
        return props.isDarkMode ? '#9e9e9e' : '#424242';
    }
  }};
`;

const HolidaySection = styled.div`
  margin-top: 40px;
  padding: 30px;
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  border-radius: 20px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 10px 20px rgba(0, 0, 0, 0.5)' 
    : '0 10px 20px rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};

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
  border-bottom: 2px solid ${props => props.isDarkMode ? '#424242' : '#f0f0f0'};

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
  background: ${props => {
    if (props.active) {
      return props.isDarkMode 
        ? 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)' 
        : 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)';
    }
    return props.isDarkMode ? '#424242' : '#f8f9fa';
  }};
  color: ${props => props.active ? 'white' : (props.isDarkMode ? '#b0bec5' : '#666')};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 1rem;

  &:hover {
    background: ${props => {
      if (props.active) {
        return props.isDarkMode 
          ? 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)' 
          : 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)';
      }
      return props.isDarkMode ? '#616161' : '#f0f0f0';
    }};
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
  background: ${props => props.isDarkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : '#ffffff'};
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : '#f0f0f0'};

  &:hover {
    transform: translateX(5px);
    box-shadow: ${props => props.isDarkMode 
      ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px rgba(0, 0, 0, 0.05)'};
  }

  .date-section {
    display: flex;
    align-items: center;
    gap: 10px;
    color: ${props => props.isDarkMode ? '#90caf9' : '#1a237e'};
    font-weight: 600;
    font-size: 0.95rem;

    .day {
      color: ${props => props.isDarkMode ? '#b0bec5' : '#666'};
      font-weight: normal;
    }
  }

  .name {
    color: ${props => props.isDarkMode ? '#b0bec5' : '#666'};
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

const TeamCard = memo(({ team, status, onClick, isDarkMode }) => {
  // 상태에 따른 아이콘 표시
  const StatusIcon = () => {
    switch(status) {
      case 'Office':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 2H5C3.89543 2 3 2.89543 3 4V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V4C21 2.89543 20.1046 2 19 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 15H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 15H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Home':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Flexible Home':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Weekend':
      case 'Holiday':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <TeamCardWrapper status={status} onClick={onClick} isDarkMode={isDarkMode}>
      <h3>{team}</h3>
      <p>
        <StatusIcon /> {status}
      </p>
    </TeamCardWrapper>
  );
});

const HolidayItem = memo(({ date, name, formatDateWithDay, isDarkMode }) => (
  <HolidayItemWrapper isDarkMode={isDarkMode}>
    <div className="date-section">
      <span>{formatDateWithDay(date)}</span>
    </div>
    <span className="name">{name}</span>
  </HolidayItemWrapper>
));

const ChartView = styled.div`
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: ${props => props.isDarkMode 
    ? '0 4px 6px rgba(0, 0, 0, 0.5)' 
    : '0 4px 6px rgba(0, 0, 0, 0.1)'};
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: ${props => props.isDarkMode 
      ? 'linear-gradient(to bottom, #90caf9, #64b5f6)' 
      : 'linear-gradient(to bottom, #1a237e, #3949ab)'};
  }
  
  @media (max-width: 768px) {
    padding: 15px;
    border-radius: 12px;
    margin: 15px 0;
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(5, 1fr);
  gap: 2px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 100px repeat(5, 1fr);
    gap: 1px;
    margin-top: 15px;
    overflow-x: auto;
    padding-bottom: 5px;
  }
`;

const ChartHeader = styled.div`
  background: ${props => props.isDarkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : '#f8f9fa'};
  padding: 10px;
  font-weight: bold;
  text-align: center;
  border-radius: 5px;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#000000'};
  
  @media (max-width: 768px) {
    padding: 8px 5px;
    font-size: 0.9rem;
    border-radius: 4px;
  }
`;

const ChartCell = styled.div`
  padding: 10px;
  text-align: center;
  background: ${props => {
    const isDark = props.isDarkMode;
    return props.isOfficeDay 
      ? (isDark ? 'rgba(21, 101, 192, 0.2)' : '#e3f2fd')
      : (isDark ? 'rgba(46, 125, 50, 0.2)' : '#f1f8e9');
  }};
  color: ${props => props.isOfficeDay ? '#1565c0' : '#2e7d32'};
  border-radius: 5px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.isDarkMode 
      ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
      : '0 2px 4px rgba(0, 0, 0, 0.1)'};
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    padding: 8px 5px;
    font-size: 0.85rem;
    border-radius: 4px;
  }
`;

const ChartTeamName = styled.div`
  padding: 10px;
  font-weight: bold;
  text-align: left;
  display: flex;
  align-items: center;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#000000'};
  
  @media (max-width: 768px) {
    padding: 8px 5px;
    font-size: 0.9rem;
  }
`;

const ViewToggle = styled.button`
  padding: 10px 18px;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' 
    : '#1a237e'};
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${props => props.isDarkMode ? '#616161' : '#3949ab'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.9rem;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    margin: 0;
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
  
  @media (max-width: 768px) {
    grid-template-columns: 36px 160px 36px;
    gap: 8px;
    margin-bottom: 15px;
  }
`;

const MonthDisplay = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 200px;
  text-align: center;
  background: ${props => props.isDarkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : '#f5f5f5'};
  padding: 8px 0;
  border-radius: 20px;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#000000'};
  
  @media (max-width: 768px) {
    font-size: 1rem;
    min-width: 160px;
    padding: 6px 0;
  }
`;

const NavigationButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isDarkMode ? '#424242' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#90caf9' : '#1a237e'};
  border: 1px solid ${props => props.isDarkMode ? '#616161' : '#1a237e'};
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${props => props.isDarkMode 
      ? 'rgba(144, 202, 249, 0.2)' 
      : '#e8eaf6'};
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
`;

// 푸터 스타일링
const Footer = styled.footer`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px 0;
  border-top: 1px solid ${props => props.isDarkMode ? '#424242' : '#e0e0e0'};
  font-size: 0.9rem;
  color: ${props => props.isDarkMode ? '#b0bec5' : '#666'};
  
  @media (max-width: 768px) {
    margin-top: 30px;
    padding: 15px 0;
    font-size: 0.8rem;
  }
`;

const FooterLink = styled.a`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => props.isDarkMode ? '#b0bec5' : '#666'};
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 5px 10px;
  border-radius: 20px;
  
  &:hover {
    color: ${props => props.isDarkMode ? '#90caf9' : '#1a237e'};
    background: ${props => props.isDarkMode 
      ? 'rgba(144, 202, 249, 0.2)' 
      : '#e8eaf6'};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// 아이콘 컴포넌트들
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OfficeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 2H5C3.89543 2 3 2.89543 3 4V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V4C21 2.89543 20.1046 2 19 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 15H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 15H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function App() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('holidays');
  const [showChart, setShowChart] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const today = useMemo(() => new Date(), []);
  const nextMonth = useMemo(() => {
    const next = new Date(today);
    next.setMonth(next.getMonth() + 1);
    return next;
  }, [today]);

  // 다크모드 설정 저장
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

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
      <ChartView isDarkMode={isDarkMode}>
        <ViewToggle onClick={() => setShowChart(false)} isDarkMode={isDarkMode}>
          <CalendarIcon /> Switch to Card View
        </ViewToggle>
        <MonthSelector>
          <NavigationButton 
            onClick={() => setMonthOffset(prev => prev - 1)}
            disabled={!getMonthInfo(monthOffset - 1).isValid}
            isDarkMode={isDarkMode}
          >
            &lt;
          </NavigationButton>
          <MonthDisplay isDarkMode={isDarkMode}>
            {monthInfo.monthName} {format(new Date(monthInfo.yearMonth), 'yyyy')}
          </MonthDisplay>
          <NavigationButton 
            onClick={() => setMonthOffset(prev => prev + 1)}
            isDarkMode={isDarkMode}
          >
            &gt;
          </NavigationButton>
        </MonthSelector>
        {monthInfo.isValid ? (
          <>
            <ChartGrid>
              <ChartHeader isDarkMode={isDarkMode}>Team</ChartHeader>
              {weekDays.map(day => (
                <ChartHeader key={day} isDarkMode={isDarkMode}>{day}</ChartHeader>
              ))}
              
              {Object.entries(monthSchedule).map(([team, schedule]) => (
                <React.Fragment key={team}>
                  <ChartTeamName isDarkMode={isDarkMode}>{team}</ChartTeamName>
                  {weekDays.map(day => {
                    const isOfficeDay = workPatterns[schedule.pattern].includes(day);
                    return (
                      <ChartCell 
                        key={`${team}-${day}`} 
                        isOfficeDay={isOfficeDay}
                        onClick={() => handleTeamButtonClick(team)}
                        isDarkMode={isDarkMode}
                      >
                        {isOfficeDay ? (
                          <>
                            <OfficeIcon /> Office
                          </>
                        ) : (
                          <>
                            <HomeIcon /> Home
                          </>
                        )}
                      </ChartCell>
                    );
                  })}
                </React.Fragment>
              ))}
            </ChartGrid>
            <div style={{ 
              marginTop: '20px', 
              fontSize: '0.9rem', 
              color: '#666',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <DateIcon /> WFH Period: {getTeamOfficeDays(Object.keys(monthSchedule)[0], monthInfo.yearMonth).period}
            </div>
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#666',
            background: '#f8f9fa',
            borderRadius: '10px',
            marginTop: '20px'
          }}>
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
    
    // 현재 날짜가 어느 달의 재택 주기에 속하는지 확인하는 함수
    const isInWFHPeriod = (date, yearMonth) => {
      const schedule = getTeamSchedule(yearMonth);
      const teamSchedule = schedule[team];
      const [startMonth, startDay] = teamSchedule.period.split(' ~ ')[0].split('/').map(Number);
      const [endMonth, endDay] = teamSchedule.period.split(' ~ ')[1].split('/').map(Number);
      
      // year 변수는 현재 사용되지 않으므로 제거
      // const [year] = yearMonth.split('-').map(Number);
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

  // 모바일 환경 감지 - 필요할 때 주석 해제
  // const isMobile = useMemo(() => {
  //   return window.innerWidth <= 768;
  // }, []);
  
  // 팀 버튼 클릭 핸들러 개선
  const handleTeamButtonClick = useCallback((team) => {
    setSelectedTeam(prev => prev === team ? null : team);
  }, []);
  
  return (
    <AppContainer isDarkMode={isDarkMode}>
      <Global styles={globalStyles(isDarkMode)} />
      <Header>
        <Title isDarkMode={isDarkMode}>Work From Home Schedule</Title>
        <DarkModeToggle isDarkMode={isDarkMode} onClick={() => setIsDarkMode(prev => !prev)}>
          {isDarkMode ? '🌙' : '☀️'}
        </DarkModeToggle>
      </Header>
      {!showChart ? (
        <>
          <ViewToggle onClick={() => setShowChart(true)} isDarkMode={isDarkMode}>
            <ChartIcon /> Switch to Chart View
          </ViewToggle>
          <StatusBoard isDarkMode={isDarkMode}>
            <TeamGrid>
              {Object.keys(initialTeamPatterns)
                .map((team) => (
                <TeamCard 
                  key={team} 
                  team={team} 
                  status={getWorkStatus(team)} 
                  onClick={() => handleTeamButtonClick(team)}
                  isDarkMode={isDarkMode}
                />
              ))}
            </TeamGrid>
          </StatusBoard>
          
          <TeamButtons>
            {Object.keys(initialTeamPatterns)
              .map((team) => (
              <TeamButton
                key={team}
                onClick={() => handleTeamButtonClick(team)}
                className={selectedTeam === team ? 'active' : ''}
                isDarkMode={isDarkMode}
              >
                {team}
              </TeamButton>
            ))}
          </TeamButtons>
        </>
      ) : renderTeamChart()}
      
      {selectedTeam && (
        <StatusMessage isDarkMode={isDarkMode}>
          <div className="team-status">
            <div className="team-name">{selectedTeam}</div>
            <StatusText status={getWorkStatus(selectedTeam)} isDarkMode={isDarkMode}>
              {getWorkStatus(selectedTeam) === 'Office' ? <OfficeIcon /> : <HomeIcon />} {getWorkStatus(selectedTeam)}
            </StatusText>
          </div>
          <div className="office-days">
            <div className="schedule-row">
              <strong><DateIcon /> <span className="month">{currentMonth}</span> Schedule <span className="tag">Current</span></strong>
              <div className="schedule-detail">
                <div>Office Days: {getTeamOfficeDays(selectedTeam, currentYearMonth).workDays.join(', ')}</div>
                <div>WFH Period: {getTeamOfficeDays(selectedTeam, currentYearMonth).period}</div>
              </div>
            </div>
            <div className="schedule-row">
              <strong><DateIcon /> <span className="month">{nextMonthName}</span> Schedule <span className="tag">Upcoming</span></strong>
              <div className="schedule-detail">
                <div>Office Days: {getTeamOfficeDays(selectedTeam, nextMonthYearMonth).workDays.join(', ')}</div>
                <div>WFH Period: {getTeamOfficeDays(selectedTeam, nextMonthYearMonth).period}</div>
              </div>
            </div>
          </div>
        </StatusMessage>
      )}

      <HolidaySection isDarkMode={isDarkMode}>
        <TabButtons isDarkMode={isDarkMode}>
          <TabButton 
            active={activeTab === 'holidays'} 
            onClick={() => setActiveTab('holidays')}
            isDarkMode={isDarkMode}
          >
            Holidays
          </TabButton>
          <TabButton 
            active={activeTab === 'recommended'} 
            onClick={() => setActiveTab('recommended')}
            isDarkMode={isDarkMode}
          >
            Recommended Holidays
          </TabButton>
        </TabButtons>

        <HolidayList>
          {activeTab === 'holidays' ? (
            holidays.map(({ date, name }) => (
              <HolidayItem key={date} date={date} name={name} formatDateWithDay={formatDateWithDay} isDarkMode={isDarkMode} />
            ))
          ) : (
            recommendedHolidays.map(({ date, name }) => (
              <HolidayItem key={date} date={date} name={name} formatDateWithDay={formatDateWithDay} isDarkMode={isDarkMode} />
            ))
          )}
        </HolidayList>
      </HolidaySection>
      
      <Footer isDarkMode={isDarkMode}>
        <FooterLink href="https://github.com/SeungWoonSong/WFH_Calander" target="_blank" rel="noopener noreferrer" isDarkMode={isDarkMode}>
          <GitHubIcon /> GitHub
        </FooterLink>
        <FooterLink href="https://www.linkedin.com/in/sungwoonsong" target="_blank" rel="noopener noreferrer" isDarkMode={isDarkMode}>
          <LinkedInIcon /> LinkedIn
        </FooterLink>
      </Footer>
    </AppContainer>
  );
}

export default App;
