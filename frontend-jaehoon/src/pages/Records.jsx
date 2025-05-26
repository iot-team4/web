// src/pages/Records.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Records.css';

export default function Records() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/records') // ✅ 백엔드 API 주소 명세서 기준
      .then((res) => {
        setLogs(res.data);
      })
      .catch((err) => {
        console.error('데이터 불러오기 실패:', err);
      });
  }, []);

  return (
    <div className="records-container">
      <h2>제어 기록</h2>
      {logs.map((log, idx) => (
        <div key={idx} className={`log-item ${log.type.toLowerCase()}`}>
          <p className="log-message">{log.message}</p>
          <span className="log-time">
            {new Date(log.timestamp).toLocaleString('ko-KR')}
          </span>
        </div>
      ))}
    </div>
  );
}

