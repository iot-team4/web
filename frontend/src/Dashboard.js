import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard({ addRecord }) {
  const [ledControl, setLedControl] = useState(false);
  const [manualFanControl, setManualFanControl] = useState(false);
  const [autoFanControl, setAutoFanControl] = useState(true);

  const handleToggle = (deviceName, currentState, setStateFunction) => {
    const newState = !currentState;
    setStateFunction(newState);
    const action = newState ? 'on' : 'off';
    addRecord(deviceName, action);
  };

  const indoorData = {
    temp: 20.5,
    humidity: 50,
    dust: 34,
    airQuality: '정상',
  };

  const outdoorData = {
    temp: 22,
    humidity: 38,
    dust: 26,
    airQuality: '보통',
  };

  const isDustHigh = indoorData.dust > outdoorData.dust;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>스마트 실내 환경 모니터링</h1>
        <h2>- 대시보드</h2>
      </div>

      {isDustHigh && (
        <div className="alert-message">
          "실내 미세먼지가 실외보다 높으니 환기를 추천드려요."
        </div>
      )}

      <div className="environment-data-container">
        <div className="data-section">
          <h3 className="section-title">실내</h3>
          <div className="data-cards">
            <div className="card temp-card">
              <span className="card-label">온도</span>
              <span className="card-value">{indoorData.temp}°C</span>
            </div>
            <div className="card humidity-card">
              <span className="card-label">습도</span>
              <span className="card-value">{indoorData.humidity}%</span>
            </div>
            <div className="card dust-card">
              <span className="card-label">미세먼지</span>
              <span className="card-value">{indoorData.dust} μg/m³</span>
            </div>
            <div className="card air-quality-card">
              <span className="card-label">공기질</span>
              <span className="card-value">{indoorData.airQuality}</span>
            </div>
          </div>
        </div>

        <div className="data-section">
          <h3 className="section-title">실외</h3>
          <div className="data-cards">
            <div className="card temp-card">
              <span className="card-label">온도</span>
              <span className="card-value">{outdoorData.temp}°C</span>
            </div>
            <div className="card humidity-card">
              <span className="card-label">습도</span>
              <span className="card-value">{outdoorData.humidity}%</span>
            </div>
            <div className="card dust-card">
              <span className="card-label">미세먼지</span>
              <span className="card-value">{outdoorData.dust} μg/m³</span>
            </div>
            <div className="card air-quality-card">
              <span className="card-label">공기질</span>
              <span className="card-value">{outdoorData.airQuality}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="control-section">
        <h3 className="section-title">제어</h3>
        <div className="control-items">
          <div className="control-item">
            <label htmlFor="led-control">LED 제어</label>
            <input
              type="checkbox"
              id="led-control"
              className="toggle-switch"
              role="switch"
              checked={ledControl}
              onChange={() => handleToggle('LED 제어', ledControl, setLedControl)}
            />
          </div>
          <div className="control-item">
            <label htmlFor="manual-fan-control">환기 팬 수동제어</label>
            <input
              type="checkbox"
              id="manual-fan-control"
              className="toggle-switch"
              role="switch"
              checked={manualFanControl}
              onChange={() => handleToggle('환기 팬 수동제어', manualFanControl, setManualFanControl)}
            />
          </div>
          <div className="control-item">
            <label htmlFor="auto-fan-control">환기 팬 자동제어</label>
            <input
              type="checkbox"
              id="auto-fan-control"
              className="toggle-switch"
              role="switch"
              checked={autoFanControl}
              onChange={() => handleToggle('환기 팬 자동제어', autoFanControl, setAutoFanControl)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;