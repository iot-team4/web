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
    aqi: 0, // OpenWeatherMap AQI 값을 저장할 필드 추가
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

  // OpenWeatherMap AQI 값에 따른 공기질 상태 판단 함수
  // 1 = 좋음, 2 = 보통, 3 = 보통, 4 = 나쁨, 5 = 매우 나쁨
  const getOpenWeatherAirQualityStatus = (aqi) => {
    if (aqi === 1) return '좋음';
    if (aqi === 2) return '보통';
    if (aqi === 3) return '보통';
    if (aqi === 4) return '나쁨';
    if (aqi === 5) return '매우나쁨';
    return '알 수 없음';
  };

  // 헬퍼 함수: 온도 카드 색상 결정
  const getTemperatureColor = (temp) => {
    if (temp < 10) return '#a7d9f7'; // 파란색 (10도 미만)
    if (temp >= 10 && temp < 25) return '#fff9c4'; // 노란색 (10도 이상 25도 미만)
    return '#ffcdd2'; // 빨간색 (25도 이상)
  };

  // 헬퍼 함수: 습도 카드 색상 결정
  const getHumidityColor = (humidity) => {
    if (humidity < 50) return '#e3f2fd'; // 연한 파란색 (50% 미만)
    if (humidity >= 50 && humidity < 80) return '#90caf9'; // 파란색 (50% 이상 80% 미만)
    return '#42a5f5'; // 진한 파란색 (80% 이상)
  };

  // 헬퍼 함수: 실내 미세먼지/공기질 카드 색상 결정 (PM2.5 기준)
  const getIndoorDustAirQualityColor = (dustLevel) => {
    if (dustLevel <= 15) return '#e8f5e9'; // 좋음 (그린)
    if (dustLevel <= 35) return '#fff9c4'; // 보통 (노랑)
    if (dustLevel <= 75) return '#ffccbc'; // 나쁨 (주황)
    return '#ef9a9a'; // 매우 나쁨 (빨강)
  };

  // 헬퍼 함수: 실외 미세먼지/공기질 카드 색상 결정 (OpenWeatherMap AQI 기준)
  const getOutdoorAqiColor = (aqi) => {
    if (aqi === 1) return '#e8f5e9'; // 좋음 (그린)
    if (aqi === 2 || aqi === 3) return '#fff9c4'; // 보통 (노랑)
    if (aqi === 4) return '#ffccbc'; // 나쁨 (주황)
    if (aqi === 5) return '#ef9a9a'; // 매우 나쁨 (빨강)
    return '#ffffff'; // 기본값 (흰색)
  };

  // API 호출 함수 (최초 로딩 시 사용)
  const fetchSensorData = async () => {
    try {
      setLoading(true);
      
      // 1. 내부 센서 데이터 가져오기 (기존 API)
      const indoorResponse = await fetch('/api/sensors/latest');
      if (!indoorResponse.ok) {
        throw new Error('내부 센서 데이터를 가져오는데 실패했습니다.');
      }
      const indoorSensorData = await indoorResponse.json();
      
      let indoorTemperature = 0;
      let indoorHumidity = 0;
      let indoorDust = 0;

      for (const data of indoorSensorData) {
        if (data.sensorType === "temperature") indoorTemperature = data.value;
        else if (data.sensorType === "humidity") indoorHumidity = data.value;
        else if (data.sensorType === "pm25") indoorDust = data.value;
      }
      
      setIndoorData({
        temp: indoorTemperature,
        humidity: indoorHumidity,
        dust: indoorDust,
        airQuality: getAirQualityStatus(indoorDust),
      });

      // 2. OpenWeatherMap 온도, 습도 데이터 가져오기 
      const weatherApiKey = 'eeb365b6bdbb50592dc2406f1dc92f3e';
      const lat = 37.631942;
      const lon = 127.055578;
      const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`;

      const weatherResponse = await fetch(weatherApiUrl);
      if (!weatherResponse.ok) {
        throw new Error('외부 날씨 데이터를 가져오는데 실패했습니다.');
      }
      const weatherData = await weatherResponse.json();
      const outdoorTemp = weatherData.main.temp;
      const outdoorHumidity = weatherData.main.humidity;

      // 3. OpenWeatherMap 공기질 데이터 가져오기 
      const airPollutionApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;

      const airPollutionResponse = await fetch(airPollutionApiUrl);
      if (!airPollutionResponse.ok) {
        throw new Error('외부 공기질 데이터를 가져오는데 실패했습니다.');
      }
      const airPollutionData = await airPollutionResponse.json();
      const outdoorPm25 = airPollutionData.list[0].components.pm2_5;
      const outdoorAqi = airPollutionData.list[0].main.aqi; // AQI 값 가져오기 
      
      setOutdoorData({
        temp: outdoorTemp,
        humidity: outdoorHumidity,
        dust: outdoorPm25,
        airQuality: getOpenWeatherAirQualityStatus(outdoorAqi),
        aqi: outdoorAqi, // AQI 값 상태에 저장
      });
      
      setError(null);
    } catch (err) {
      console.error('데이터 가져오기 실패:', err);
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
      const response = await fetch('/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: targetDevice, // 'led' | 'fan' | 'autoFan' 
          action: actionType, // 'on' | 'off' | 'enable' | 'disable' 
          source: 'user', // 'user' | 'auto' 
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

  const getRecommendationMessage = () => {
    // 1. 미세먼지 조건
    if (outdoorData.airQuality === '매우나쁨') {
      return "😷 현재 실외 미세먼지 수치가 매우 높아요! 외출을 자제하고 창문을 닫는 것이 좋아요.";
    }
    if (indoorData.dust > outdoorData.dust) {
      return "💡 실내 미세먼지가 실외보다 높으니 환기를 추천드려요.";
    }

    // 2. 온도 조건
    // 실내 온도가 너무 높고 실외는 쾌적할 때
    if (indoorData.temp > 26 && (indoorData.temp - outdoorData.temp) > 3) {
      return "🌡️ 실내 온도가 높고 실외 온도는 쾌적해요! 창문을 열어 환기하거나 에어컨을 켜는 것을 추천드려요.";
    }
    // 실내 온도가 너무 낮고 실외는 따뜻할 때
    if (indoorData.temp < 20 && (outdoorData.temp - indoorData.temp) > 3) {
      return "🥶 실내 온도가 낮고 실외는 따뜻해요! 난방을 줄이고 창문을 열어 자연 환기를 추천합니다.";
    }
    // 실외 온도가 너무 높을 때
    if (outdoorData.temp > 30) {
      return "🔥 실외 온도가 매우 높으니 창문은 닫고 에어컨을 가동하여 실내 온도를 유지하세요.";
    }
    // 실외 온도가 너무 낮을 때
    if (outdoorData.temp < 5) {
      return "❄️ 실외 온도가 매우 낮으니 창문은 닫고 난방을 가동하여 실내 온기를 유지하세요.";
    }

    // 3. 습도 조건
    // 실내 습도가 너무 높을 때
    if (indoorData.humidity > 70) {
      return "💧 실내 습도가 높아 끈적하게 느껴질 수 있어요. 제습기를 사용하거나 짧게 환기하는 것을 추천합니다.";
    }
    // 실내 습도가 너무 낮을 때
    if (indoorData.humidity < 40) {
      return "🏜️ 실내 습도가 낮아 건조할 수 있어요. 가습기를 사용하거나 젖은 수건을 널어두세요.";
    }
    // 실내 습도가 높고 실외가 건조할 때 (환기와 연관)
    if (indoorData.humidity > 60 && (indoorData.humidity - outdoorData.humidity) > 10) {
      return "🌬️ 실내 습도가 높고 실외는 건조해요! 창문을 열어 환기하여 실내 습도를 낮춰보세요.";
    }

    // 기본 메시지 또는 추천할 내용이 없을 때
    return "현재 실내외 환경은 대체로 쾌적합니다. 좋은 하루 되세요! 😊";
  };

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

    
        <div className="alert-message">
          {getRecommendationMessage()}
        </div>

      <div className="environment-data-container">
        <div className="data-section">
          <h3 className="section-title">실내</h3>
          <div className="data-cards">
            <div className="card" style={{ backgroundColor: getTemperatureColor(indoorData.temp) }}>
              <span className="card-label">온도</span>
              <span className="card-value">{indoorData.temp}°C</span>
            </div>
            <div className="card" style={{ backgroundColor: getHumidityColor(indoorData.humidity) }}>
              <span className="card-label">습도</span>
              <span className="card-value">{indoorData.humidity}%</span>
            </div>
            <div className="card" style={{ backgroundColor: getIndoorDustAirQualityColor(indoorData.dust) }}>
              <span className="card-label">미세먼지</span>
              <span className="card-value">{indoorData.dust} μg/m³</span>
            </div>
            <div className="card" style={{ backgroundColor: getIndoorDustAirQualityColor(indoorData.dust) }}>
              <span className="card-label">공기질</span>
              <span className="card-value">{indoorData.airQuality}</span>
            </div>
          </div>
        </div>

        <div className="data-section">
          <h3 className="section-title">실외</h3>
          <div className="data-cards">
            <div className="card" style={{ backgroundColor: getTemperatureColor(outdoorData.temp) }}>
              <span className="card-label">온도</span>
              <span className="card-value">{outdoorData.temp}°C</span>
            </div>
            <div className="card" style={{ backgroundColor: getHumidityColor(outdoorData.humidity) }}>
              <span className="card-label">습도</span>
              <span className="card-value">{outdoorData.humidity}%</span>
            </div>
            <div className="card" style={{ backgroundColor: getOutdoorAqiColor(outdoorData.aqi) }}>
              <span className="card-label">미세먼지</span>
              <span className="card-value">{outdoorData.dust} μg/m³</span>
            </div>
            <div className="card" style={{ backgroundColor: getOutdoorAqiColor(outdoorData.aqi) }}>
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