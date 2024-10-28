import React, { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';

interface TouchControlsProps {
  onMove: (direction: { x: number; y: number }) => void;
  onShoot: (shooting: boolean) => void;
  onAim: (angle: number) => void;
}

const TouchControls: React.FC<TouchControlsProps> = ({ onMove, onShoot, onAim }) => {
  const [moveTouch, setMoveTouch] = useState<Touch | null>(null);
  const [aimTouch, setAimTouch] = useState<Touch | null>(null);
  const [movePosition, setMovePosition] = useState({ x: 0, y: 0 });
  const [aimPosition, setAimPosition] = useState({ x: 0, y: 0 });
  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const [aimBasePosition, setAimBasePosition] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    
    if (touch.clientX < window.innerWidth / 2 && !moveTouch) {
      setMoveTouch(touch);
      setBasePosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      setMovePosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    } else if (touch.clientX >= window.innerWidth / 2 && !aimTouch) {
      setAimTouch(touch);
      setAimBasePosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      setAimPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      onShoot(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      
      if (moveTouch?.identifier === touch.identifier) {
        const newPos = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
        setMovePosition(newPos);
        
        const dx = newPos.x - basePosition.x;
        const dy = newPos.y - basePosition.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const maxLength = 50;
        
        if (length > 0) {
          const scale = Math.min(length, maxLength) / length;
          onMove({
            x: (dx * scale) / maxLength,
            y: (dy * scale) / maxLength
          });
        }
      } else if (aimTouch?.identifier === touch.identifier) {
        const newPos = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
        setAimPosition(newPos);
        
        const dx = newPos.x - aimBasePosition.x;
        const dy = newPos.y - aimBasePosition.y;
        onAim(Math.atan2(dy, dx));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touches = Array.from(e.touches);
    
    if (!touches.find(t => t.identifier === moveTouch?.identifier)) {
      setMoveTouch(null);
      onMove({ x: 0, y: 0 });
    }
    
    if (!touches.find(t => t.identifier === aimTouch?.identifier)) {
      setAimTouch(null);
      onShoot(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 touch-none z-50 pointer-events-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Movement Joystick */}
      {moveTouch && (
        <>
          <div 
            className="absolute w-32 h-32 rounded-full border-2 border-white/20 bg-black/20"
            style={{
              left: basePosition.x - 64,
              top: basePosition.y - 64
            }}
          />
          <div 
            className="absolute w-16 h-16 rounded-full bg-white/30"
            style={{
              left: movePosition.x - 32,
              top: movePosition.y - 32
            }}
          />
        </>
      )}

      {/* Aim Joystick */}
      {aimTouch && (
        <>
          <div 
            className="absolute w-32 h-32 rounded-full border-2 border-red-500/20 bg-black/20"
            style={{
              left: aimBasePosition.x - 64,
              top: aimBasePosition.y - 64
            }}
          />
          <div 
            className="absolute w-16 h-16 rounded-full bg-red-500/30"
            style={{
              left: aimPosition.x - 32,
              top: aimPosition.y - 32
            }}
          />
        </>
      )}

      {/* Visual Indicators */}
      <div className="absolute left-16 bottom-32 text-white/50 text-sm">
        移动摇杆
      </div>
      <div className="absolute right-16 bottom-32 text-white/50 text-sm">
        射击摇杆
      </div>
    </div>
  );
};

export default TouchControls;