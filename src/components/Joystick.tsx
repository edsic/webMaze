import React, { useState, useRef, useCallback, useEffect } from 'react';
import './Joystick.css';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const [isActive, setIsActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const maxRadius = 40;

  const handleTouch = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });
    onMove(dx / maxRadius, dy / maxRadius);
  }, [onMove]);

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsActive(true);
    const client = 'touches' in e ? e.touches[0] : e;
    handleTouch(client.clientX, client.clientY);
  };

  useEffect(() => {
    const onTouchMove = (e: TouchEvent | MouseEvent) => {
      if (!isActive) return;
      const client = 'touches' in e ? e.touches[0] : e;
      handleTouch(client.clientX, client.clientY);
    };

    const onTouchEnd = () => {
      setIsActive(false);
      setKnobPos({ x: 0, y: 0 });
      onMove(0, 0);
    };

    if (isActive) {
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('mousemove', onTouchMove);
      window.addEventListener('mouseup', onTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('mousemove', onTouchMove);
      window.removeEventListener('mouseup', onTouchEnd);
    };
  }, [isActive, handleTouch, onMove]);

  return (
    <div className="joystick-wrapper">
      <div 
        ref={baseRef}
        className="joystick-base"
        onMouseDown={onTouchStart}
        onTouchStart={onTouchStart}
      >
        <div 
          className="joystick-knob"
          style={{
            transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`
          }}
        />
      </div>
    </div>
  );
};
