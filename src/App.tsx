import { useState, useEffect, useCallback } from 'react';
import { useMaze } from './hooks/useMaze';
import { useMovement } from './hooks/useMovement';
import { useIsTouchDevice } from './hooks/useIsTouchDevice';
import { Maze } from './components/Maze';
import { Joystick } from './components/Joystick';
import './App.css';

type GameState = 'START' | 'PLAYING' | 'WON';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const MAZE_SIZES = {
  EASY: 21,
  MEDIUM: 41,
  HARD: 61,
};

function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [mazeSize, setMazeSize] = useState(MAZE_SIZES.MEDIUM);
  const { grid, generateMaze } = useMaze(mazeSize, mazeSize);
  const isTouchDevice = useIsTouchDevice();

  const handleWin = useCallback(() => {
    setGameState('WON');
  }, []);

  const { playerPos, trail, visited, resetPlayer, setTouchVector } = useMovement(grid, handleWin);

  const startNewGame = useCallback((difficulty?: Difficulty) => {
    const size = difficulty ? MAZE_SIZES[difficulty] : mazeSize;
    if (difficulty) setMazeSize(size);
    
    generateMaze();
    resetPlayer();
    setGameState('PLAYING');
  }, [generateMaze, resetPlayer, mazeSize]);

  // Initial maze generation when size changes
  useEffect(() => {
    generateMaze();
  }, [mazeSize, generateMaze]);

  return (
    <div className="app-container">
      <header>
        <h1>Monochrome Maze</h1>
        <p className="controls">
          {isTouchDevice ? 'Use Virtual Joystick to move' : 'Use Arrow Keys or WASD to move'}
        </p>
      </header>

      <main>
        {gameState === 'START' ? (
          <div className="selection-screen">
            <div className="selection-modal">
              <h2>Select Difficulty</h2>
              <div className="difficulty-buttons">
                <button onClick={() => startNewGame('EASY')}>Easy</button>
                <button onClick={() => startNewGame('MEDIUM')}>Medium</button>
                <button onClick={() => startNewGame('HARD')}>Hard</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Maze grid={grid} playerPos={playerPos} trail={trail} visited={visited} />
            {gameState === 'PLAYING' && isTouchDevice && <Joystick onMove={setTouchVector} />}
          </>
        )}

        
        {gameState === 'WON' && (
          <div className="win-overlay">
            <div className="win-modal">
              <h2>You Escaped!</h2>
              <div className="win-actions">
                <button onClick={() => startNewGame()}>Try Again</button>
                <button onClick={() => setGameState('START')}>Main Menu</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer>
        {gameState === 'PLAYING' && (
          <button className="new-game-btn" onClick={() => setGameState('START')}>
            Quit to Menu
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
