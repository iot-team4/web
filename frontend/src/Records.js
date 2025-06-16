import React, { useState, useEffect } from 'react';
import './Records.css';

function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [hasMore, setHasMore] = useState(true); // 다음 페이지가 있는지 여부

  const ITEMS_PER_PAGE = 20; // 한 페이지에 표시할 기록 수 (API 기본 limit과 동일)

  // 제어 기록을 불러오는 함수
  const fetchRecords = async (page) => {
    setLoading(true);
    setError(null);
    try {
      // offset은 현재 페이지 번호와 ITEMS_PER_PAGE를 기반으로 계산됩니다.
      // 예: 1페이지 = offset 0, 2페이지 = offset 20
      const offset = (page - 1) * ITEMS_PER_PAGE;
      
      // 백엔드에서 'offset' 파라미터를 지원한다고 가정합니다.
      const url = `/api/logs/control?limit=${ITEMS_PER_PAGE}&offset=${offset}&orderBy=desc`;
      console.log(`Fetching records from: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '제어 기록을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setRecords(data); // 현재 페이지의 기록만 설정

      // 불러온 기록의 수가 ITEMS_PER_PAGE보다 적으면 더 이상 다음 페이지가 없는 것으로 판단
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('제어 기록 로딩 실패:', err);
      setError(err.message);
      setHasMore(false); // 오류 발생 시 페이지네이션 중지
    } finally {
      setLoading(false);
    }
  };

  // currentPage 상태가 변경될 때마다 기록을 다시 불러옵니다.
  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage]);

  // 이전 페이지로 이동
  const goToPreviousPage = () => {
    setCurrentPage(prevPage => Math.max(1, prevPage - 1)); // 1페이지보다 작아지지 않도록
  };

  // 다음 페이지로 이동
  const goToNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

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
            records.map((record, index) => (
              // API 응답에 id가 있다고 가정하지만, 안정성을 위해 index도 사용
              <li key={record.id || index} className="record-item">
                <span className="record-timestamp">{new Date(record.createdAt).toLocaleString()}</span>
                <span className="record-type">{record.target === 'led' ? 'LED' : record.target === 'fan' ? '환기 팬' : record.target === 'autoFan' ? '환기 팬 자동제어' : record.target}</span>
                <span className="record-value">
                  {/* action 값에 따라 사용자 친화적인 텍스트 표시 */}
                  {record.action === 'on' ? '켜짐' : 
                   record.action === 'off' ? '꺼짐' :
                   record.action === 'enabled' ? '활성화됨' :
                   record.action === 'disabled' ? '비활성화됨' :
                   record.action}
                </span>
                <p className="record-detail">출처: {record.source === 'user' ? '사용자' : '자동'}</p>
              </li>
            ))
          ) : (
            // 로딩 중이 아니고 기록이 없을 때만 메시지 표시
            !loading && <p className="no-records-message">아직 제어 기록이 없습니다. 📝</p>
          )}
        </ul>

        {/* 로딩 중일 때 메시지 표시 */}
        {loading && <p className="loading-message">기록을 불러오는 중... ⏳</p>}
        {/* 오류 발생 시 메시지 표시 */}
        {error && <p className="error-message">오류: {error} ❌</p>}

        {/* 페이지네이션 컨트롤 */}
        {!loading && (
          <div className="pagination-controls">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1} // 첫 페이지에서는 이전 버튼 비활성화
              className="pagination-button"
            >
              이전 페이지
            </button>
            <span className="page-info">페이지: {currentPage}</span>
            <button
              onClick={goToNextPage}
              disabled={!hasMore || records.length === 0} // 더 이상 기록이 없거나 현재 페이지에 기록이 없으면 다음 버튼 비활성화
              className="pagination-button"
            >
              다음 페이지
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Records;