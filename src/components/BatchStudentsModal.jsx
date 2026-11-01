import React, { useState } from 'react';
import { TEMPLATES_CATALOG } from '../templates';

export default function BatchStudentsModal({ isOpen, onClose, onGenerateScreens }) {
  const [namesText, setNamesText] = useState("أحمد\nفيصل\nخالد\nمحمد\nعبدالله");
  const [selectedTemplateId, setSelectedTemplateId] = useState('challenge');

  if (!isOpen) return null;

  const handleGenerate = () => {
    const rawNames = namesText
      .split(/[\n,،]/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (rawNames.length === 0) {
      alert("الرجاء إدخال اسم طالب واحد على الأقل");
      return;
    }

    const template = TEMPLATES_CATALOG.find((t) => t.id === selectedTemplateId) || TEMPLATES_CATALOG[0];
    onGenerateScreens(rawNames, template);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">👥 توليد شاشات مخصصة للطلاب دفعة واحدة</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13.5px', color: '#495057', marginBottom: '14px', lineHeight: '1.5' }}>
            أدخل أسماء طلابك (كل اسم في سطر جديد)، وسيقوم النظام بإنشاء شاشة سبورة مستقلة لكل طالب تحمل اسمه والقالب التعليمي المختار:
          </p>

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#212529', display: 'block', marginBottom: '6px' }}>
            قائمة أسماء الطلاب:
          </label>
          <textarea
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            rows={5}
            placeholder="أحمد&#10;محمد&#10;سعد..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              fontFamily: 'var(--font-arabic)',
              fontSize: '14px',
              marginBottom: '16px'
            }}
          />

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#212529', display: 'block', marginBottom: '6px' }}>
            اختر القالب المخصص لشاشات الطلاب:
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              fontFamily: 'var(--font-arabic)',
              fontSize: '14px',
              marginBottom: '20px'
            }}
          >
            {TEMPLATES_CATALOG.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.title}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn-card" onClick={onClose}>
              إلغاء
            </button>
            <button className="btn-card primary" onClick={handleGenerate} style={{ padding: '8px 20px' }}>
              ✨ توليد الشاشات الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
