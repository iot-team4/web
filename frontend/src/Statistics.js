import React, { useState } from 'react';
import './Statistics.css';

function Statistics() {
  const [selectedFilter, setSelectedFilter] = useState('모두 보기');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const handleFilterClick = (filterType) => {
    setSelectedFilter(filterType);
  };

  // 시간대별 데이터 (10:00 ~ 17:00)
  const timeData = [
    { time: '10:00', 온도: 20, 습도: 60, 미세먼지: 21 },
    { time: '11:00', 온도: 21, 습도: 55, 미세먼지: 21 },
    { time: '12:00', 온도: 22, 습도: 50, 미세먼지: 15 },
    { time: '13:00', 온도: 23, 습도: 45, 미세먼지: 15 },
    { time: '14:00', 온도: 24, 습도: 40, 미세먼지: 15 },
    { time: '15:00', 온도: 25, 습도: 35, 미세먼지: 15 },
    { time: '16:00', 온도: 26, 습도: 35, 미세먼지: 15 },
    { time: '17:00', 온도: 25, 습도: 40, 미세먼지: 15 },
  ];

  // 현재 데이터 (최신 2개 시간)
  const currentData = [
    { time: '2025. 05. 26. 오전 10:00', 온도: '20°C', 습도: '60%', 미세먼지: '21μg/m³' },
    { time: '2025. 05. 26. 오전 11:00', 온도: '21°C', 습도: '55%', 미세먼지: '21μg/m³' },
  ];

  // 툴팁 위치 계산 함수 - 그래프 왼쪽 중앙에 고정
  const getTooltipPosition = (hoveredPoint) => {
    if (!hoveredPoint) return {};
    
    return {
      left: '20px', // 그래프 왼쪽에 고정 위치
      top: '50%', // 그래프 세로 중앙에 고정
      transform: 'translateY(-50%)', // 세로 중앙 정렬
    };
  };

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>스마트 실내 환경 모니터링</h1>
        <h2>- 통계</h2>
      </div>

      <div className="filter-buttons">
        <button 
          className={`view-all-button ${selectedFilter === '모두 보기' ? 'active' : ''}`}
          onClick={() => handleFilterClick('모두 보기')}
        >
          모두 보기
        </button>
        <button 
          className={`filter-button temperature ${selectedFilter === '온도' ? 'active' : ''}`}
          onClick={() => handleFilterClick('온도')}
        >
          🌡️ 온도
        </button>
        <button 
          className={`filter-button humidity ${selectedFilter === '습도' ? 'active' : ''}`}
          onClick={() => handleFilterClick('습도')}
        >
          💧 습도
        </button>
        <button 
          className={`filter-button dust ${selectedFilter === '미세먼지' ? 'active' : ''}`}
          onClick={() => handleFilterClick('미세먼지')}
        >
          🫧 미세먼지
        </button>
      </div>

      <div className="chart-section">
        <div className="section-header">
          <span className="section-icon">📊</span>
          <h3>시간대별 센서 변화</h3>
        </div>

        <div className="legend">
          <span className="legend-item temperature">🌡️ 온도(°C)</span>
          <span className="legend-item humidity">💧 습도(%)</span>
          <span className="legend-item dust">🫧 미세먼지(μg/m³)</span>
        </div>

        <div className="chart-container">
          <svg width="100%" height="100%" viewBox="0 0 800 300">
            {/* Y축 그리드 라인 */}
            {[0, 15, 30, 45, 60].map((value, index) => (
              <g key={index}>
                <line
                  x1="60"
                  y1={250 - (value * 4)}
                  x2="750"
                  y2={250 - (value * 4)}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x="45"
                  y={255 - (value * 4)}
                  fill="#64748b"
                  fontSize="12"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            ))}

            {/* X축 */}
            <line x1="60" y1="250" x2="750" y2="250" stroke="#e2e8f0" strokeWidth="2"/>

            {/* 온도 라인 */}
            {(selectedFilter === '모두 보기' || selectedFilter === '온도') && (
              <polyline
                points={timeData.map((data, index) => 
                  `${80 + index * 95},${250 - data.온도 * 4}`
                ).join(' ')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              />
            )}

            {/* 습도 라인 */}
            {(selectedFilter === '모두 보기' || selectedFilter === '습도') && (
              <polyline
                points={timeData.map((data, index) => 
                  `${80 + index * 95},${250 - data.습도 * 4}`
                ).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            )}

            {/* 미세먼지 라인 */}
            {(selectedFilter === '모두 보기' || selectedFilter === '미세먼지') && (
              <polyline
                points={timeData.map((data, index) => 
                  `${80 + index * 95},${250 - data.미세먼지 * 4}`
                ).join(' ')}
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
              />
            )}

            {/* 데이터 포인트 */}
            {timeData.map((data, index) => (
              <g key={index}>
                {(selectedFilter === '모두 보기' || selectedFilter === '온도') && (
                  <circle
                    cx={80 + index * 95}
                    cy={250 - data.온도 * 4}
                    r="4"
                    fill="#ef4444"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint({ index, type: '온도', data })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                )}
                {(selectedFilter === '모두 보기' || selectedFilter === '습도') && (
                  <circle
                    cx={80 + index * 95}
                    cy={250 - data.습도 * 4}
                    r="4"
                    fill="#3b82f6"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint({ index, type: '습도', data })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                )}
                {(selectedFilter === '모두 보기' || selectedFilter === '미세먼지') && (
                  <circle
                    cx={80 + index * 95}
                    cy={250 - data.미세먼지 * 4}
                    r="4"
                    fill="#6b7280"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint({ index, type: '미세먼지', data })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                )}
                <text
                  x={80 + index * 95}
                  y="270"
                  fill="#64748b"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {data.time}
                </text>
              </g>
            ))}
          </svg>

          {/* 호버 툴팁 - 그래프 왼쪽에 표시 */}
          {hoveredPoint && (
            <div 
              className="hover-tooltip left-tooltip"
              style={getTooltipPosition(hoveredPoint)}
            >
              <div className="tooltip-time">{hoveredPoint.data.time}</div>
              {selectedFilter === '모두 보기' ? (
                <>
                  <div className="tooltip-item temperature">🌡️ 온도(°C) : {hoveredPoint.data.온도}</div>
                  <div className="tooltip-item humidity">💧 습도(%) : {hoveredPoint.data.습도}</div>
                  <div className="tooltip-item dust">🫧 미세먼지(μg/m³) : {hoveredPoint.data.미세먼지}</div>
                </>
              ) : (
                <div className={`tooltip-item ${hoveredPoint.type === '온도' ? 'temperature' : hoveredPoint.type === '습도' ? 'humidity' : 'dust'}`}>
                  {hoveredPoint.type === '온도' && `🌡️ 온도(°C) : ${hoveredPoint.data.온도}`}
                  {hoveredPoint.type === '습도' && `💧 습도(%) : ${hoveredPoint.data.습도}`}
                  {hoveredPoint.type === '미세먼지' && `🫧 미세먼지(μg/m³) : ${hoveredPoint.data.미세먼지}`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 현재 데이터 카드들 */}
      <div className="current-data-section">
        {currentData.map((data, index) => (
          <div key={index} className="data-card">
            <div className="card-time">
              🕐 {data.time}
            </div>
            <div className="card-data">
              <div className="data-item temperature">
                🌡️ 온도: {data.온도}
              </div>
              <div className="data-item humidity">
                💧 습도: {data.습도}
              </div>
              <div className="data-item dust">
                🫧 미세먼지: {data.미세먼지}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Statistics;