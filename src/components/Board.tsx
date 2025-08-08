import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameHeader from './GameHeader';
import Cell from './Cell';
import Modal from './Modal';
import ParticleContainer from './ParticleContainer';
import './Board.css';

const BOARD_WIDTH = 9;
const BOARD_HEIGHT = 12;
const INITIAL_TIME = 20;

function generateRandomNumber() {
  const probabilities = [
    1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2,
    3, 3, 3, 3,
    4, 4, 4,
    5, 5,
    6, 6,
    7,
    8,
    9,
  ];
  const randomIndex = Math.floor(Math.random() * probabilities.length);
  return probabilities[randomIndex];
}

function generateRandomBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => generateRandomNumber())
  );
}

const Board: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [time, setTime] = useState<number>(INITIAL_TIME);
  const [isTimeOver, setIsTimeOver] = useState<boolean>(false);
  const [boardData, setBoardData] = useState<number[][]>(generateRandomBoard());
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState<boolean>(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; burstX: number; burstY: number }[]>([]);
  const [fallingApples, setFallingApples] = useState<{ id: number; x: number; y: number; width: number; height: number }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const setCellSize = useCallback(() => {
    if (!boardRef.current) return;

    const boardElement = boardRef.current;
    const boardWidth = boardElement.clientWidth - 8; // padding left/right
    const boardHeight = boardElement.clientHeight - 30; // padding top/bottom

    const cellWidth = (boardWidth - (BOARD_WIDTH - 1) * 2) / BOARD_WIDTH;
    const cellHeight = (boardHeight - (BOARD_HEIGHT - 1) * 2) / BOARD_HEIGHT;

    const size = Math.floor(Math.min(cellWidth, cellHeight));

    document.documentElement.style.setProperty('--cell-size', `${size}px`);
    document.documentElement.style.setProperty('--font-size', `${size * 0.5}px`);
    document.documentElement.style.setProperty('--cell-padding', `${size * 0.1}px`);
  }, []);

  useEffect(() => {
    setCellSize();
    window.addEventListener('resize', setCellSize);
    return () => window.removeEventListener('resize', setCellSize);
  }, [setCellSize]);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          setIsTimeOver(true);
          clearInterval(timerRef.current!);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTimer]);

  const handleRestart = useCallback(() => {
    setScore(0);
    setTime(INITIAL_TIME);
    setIsTimeOver(false);
    setShowRestartConfirm(false);
    setBoardData(generateRandomBoard());
    setSelectedCells(new Set());
    setStartCell(null);
    setIsAnimating(false);
    setParticles([]);
    setFallingApples([]);
    startTimer();
  }, [startTimer]);

  const getCellFromTouch = useCallback((touch: React.Touch) => {
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target || !target.classList.contains('cell')) return null;

    const row = target.getAttribute('data-row');
    const col = target.getAttribute('data-col');
    if (row === null || col === null) return null;

    return { row: parseInt(row, 10), col: parseInt(col, 10) };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isTimeOver || isAnimating) return;
    const cell = getCellFromTouch(e.touches[0]);
    if (!cell) return;
    setStartCell(cell);
    setSelectedCells(new Set([`${cell.row}-${cell.col}`]));
  }, [isTimeOver, isAnimating, getCellFromTouch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isTimeOver || isAnimating) return;
    if (!startCell) return;
    const current = getCellFromTouch(e.touches[0]);
    if (!current) return;

    const rowMin = Math.min(startCell.row, current.row);
    const rowMax = Math.max(startCell.row, current.row);
    const colMin = Math.min(startCell.col, current.col);
    const colMax = Math.max(startCell.col, current.col);

    const newSelected = new Set<string>();
    for (let r = rowMin; r <= rowMax; r++) {
      for (let c = colMin; c <= colMax; c++) {
        newSelected.add(`${r}-${c}`);
      }
    }
    setSelectedCells(newSelected);
  }, [isTimeOver, isAnimating, startCell, getCellFromTouch]);

  const handleTouchEnd = useCallback(() => {
    if (isTimeOver || isAnimating || selectedCells.size === 0) return;

    let sum = 0;
    selectedCells.forEach(key => {
      const [row, col] = key.split('-').map(Number);
      sum += boardData[row][col];
    });

    const isValid = sum === 10 && selectedCells.size >= 2;

    if (isValid) {
      setIsAnimating(true);
      setScore(prevScore => prevScore + selectedCells.size);

      const newParticles: { id: number; x: number; y: number; burstX: number; burstY: number }[] = [];
      const newFallingApples: { id: number; x: number; y: number; width: number; height: number }[] = [];

      selectedCells.forEach(key => {
        const cellElement = document.querySelector(`[data-row="${key.split('-')[0]}"][data-col="${key.split('-')[1]}"]`);
        if (!cellElement) return;

        const rect = cellElement.getBoundingClientRect();
        const startX = rect.left;
        const startY = rect.top;

        // Particles
        for (let i = 0; i < 8; i++) {
          const burstX = (Math.random() - 0.5) * 80;
          const burstY = (Math.random() - 0.5) * 80;
          newParticles.push({
            id: Date.now() + Math.random(),
            x: startX + rect.width / 2,
            y: startY + rect.height / 2,
            burstX,
            burstY,
          });
        }

        // Falling Apple Clone
        newFallingApples.push({
          id: Date.now() + Math.random(),
          x: startX,
          y: startY,
          width: rect.width,
          height: rect.height,
        });
      });

      setParticles(newParticles);
      setFallingApples(newFallingApples);

      // Update board data immediately
      setBoardData(prevBoardData => {
        const newBoardData = prevBoardData.map(row => [...row]);
        selectedCells.forEach(key => {
          const [row, col] = key.split('-').map(Number);
          newBoardData[row][col] = 0;
        });
        return newBoardData;
      });

      setSelectedCells(new Set());
      setStartCell(null);

      setTimeout(() => {
        setIsAnimating(false);
        setParticles([]);
        setFallingApples([]);
      }, 1200);

    } else {
      setSelectedCells(new Set());
      setStartCell(null);
    }
  }, [isTimeOver, isAnimating, selectedCells, boardData]);

  return (
    <div className="game-container">
      <GameHeader score={score} time={time} onRestart={() => setShowRestartConfirm(true)} />
      <div
        className={`board ${isAnimating ? 'locked' : ''}`}
        ref={boardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {boardData.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((value, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={value}
                rowIndex={rowIndex}
                colIndex={colIndex}
                isSelected={selectedCells.has(`${rowIndex}-${colIndex}`)}
              />
            ))}
          </div>
        ))}
      </div>

      {isTimeOver && (
        <Modal
          isActive={true}
          title="⏰ 시간이 종료되었습니다!"
          message={`최종 점수: ${score}`}
          primaryButtonText="다시 시작하기"
          onPrimaryButtonClick={handleRestart}
        />
      )}

      {showRestartConfirm && (
        <Modal
          isActive={true}
          title="다시 하시겠습니까?"
          message="현재 게임 내용은 사라집니다."
          primaryButtonText="예"
          onPrimaryButtonClick={handleRestart}
          secondaryButtonText="아니오"
          onSecondaryButtonClick={() => {
            setShowRestartConfirm(false);
            startTimer();
          }}
        />
      )}

      <ParticleContainer particles={particles} />

      {fallingApples.map(apple => (
        <div
          key={apple.id}
          className="falling-apple-clone"
          style={{
            left: `${apple.x}px`,
            top: `${apple.y}px`,
            width: `${apple.width}px`,
            height: `${apple.height}px`,
          }}
        ></div>
      ))}
    </div>
  );
};

export default Board;