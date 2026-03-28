import React from 'react';
import { CellType } from '../hooks/useMaze';
import './Maze.css';

interface Position {
  x: number;
  y: number;
}

interface MazeProps {
  grid: CellType[][];
  playerPos: Position;
  trail: Position[];
  visited: Set<string>;
}

export const Maze: React.FC<MazeProps> = ({ grid, playerPos, trail, visited }) => {
  if (grid.length === 0) return null;

  const rows = grid.length;
  const cols = grid[0].length;

  const playerSize = (0.7 / Math.max(rows, cols)) * 100;

  return (
    <div className="maze-container">
      <div
        className="maze-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isVisited = visited.has(`${r},${c}`);
            return (
              <div
                key={`${r}-${c}`}
                className={`cell ${cell} ${isVisited ? 'visited' : ''}`}
              />
            );
          })
        )}
      </div>
      
      {trail.map((pos, index) => (
        <div 
          key={`trail-${index}`}
          className="trail-particle"
          style={{
            left: `${(pos.x / cols) * 100}%`,
            top: `${(pos.y / rows) * 100}%`,
            width: `${playerSize}vmin`,
            height: `${playerSize}vmin`,
            opacity: 0.4 * (1 - index / trail.length),
            transform: `translate(-50%, -50%) scale(${1 - index / trail.length})`,
          }}
        />
      ))}

      <div 
        className="player-token" 
        style={{ 
          left: `${(playerPos.x / cols) * 100}%`, 
          top: `${(playerPos.y / rows) * 100}%`,
          width: `${playerSize}vmin`,
          height: `${playerSize}vmin`
        }} 
      />
    </div>
  );
};
