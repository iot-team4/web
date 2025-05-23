import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import Statistics from './Statistics';
import Records from './Records';
import About from './About';
import './App.css';

function App() {
  const [records, setRecords] = useState([]);

  const addRecord = (deviceName, action) => {
    const now = new Date();
    const timestamp = now.getFullYear() + '-' +
                      String(now.getMonth() + 1).padStart(2, '0') + '-' +
                      String(now.getDate()).padStart(2, '0') + ' ' +
                      String(now.getHours()).padStart(2, '0') + ':' +
                      String(now.getMinutes()).padStart(2, '0') + ':' +
                      String(now.getSeconds()).padStart(2, '0');

    const newRecord = {
      id: records.length + 1,
      timestamp: timestamp,
      type: '제어',
      value: `${deviceName} ${action === 'on' ? '켜짐' : '꺼짐'}`,
      detail: `${deviceName} 기능을 ${action === 'on' ? 'On' : 'Off'} 하였습니다.`,
    };
    setRecords(prevRecords => [newRecord, ...prevRecords]);
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <h2>사물인터넷 3B 4팀</h2>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>대시보드</NavLink>
            </li>
            <li>
              <NavLink to="/statistics" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>통계</NavLink>
            </li>
            <li>
              <NavLink to="/records" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>기록</NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>만든사람들</NavLink>
            </li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard addRecord={addRecord} />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/records" element={<Records records={records} />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;