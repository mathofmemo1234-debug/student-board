import React, { useState, useEffect, useRef } from 'react';

/**
 * مؤقت الحصة التنازلي للأنشطة والمسابقات الصفية
 */
export default function ClassroomTimer({ onClose }) {
  const [initialSeconds, setInitialSeconds] = useState(180); // 3 دقائق افتراضياً
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      // تنبيه صوتي بسيط عبر Web Audio API
      playAlarmSound();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      // Audio might be blocked if user hasn't interacted
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
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

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setPreset = (s) => {
    setIsRunning(false);
    setInitialSeconds(s);
    setSecondsLeft(s);
  };

  return (
    <div
      className="floating-widget"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: '240px'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="floating-widget-header">
        <span className="floating-widget-title">⏱️ مؤقت الحصة</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#868e96', fontSize: '15px' }}
        >
          ✕
        </button>
      </div>

      <div className="floating-widget-body" style={{ textAlign: 'center' }}>
        {/* شاشة الوقت */}
        <div
          style={{
            fontSize: '38px',
            fontWeight: '900',
            fontFamily: 'monospace',
            color: secondsLeft <= 30 && isRunning ? '#e03131' : '#212529',
            margin: '6px 0',
            direction: 'ltr'
          }}
        >
          {formatTime(secondsLeft)}
        </div>

        {/* أزرار التشغيل والتصفير */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`btn-card ${isRunning ? 'accent' : 'primary'}`}
            style={{ padding: '6px 16px', fontSize: '14px' }}
          >
            {isRunning ? '⏸️ إيقاف' : '▶️ ابدأ'}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(initialSeconds);
            }}
            className="btn-card"
            style={{ padding: '6px 12px' }}
          >
            🔄 إعادة
          </button>
        </div>

        {/* فترات جاهزة */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: '١ د', sec: 60 },
            { label: '٢ د', sec: 120 },
            { label: '٣ د', sec: 180 },
            { label: '٥ د', sec: 300 }
          ].map((item) => (
            <button
              key={item.sec}
              onClick={() => setPreset(item.sec)}
              style={{
                padding: '3px 8px',
                fontSize: '11.5px',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                background: initialSeconds === item.sec ? '#e7f5ff' : '#ffffff',
                color: initialSeconds === item.sec ? '#1971c2' : '#495057',
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
