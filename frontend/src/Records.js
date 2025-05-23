import React from 'react';
import './Records.css';

function Records({ records }) {
  return (
    <div className="records-page">
      <div className="page-header">
        <h1>스마트 실내 환경 모니터링</h1>
        <h2>- 기록</h2>
      </div>

      <div className="records-list-container">
        <h3>최근 활동 기록</h3>
        <ul className="records-list">
          {records.length > 0 ? (
            records.map(record => (
              <li key={record.id} className="record-item">
                <span className="record-timestamp">{record.timestamp}</span>
                <span className="record-value">{record.value}</span>
                <p className="record-detail">{record.detail}</p>
              </li>
            ))
          ) : (
            <p className="no-records-message">아직 제어 기록이 없습니다.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Records;