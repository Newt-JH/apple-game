import './GameHeader.css';

interface Props {
    score: number;
    time: number;
    onRestart: () => void;  // 재시작 함수 prop 추가
  }
  
  const GameHeader: React.FC<Props> = ({ score, time, onRestart }) => {
    return (
      <div className="game-header">
        <div className="header-left">
          <button className="header-button">↩</button>
          <button className="header-button" onClick={onRestart}>🔄</button>  {/* 여기에 onClick */}
        </div>
        <div className="header-center">
          <span className="timer">Time: {time}</span>
        </div>
        <div className="header-right">
          <span className="score">Score: {score}</span>
        </div>
      </div>
    );
  };
  
  export default GameHeader;
  