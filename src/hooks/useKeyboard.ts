import { useState, useEffect, useCallback, useRef } from 'react';
import { CellType } from './useMaze';

interface Position {
  x: number;
  y: number;
}

export const useKeyboard = (grid: CellType[][], onWin: () => void) => {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1.5, y: 1.5 });
  const [trail, setTrail] = useState<Position[]>([]);
  const [visited, setVisited] = useState<Set<string>>(new Set(["1,1"]));
  const keysPressed = useRef<Set<string>>(new Set());
  const requestRef = useRef<number>(null);
  
  const playerRadius = 0.3; 
  const speed = 0.12; 

  const checkCollision = useCallback((nx: number, ny: number) => {
    if (grid.length === 0) return true;

    const points = [
      [nx - playerRadius, ny - playerRadius],
      [nx + playerRadius, ny - playerRadius],
      [nx - playerRadius, ny + playerRadius],
      [nx + playerRadius, ny + playerRadius],
      [nx, ny]
    ];

    for (const [px, py] of points) {
      const gridX = Math.floor(px);
      const gridY = Math.floor(py);

      if (
        gridY < 0 || gridY >= grid.length ||
        gridX < 0 || gridX >= grid[0].length ||
        grid[gridY][gridX] === 'wall'
      ) {
        return true;
      }

      if (grid[gridY][gridX] === 'end') {
        onWin();
      }
    }

    return false;
  }, [grid, onWin]);

  const update = useCallback(() => {
    let dx = 0;
    let dy = 0;

    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) dy -= 1;
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) dy += 1;
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) dx -= 1;
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / length * speed;
      const ny = dy / length * speed;

      setPlayerPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (!checkCollision(prev.x + nx, prev.y)) {
          newX += nx;
        }
        if (!checkCollision(newX, prev.y + ny)) {
          newY += ny;
        }

        const gridX = Math.floor(newX);
        const gridY = Math.floor(newY);
        const cellKey = `${gridY},${gridX}`;

        // Add to trail and visited
        if (newX !== prev.x || newY !== prev.y) {
          setTrail((t) => [prev, ...t].slice(0, 12));
          
          setVisited((v) => {
            if (!v.has(cellKey)) {
              const next = new Set(v);
              next.add(cellKey);
              return next;
            }
            return v;
          });
        }

        return { x: newX, y: newY };
      });
    } else {
      setTrail((t) => t.slice(0, Math.max(0, t.length - 1)));
    }

    requestRef.current = requestAnimationFrame(update);
  }, [checkCollision]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  const resetPlayer = useCallback(() => {
    setPlayerPos({ x: 1.5, y: 1.5 });
    setTrail([]);
    setVisited(new Set(["1,1"]));
  }, []);

  return { playerPos, trail, visited, resetPlayer };
};
