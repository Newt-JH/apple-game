import React, { useState, useEffect } from 'react';
import GameHeader from './components/GameHeader';
import Board from './components/Board';

function App() {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [resetKey, setResetKey] = useState(0); // 보드 리셋용 키

  useEffect(() => {
    if (time <= 0) {
      setIsTimeOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  const handleRestart = () => {
    setScore(0);
    setTime(20);
    setIsTimeOver(false);
    setResetKey((prev) => prev + 1); // 키 변경해서 Board 리렌더링 유도
  };

  return (
    <div style={{ position: 'relative' }}>
      <GameHeader score={score} time={time} onRestart={handleRestart} />
      <Board
        key={resetKey}   // 이 키가 바뀌면 Board가 새로 마운트됩니다
        onScore={(gain: number) => setScore((prev) => prev + gain)}
        disabled={isTimeOver}
      />

      {isTimeOver && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <div>⏰ 시간이 종료되었습니다!</div>
          <div style={{ margin: '10px 0' }}>최종 점수: {score}</div>
          <button
            onClick={handleRestart}
            style={{
              padding: '10px 20px',
              fontSize: '18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#ffd966',
              color: '#333',
            }}
          >
            다시 시작하기
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
