import React, { useState, useRef } from 'react';

/**
 * منقلة هندسية تفاعلية شفافة لقياس ورسم الزوايا على شاشة السبورة
 */
export default function ProtractorOverlay({ onClose }) {
  const [pos, setPos] = useState({ x: 260, y: 140 });
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
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
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPos({
      x: dragStartRef.current.startX + dx,
      y: dragStartRef.current.startY + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // توليد تدريجات المنقلة
  const ticks = [];
  const cx = 220;
  const cy = 220;
  const radius = 200;

  for (let deg = 0; deg <= 180; deg += 1) {
    const rad = (deg * Math.PI) / 180;
    const isMajor = deg % 10 === 0;
    const isMedium = deg % 5 === 0 && !isMajor;
    const tickLen = isMajor ? 18 : isMedium ? 12 : 7;
    const innerR = radius - tickLen;

    const x1 = cx - radius * Math.cos(rad);
    const y1 = cy - radius * Math.sin(rad);
    const x2 = cx - innerR * Math.cos(rad);
    const y2 = cy - innerR * Math.sin(rad);

    ticks.push(
      <line
        key={`tick-${deg}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#1864ab"
        strokeWidth={isMajor ? 1.8 : 0.9}
      />
    );

    if (isMajor && deg >= 0 && deg <= 180) {
      // أرقام التدريج المزدوج (من اليمين ومن اليسار)
      const numR1 = radius - 30;
      const numR2 = radius - 46;
      const nx1 = cx - numR1 * Math.cos(rad);
      const ny1 = cy - numR1 * Math.sin(rad);
      const nx2 = cx - numR2 * Math.cos(rad);
      const ny2 = cy - numR2 * Math.sin(rad);

      ticks.push(
        <text
          key={`num-outer-${deg}`}
          x={nx1}
          y={ny1 + 4}
          fontSize="10"
          fontWeight="bold"
          fill="#1864ab"
          textAnchor="middle"
        >
          {deg}
        </text>
      );

      if (deg > 0 && deg < 180) {
        ticks.push(
          <text
            key={`num-inner-${deg}`}
            x={nx2}
            y={ny2 + 4}
            fontSize="9"
            fill="#c92a2a"
            textAnchor="middle"
          >
            {180 - deg}
          </text>
        );
      }
    }
  }

  return (
    <div
      className="protractor-box"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${angle}deg)`,
        position: 'absolute',
        top: 0,
        left: 0
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* أدوات التحكم العلوية في المنقلة */}
      <div className="rotate-knob no-drag" style={{ transform: `rotate(${-angle}deg)` }}>
        <span>📐 منقلة الزوايا</span>
        <button
          onClick={() => setAngle((a) => (a + 15) % 360)}
          title="تدوير +15 درجة"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
        >
          🔄 {angle}°
        </button>
        <button
          onClick={() => setAngle(0)}
          title="إعادة ضبط"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
        >
          0°
        </button>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e03131', fontWeight: 'bold' }}
        >
          ✕
        </button>
      </div>

      <svg className="protractor-svg" viewBox="0 0 440 240">
        <defs>
          <radialGradient id="protractorGlass" cx="50%" cy="100%" r="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#d0ebff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a5d8ff" stopOpacity="0.65" />
          </radialGradient>
        </defs>

        {/* جسم المنقلة نصف الدائري */}
        <path
          d="M 20 220 A 200 200 0 0 1 420 220 Z"
          fill="url(#protractorGlass)"
          stroke="#339af0"
          strokeWidth="2.5"
        />

        {/* التجويف الداخلي الصغير */}
        <path
          d="M 160 220 A 60 60 0 0 1 280 220 Z"
          fill="#ffffff"
          fillOpacity="0.3"
          stroke="#74c0fc"
          strokeWidth="1.5"
        />

        {/* التدريجات والأرقام */}
        {ticks}

        {/* نقطة المركز (Origin Crosshair) */}
        <circle cx={cx} cy={cy} r="4" fill="#e03131" />
        <line x1={cx - 15} y1={cy} x2={cx + 15} y2={cy} stroke="#e03131" strokeWidth="2" />
        <line x1={cx} y1={cy - 15} x2={cx} y2={cy} stroke="#e03131" strokeWidth="2" />
      </svg>
    </div>
  );
}
