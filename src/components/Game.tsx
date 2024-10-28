import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { GameEngine } from '../game/GameEngine';
import { SoundManager } from '../game/core/SoundManager';
import { SaveManager } from '../game/core/SaveManager';
import MobileControls from './MobileControls';
import Minimap from './Minimap';
import LevelInfo from './LevelInfo';
import { Vector2D } from '../game/types';
import { isMobile } from '../utils/device';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const animationFrameRef = useRef<number>();
  const { gameState, dispatch } = useGame();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [minimapData, setMinimapData] = useState<{
    playerTank: any;
    enemyTanks: any[];
    cameraPosition: Vector2D;
  } | null>(null);
  const [objectives, setObjectives] = useState<any[]>([]);

  const gameLoop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.update();
      engineRef.current.draw();

      const currentPlayerTank = engineRef.current.getPlayerTank();
      const currentEnemyTanks = engineRef.current.getEnemyTanks();
      const currentCameraPosition = engineRef.current.getCameraPosition();
      const currentObjectives = engineRef.current.getLevelObjectives();

      setObjectives(currentObjectives);
      setMinimapData({
        playerTank: currentPlayerTank,
        enemyTanks: currentEnemyTanks,
        cameraPosition: currentCameraPosition
      });
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (!engineRef.current) {
      engineRef.current = new GameEngine(canvas, dispatch);
      soundManagerRef.current = new SoundManager();
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
    };
  }, [gameLoop, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      if (engineRef.current) {
        engineRef.current.handleResize(canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMove = useCallback((direction: Vector2D) => {
    if (engineRef.current) {
      engineRef.current.handleTouchMove(direction);
    }
  }, []);

  const handleShoot = useCallback((shooting: boolean) => {
    if (engineRef.current) {
      engineRef.current.handleTouchShoot(shooting);
      if (shooting && soundManagerRef.current) {
        soundManagerRef.current.play('cannon');
      }
    }
  }, []);

  const handleAim = useCallback((angle: number) => {
    if (engineRef.current) {
      engineRef.current.handleTouchAim(angle);
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
    if (soundManagerRef.current) {
      soundManagerRef.current.toggle();
    }
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full aspect-video bg-slate-800 touch-none"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {minimapData && (
        <Minimap
          worldSize={{ width: 3000, height: 3000 }}
          playerTank={minimapData.playerTank}
          enemyTanks={minimapData.enemyTanks}
          viewportSize={{
            width: canvasRef.current?.width || 800,
            height: canvasRef.current?.height || 600,
          }}
          playerPosition={minimapData.playerTank.position}
          cameraPosition={minimapData.cameraPosition}
        />
      )}

      {isMobile() && (
        <MobileControls
          onMove={handleMove}
          onShoot={handleShoot}
          onAim={handleAim}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      )}

      <div className="absolute top-4 right-4">
        <LevelInfo objectives={objectives} />
      </div>
    </div>
  );
};

export default Game;