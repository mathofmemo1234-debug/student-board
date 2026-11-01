import React, { useState } from 'react';

export default function ScreensBar({
  screens,
  activeScreenId,
  onSelectScreen,
  onAddScreen,
  onDuplicateScreen,
  onDeleteScreen,
  onRenameScreen
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (screen, e) => {
    e.stopPropagation();
    setEditingId(screen.id);
    setEditingTitle(screen.title);
  };

  const handleSaveRename = (screenId) => {
    if (editingTitle.trim()) {
      onRenameScreen(screenId, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="screens-bar">
      <div className="screens-tabs">
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1971c2', marginLeft: '6px' }}>
          📑 شاشات الدرس والطلاب:
        </span>

        {screens.map((screen, idx) => {
          const isActive = screen.id === activeScreenId;
          const isEditing = editingId === screen.id;

          return (
            <div
              key={screen.id}
              className={`screen-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectScreen(screen.id)}
            >
              <span style={{ opacity: 0.7 }}>#{idx + 1}</span>

              {isEditing ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleSaveRename(screen.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(screen.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  autoFocus
                  style={{
                    border: '1px solid #339af0',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-arabic)',
                    width: '120px'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span onDoubleClick={(e) => handleStartRename(screen, e)} title="انقر مرتين لتعديل الاسم">
                  {screen.title}
                </span>
              )}

              {/* أزرار العمليات للشاشة النشطة */}
              {isActive && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginRight: '4px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateScreen(screen.id);
                    }}
                    title="تكرار هذه الشاشة"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                  >
                    📋
                  </button>
                  <button
                    onClick={(e) => handleStartRename(screen, e)}
                    title="تعديل اسم الشاشة"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ✏️
                  </button>
                </div>
              )}

              {/* زر الحذف */}
              {screens.length > 1 && (
                <span
                  className="screen-tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`هل أنت متأكد من حذف ${screen.title}؟`)) {
                      onDeleteScreen(screen.id);
                    }
                  }}
                  title="حذف هذه الشاشة"
                >
                  ✕
                </span>
              )}
            </div>
          );
        })}

        <button className="btn-add-screen" onClick={onAddScreen} title="إضافة شاشة جديدة فارغة">
          ➕ شاشة جديدة
        </button>
      </div>

      <div className="screens-meta">
        <span>إجمالي الشاشات: {screens.length}</span>
      </div>
    </div>
  );
}
