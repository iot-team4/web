import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import io from 'socket.io-client';

function Dashboard({ addRecord }) {
  const [ledControl, setLedControl] = useState(false);
  const [manualFanControl, setManualFanControl] = useState(false);
  const [autoFanControl, setAutoFanControl] = useState(true);
  
  // API 데이터를 위한 state
  const [indoorData, setIndoorData] = useState({
    temp: 0,
    humidity: 0,
    dust: 0,
    airQuality: '로딩중...',
  });
  
  const [outdoorData, setOutdoorData] = useState({
    temp: 0,
    humidity: 0,
    dust: 0,
    airQuality: '로딩중...',
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 미세먼지 수치에 따른 공기질 상태 판단 함수
  const getAirQualityStatus = (dustLevel) => {
    if (dustLevel <= 15) return '좋음';
    if (dustLevel <= 35) return '보통';
    if (dustLevel <= 75) return '나쁨';
    return '매우나쁨';
  };

  // API 호출 함수 (최초 로딩 시 사용)
  const fetchSensorData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/sensors/latest'); // 최신 센서 데이터 조회 API 사용 
      if (!response.ok) {
        throw new Error('센서 데이터를 가져오는데 실패했습니다.');
      }
      const sensorData = await response.json();
      
      let temperature = 0;
      let humidity = 0;
      let dust = 0;

      for (const data of sensorData) {
        if (data.sensorType === "temperature") temperature = data.value;
        else if (data.sensorType === "humidity") humidity = data.value;
        else if (data.sensorType === "pm25") dust = data.value;
      }
      
      setIndoorData({
        temp: temperature,
        humidity: humidity,
        dust: dust,
        airQuality: getAirQualityStatus(dust),
      });
      
      // 실외 데이터는 현재 API 응답에서 명확히 구분되지 않으므로, 
      // 필요에 따라 백엔드 API 응답 구조를 조정하거나 
      // 실외 센서 데이터도 받아오도록 로직 추가 필요
      // 일단은 indoorData와 동일하게 또는 0으로 설정합니다.
      setOutdoorData({
        temp: 0, // 실제 실외 데이터가 있다면 여기에 매핑
        humidity: 0, // 실제 실외 데이터가 있다면 여기에 매핑
        dust: 0, // 실제 실외 데이터가 있다면 여기에 매핑
        airQuality: '알 수 없음', 
      });
      
      setError(null);
    } catch (err) {
      console.error('센서 데이터 가져오기 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기 및 웹소켓 연결
  useEffect(() => {
    fetchSensorData(); // 초기 데이터 로딩
    
    // 웹소켓 연결
    const socket = io('http://localhost:3000/frontend'); // 백엔드 서버 주소 (예: 'http://localhost:3000')를 인자로 전달할 수 있습니다.

    // 'sensor-update' 채널 구독 
    socket.on('sensor-update', (data) => { // 센서 데이터가 백엔드로 들어오면 실시간으로 프론트에 전송됩니다. 
      console.log('웹소켓으로 센서 데이터 수신:', data);
      // 수신된 데이터로 indoorData 업데이트
      setIndoorData(prevData => {
        let newTemp = prevData.temp;
        let newHumidity = prevData.humidity;
        let newDust = prevData.dust;

        if (data.sensorType === 'temperature') { // 센서 타입은 'temperature' | 'humidity' | 'pm25' 중 하나입니다. 
          newTemp = data.value;
        } else if (data.sensorType === 'humidity') {
          newHumidity = data.value;
        } else if (data.sensorType === 'pm25') {
          newDust = data.value;
        }

        return {
          temp: newTemp,
          humidity: newHumidity,
          dust: newDust,
          airQuality: getAirQualityStatus(newDust),
        };
      });
    });

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => {
      socket.disconnect();
    };
  }, []); // 빈 배열은 컴포넌트가 처음 마운트될 때만 실행됨을 의미합니다.

  const handleToggle = async (deviceName, currentState, setStateFunction) => {
    const newState = !currentState;
    setStateFunction(newState);
    
    let targetDevice = '';
    let actionType = '';

    if (deviceName === 'LED 제어') {
      targetDevice = 'led';
      actionType = newState ? 'on' : 'off'; // target이 led일 때 action은 'on' 또는 'off' 
    } else if (deviceName === '환기 팬 수동제어') {
      targetDevice = 'fan';
      actionType = newState ? 'on' : 'off'; // target이 fan일 때 action은 'on' 또는 'off' 
    } else if (deviceName === '환기 팬 자동제어') {
      targetDevice = 'autoFan';
      actionType = newState ? 'enable' : 'disable'; // target이 autoFan일 때 action은 'enable' 또는 'disable' 
    }

    try {
      // API로 제어 명령 전송 
      const response = await fetch('/api/control', { // 부품 제어 API 사용 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: targetDevice, // 'led' | 'fan' | 'autoFan' 
          action: actionType, // 'on' | 'off' | 'enable' | 'disable' 
          source: 'user', // 'user' | 'auto' 
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        // 백엔드에서 400 Bad Request 또는 500 Internal Server Error 발생 시 
        const errorData = await response.json();
        throw new Error(errorData.message || '디바이스 제어에 실패했습니다.');
      }
      
      // 성공적으로 제어되면 기록 추가
      addRecord(deviceName, actionType);
    } catch (err) {
      console.error('디바이스 제어 실패:', err);
      // 실패 시 상태 되돌리기
      setStateFunction(currentState);
      setError(`${deviceName} 제어에 실패했습니다: ${err.message}`);
    }
  };

  const isDustHigh = indoorData.dust > outdoorData.dust;

  if (loading && indoorData.temp === 0) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1>스마트 실내 환경 모니터링</h1>
          <h2>- 대시보드</h2>
        </div>
        <div className="loading-message">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>스마트 실내 환경 모니터링</h1>
        <h2>- 대시보드</h2>
      </div>

      {error && (
        <div className="error-message">
          오류: {error}
        </div>
      )}

      {isDustHigh && (
        <div className="alert-message">
          💡 "실내 미세먼지가 실외보다 높으니 환기를 추천드려요."
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