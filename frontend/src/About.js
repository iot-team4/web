import React from 'react';
import './About.css';

function About() {
  const teamMembers = [
    { name: '조희철', position: '팀원', emoji: '👨‍💼', role: '하드웨어 설계 및 제작', studentId: '202116065' },
    { name: '이선우', position: '팀원', emoji: '👨‍💼', role: '하드웨어 제어 파이썬 소스 코딩', studentId: '202116051' },
    { name: '박준혁', position: '팀장', emoji: '🌟', role: '백엔드 개발 / DB 개발', studentId: '202316035' },
    { name: '이재훈', position: '팀원', emoji: '👨‍💼', role: '프론트엔드 개발 / UI/UX 디자인', studentId: '202116047' },
    { name: '정상건', position: '팀원', emoji: '👨‍💼', role: '프론트엔드 개발 / UI/UX 디자인', studentId: '202116046' },
  ];

  return (
    <div className="about-page">
      <div className="page-header">
        <h1>스마트 실내 환경 모니터링</h1>
        <h2>- 만든사람들</h2>
      </div>

      <div className="team-intro-container">
        <h3>저희 팀을 소개합니다.</h3>
        <p>
          이 웹 애플리케이션은 <strong>"사물인터넷 3B 4팀"</strong>이 스마트 실내 환경 모니터링 시스템 구축 프로젝트의 일환으로 개발했습니다.
          쾌적한 실내 환경을 제공하기 위한 노력을 담았습니다.
        </p>

        <div className="team-members-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="member-card">
              {}
              <p className="member-position">
                {member.emoji} {member.position}
              </p>
              <h4 className="member-name">{member.name}</h4>
              <p className="member-role">{member.role}</p>
              {member.studentId && <p className="member-id">학번: {member.studentId}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;