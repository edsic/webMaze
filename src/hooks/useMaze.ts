import { useState, useCallback } from 'react';

export type CellType = 'wall' | 'path' | 'start' | 'end';

export const useMaze = (width: number, height: number) => {
  const [grid, setGrid] = useState<CellType[][]>([]);

  const generateMaze = useCallback(() => {
    // Ensure dimensions are odd
    const rows = height % 2 === 0 ? height + 1 : height;
    const cols = width % 2 === 0 ? width + 1 : width;

    const newGrid: CellType[][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill('wall'));

    const stack: [number, number][] = [];
    const startRow = 1;
    const startCol = 1;

    newGrid[startRow][startCol] = 'path';
    stack.push([startRow, startCol]);

    const visited = new Set<string>();
    visited.add(`${startRow},${startCol}`);

    while (stack.length > 0) {
      const [r, c] = stack[stack.length - 1];
      const neighbors: [number, number, number, number][] = [];

      // Check neighbors 2 steps away
      const directions: [number, number][] = [
        [0, 2], [0, -2], [2, 0], [-2, 0]
      ];

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && !visited.has(`${nr},${nc}`)) {
          neighbors.push([nr, nc, r + dr / 2, c + dc / 2]);
        }
      }

      if (neighbors.length > 0) {
        const [nr, nc, wr, wc] = neighbors[Math.floor(Math.random() * neighbors.length)];
        newGrid[wr][wc] = 'path';
        newGrid[nr][nc] = 'path';
        visited.add(`${nr},${nc}`);
        stack.push([nr, nc]);
      } else {
        stack.pop();
      }
    }

    newGrid[1][1] = 'start';
    newGrid[rows - 2][cols - 2] = 'end';

    setGrid(newGrid);
  }, [width, height]);

  return { grid, generateMaze };
};
