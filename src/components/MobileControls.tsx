import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../context/GameContext';
import TouchControls from './TouchControls';
import WeaponHUD from './WeaponHUD';

interface MobileControlsProps {
  onMove: (direction: { x: number; y: number }) => void;
  onShoot: (shooting: boolean) => void;
  onAim: (angle: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onShoot,
  onAim,
  soundEnabled,
  onToggleSound
}) => {
  const { gameState } = useGame();

  return (
    <div className="fixed inset-0 pointer-events-none">
      <TouchControls
        onMove={onMove}
        onShoot={onShoot}
        onAim={onAim}
      />

      {/* Mobile HUD */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onToggleSound}
          className="w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur-sm
                   flex items-center justify-center text-white"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Weapon Selection */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto">
        <WeaponHUD
          currentWeapon="cannon"
          onWeaponSelect={() => {}}
          weapons={['cannon', 'machinegun', 'plasma']}
        />
      </div>

      {/* Mobile Stats */}
      <div className="absolute top-4 left-4 right-20 flex gap-2">
        <div className="flex-1 bg-slate-800/80 backdrop-blur-sm rounded-lg p-2">
          <div className="h-2 bg-red-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${gameState.playerHealth}%` }}
            />
          </div>
        </div>
        <div className="flex-1 bg-slate-800/80 backdrop-blur-sm rounded-lg p-2">
          <div className="h-2 bg-blue-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${gameState.playerEnergy}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileControls;