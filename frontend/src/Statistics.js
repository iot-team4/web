import React, { useState, useEffect } from 'react';
import './Statistics.css';

function Statistics() {
  const [selectedFilter, setSelectedFilter] = useState('모두 보기');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [timeData, setTimeData] = useState([]);

  const sensorTypeMap = {
    '온도': 'temperature',
    '습도': 'humidity',
    '미세먼지': 'pm25',
  };

  const handleFilterClick = (filterType) => {
    setSelectedFilter(filterType);
  };

  useEffect(() => {
    // 선택된 센서 종류에 따라 개별적으로 요청
    const fetchData = async () => {
      try {
        const results = {
          '온도': [],
          '습도': [],
          '미세먼지': [],
        };

        const typesToFetch = selectedFilter === '모두 보기'
          ? ['온도', '습도', '미세먼지']
          : [selectedFilter];

        await Promise.all(typesToFetch.map(async (type) => {
          const res = await fetch(`/api/sensors/summary?sensorType=${sensorTypeMap[type]}&range=24h`);
          const json = await res.json();

          json.forEach((item, index) => {
            const hour = new Date(item.createdAt).getHours().toString().padStart(2, '0') + ':00';
            if (!results[type][index]) results[type][index] = { time: hour };
            results[type][index][type] = parseFloat(item.avgValue.toFixed(1));
          });
        }));

        // 시간 기준으로 병합
        const merged = Object.values(results).flat().reduce((acc, item) => {
          const existing = acc.find((a) => a.time === item.time);
          if (existing) Object.assign(existing, item);
          else acc.push(item);
          return acc;
        }, []);

        // 시간순 정렬
        merged.sort((a, b) => a.time.localeCompare(b.time));

        setTimeData(merged);
      } catch (err) {
        console.error('📉 통계 데이터 요청 실패:', err);
      }
    };

    fetchData();
  }, [selectedFilter]);

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
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((value, index) => (
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
    </div>
  );
}

export default Statistics;