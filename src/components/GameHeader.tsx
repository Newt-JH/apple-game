import React from 'react';
import './GameHeader.css';

interface GameHeaderProps {
  score: number;
  time: number;
  onRestart: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ score, time, onRestart }) => {
  return (
    <div className="game-header">
      <div className="header-left">
        <button className="header-button" onClick={onRestart}>🔄</button>
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