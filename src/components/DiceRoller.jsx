import React, { useState, useRef } from 'react';

/**
 * نرد توليد الأرقام العشوائية للتمارين والأنشطة
 */
export default function DiceRoller({ onClose }) {
  const [diceCount, setDiceCount] = useState(2);
  const [values, setValues] = useState([3, 5]);
  const [isRolling, setIsRolling] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: 260 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  const rollDice = () => {
    setIsRolling(true);
    let counter = 0;
    const interval = setInterval(() => {
      setValues(
        Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1)
      );
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 60);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: pos.x,
      startY: pos.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPos({
      x: dragStartRef.current.startX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.startY + (e.clientY - dragStartRef.current.y)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // رسم نقاط النرد
  const renderDiceDots = (val) => {
    return (
      <div
        style={{
          width: '50px',
          height: '50px',
          background: '#ffffff',
          border: '2px solid #212529',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#e03131',
          boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
          transform: isRolling ? 'rotate(15deg) scale(0.95)' : 'none',
          transition: 'transform 0.1s ease'
        }}
      >
        {val}
      </div>
    );
  };

  const sum = values.reduce((a, b) => a + b, 0);

  return (
    <div
      className="floating-widget"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: '210px'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="floating-widget-header">
        <span className="floating-widget-title">🎲 نرد الأرقام</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#868e96', fontSize: '15px' }}
        >
          ✕
        </button>
      </div>

      <div className="floating-widget-body" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '8px 0' }}>
          {values.map((v, i) => (
            <div key={i}>{renderDiceDots(v)}</div>
          ))}
        </div>

        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057', marginBottom: '8px' }}>
          المجموع: <span style={{ color: '#1971c2', fontSize: '16px' }}>{sum}</span> | الضرب: <span style={{ color: '#2b8a3e', fontSize: '16px' }}>{values[0] * (values[1] || 1)}</span>
        </div>

        <button
          onClick={rollDice}
          className="btn-card primary"
          style={{ width: '100%', padding: '6px 0', fontSize: '13.5px', marginBottom: '6px' }}
        >
          🎲 ارمِ النرد
        </button>

        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          <button
            onClick={() => { setDiceCount(1); setValues([Math.floor(Math.random() * 6) + 1]); }}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              background: diceCount === 1 ? '#e7f5ff' : '#fff'
            }}
          >
            نرد واحد
          </button>
          <button
            onClick={() => { setDiceCount(2); setValues([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]); }}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              background: diceCount === 2 ? '#e7f5ff' : '#fff'
            }}
          >
            نردين
          </button>
        </div>
      </div>
    </div>
  );
}
