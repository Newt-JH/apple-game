import React, { useState, useEffect, useRef } from 'react';
import './Board.css';

const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 10;

function generateRandomBoard(): number[][] {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => Math.floor(Math.random() * 9) + 1)
  );
}

interface BoardProps {
    onScore: (gain: number) => void;
    disabled?: boolean;
  }

const Board: React.FC<BoardProps> = ({ onScore, disabled = false }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const startCellRef = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    setBoard(generateRandomBoard());
  }, []);

  const getCellFromTouch = (touch: Touch): { row: number; col: number } | null => {
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target || !target.classList.contains('cell')) return null;

    const dataset = (target as HTMLElement).dataset;
    const row = parseInt(dataset.row || '', 10);
    const col = parseInt(dataset.col || '', 10);
    if (isNaN(row) || isNaN(col)) return null;

    return { row, col };
  };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled) return;
    const cell = getCellFromTouch(e.touches[0] as Touch);
    if (!cell) return;
    startCellRef.current = cell;
    setSelectedCells(new Set([`${cell.row}-${cell.col}`]));
  };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (disabled) return;
    const start = startCellRef.current;
    const current = getCellFromTouch(e.touches[0] as Touch);
    if (!start || !current) return;

    const rowMin = Math.min(start.row, current.row);
    const rowMax = Math.max(start.row, current.row);
    const colMin = Math.min(start.col, current.col);
    const colMax = Math.max(start.col, current.col);

    const newSelected = new Set<string>();
    for (let r = rowMin; r <= rowMax; r++) {
      for (let c = colMin; c <= colMax; c++) {
        newSelected.add(`${r}-${c}`);
      }
    }

    setSelectedCells(newSelected);
  };

    const handleTouchEnd = () => {
        if (disabled) return;
    if (selectedCells.size === 0) return;

    let sum = 0;
    selectedCells.forEach((key) => {
      const [row, col] = key.split('-').map(Number);
      sum += board[row][col];
    });

    const isValid = sum === 10 && selectedCells.size >= 3;

    if (isValid) {
      const newBoard = board.map((rowArr, rowIdx) =>
        rowArr.map((value, colIdx) =>
          selectedCells.has(`${rowIdx}-${colIdx}`) ? 0 : value
        )
      );
      setBoard(newBoard);

      // ✅ 점수 전달
      if (onScore) {
        onScore(selectedCells.size);
      }
    }

    setSelectedCells(new Set());
    startCellRef.current = null;
  };

  return (
    <div
      className="board"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {board.map((row, rowIndex) => (
        <div className="board-row" key={rowIndex}>
          {row.map((value, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const isSelected = selectedCells.has(key);
            const isEmpty = value === 0;

            return (
              <div
                className={`cell ${isSelected ? 'selected' : ''} ${isEmpty ? 'empty' : ''}`}
                key={key}
                data-row={rowIndex}
                data-col={colIndex}
              >
                {value !== 0 ? value : ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;
