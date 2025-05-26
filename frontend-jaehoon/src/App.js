import { useEffect, useState } from "react";
import axios from "axios";
import SensorChart from "./components/SensorChart";

// 시간 포맷: 10:00 표시용
function getHourStr(timestamp) {
  const date = new Date(timestamp);
  const hour = String(date.getHours()).padStart(2, '0');
  return `${hour}:00`;  // 문자열 포맷 수정
}

// 날짜 + 시간 전체 포맷
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return "🕐 " + date.toLocaleString("ko-KR", options).replace(",", "");
}

function App() {
  const [records, setRecords] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState("all");

  useEffect(() => {
    axios.get("http://localhost:4000/records")
      .then(response => {
        const raw = response.data.filter(r => {
          const hour = new Date(r.timestamp).getHours();
          return hour >= 10 && hour <= 18;
        });

        const chartReady = raw.map(record => ({
          time: getHourStr(record.timestamp),
          temperature: parseFloat(record.temperature),
          humidity: parseFloat(record.humidity),
          pm25: parseFloat(record.pm25),
        }));

        setRecords(raw);
        setChartData(chartReady);
      })
      .catch(error => {
        console.error("데이터 오류:", error);
      });
  }, []);

  const sensorButtons = [
    { key: "all", label: "모두 보기" },
    { key: "temperature", label: "🌡️ 온도" },
    { key: "humidity", label: "💧 습도" },
    { key: "pm25", label: "🌫️ 미세먼지" }
  ];

  return (
    <div style={{
      padding: "40px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f0f2f5",
      minHeight: "100vh"
    }}>
      <h1 style={{
        fontSize: "32px",
        fontWeight: "bold",
        color: "#333",
        marginBottom: "20px"
      }}>📋 센서 기록 (1시간 단위)</h1>

      {/* ✅ 센서 추가 폼 */}
      <div style={{
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
        marginBottom: "30px",
        maxWidth: "400px",
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>➕ 센서 데이터 추가</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input id="tempInput" placeholder="온도 (예: 23.5°C)" />
          <input id="humInput" placeholder="습도 (예: 55%)" />
          <input id="pmInput" placeholder="미세먼지 (예: 35μg/m³)" />
          <button onClick={() => {
            const temperature = document.getElementById("tempInput").value;
            const humidity = document.getElementById("humInput").value;
            const pm25 = document.getElementById("pmInput").value;

            const kstTimestamp = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();

            axios.post("http://localhost:4000/records", {
              id: Date.now(),
              timestamp: kstTimestamp,
              temperature,
              humidity,
              pm25
            }).then(() => window.location.reload());
          }} style={{
            backgroundColor: "#0077cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px",
            cursor: "pointer"
          }}>
            추가하기
          </button>
        </div>
      </div>

      {/* 필터 버튼 */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
        {sensorButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => setSelectedSensor(btn.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              backgroundColor: selectedSensor === btn.key ? "#0077cc" : "#e0e0e0",
              color: selectedSensor === btn.key ? "#fff" : "#333",
              fontWeight: "bold"
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 차트 출력 */}
      <SensorChart data={chartData} selectedSensor={selectedSensor} />

      {/* 기록 카드 */}
      {records.map(record => {
        const showTemperature = selectedSensor === "all" || selectedSensor === "temperature";
        const showHumidity = selectedSensor === "all" || selectedSensor === "humidity";
        const showPM = selectedSensor === "all" || selectedSensor === "pm25";

        return (
          <div key={record.id} style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "14px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
            marginBottom: "24px",
            borderLeft: "6px solid #0077cc"
          }}>
            <p style={{ fontWeight: "bold", color: "#0077cc", fontSize: "17px", marginBottom: "8px" }}>
              {formatTime(record.timestamp)}
            </p>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "16px",
              color: "#333"
            }}>
              {showTemperature && <span>🌡️ <strong>온도:</strong> {record.temperature}</span>}
              {showHumidity && <span>💧 <strong>습도:</strong> {record.humidity}</span>}
              {showPM && <span>🌫️ <strong>미세먼지:</strong> {record.pm25}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default App;