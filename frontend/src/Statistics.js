import React, { useState } from 'react';
import './Statistics.css';

function Statistics() {
  const [selectedData, setSelectedData] = useState('온도');

  const handleTabClick = (dataType) => {
    setSelectedData(dataType);
  };

  const chartData = [
    { name: '02', value: 100 },
    { name: '03', value: 20 },
    { name: '04', value: 250 },
    { name: '05', value: 150 },
    { name: '06', value: 180 },
    { name: '07', value: 120 },
    { name: '08', value: 230 },
    { name: '09', value: 80 },
    { name: '10', value: 60 },
    { name: '11', value: 100 },
  ];

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>스마트 실내 환경 모니터링</h1>
        <h2>- 통계</h2>
      </div>

      <div className="data-tabs">
        <button
          className={`tab-button ${selectedData === '온도' ? 'active' : ''}`}
          onClick={() => handleTabClick('온도')}
        >
          온도
        </button>
        <button
          className={`tab-button ${selectedData === '습도' ? 'active' : ''}`}
          onClick={() => handleTabClick('습도')}
        >
          습도
        </button>
        <button
          className={`tab-button ${selectedData === '미세먼지' ? 'active' : ''}`}
          onClick={() => handleTabClick('미세먼지')}
        >
          미세먼지
        </button>
      </div>

      <div className="chart-container">
        {}
        <div className="placeholder-chart">
            {chartData.map((data, index) => (
                <div
                    key={index}
                    className="chart-bar"
                    style={{ height: `${data.value / 2.5}px` }}
                    title={`${data.name}: ${data.value}`}
                >
                    <span className="bar-label">{data.name}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Statistics;