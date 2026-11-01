import React, { useState } from 'react';
import { TEMPLATES_CATALOG } from '../templates';

export default function TemplatesModal({ isOpen, onClose, onInsertTemplate, onCreateNewScreenWithTemplate }) {
  const [selectedCat, setSelectedCat] = useState('الكل');

  if (!isOpen) return null;

  const categories = ['الكل', 'رياضيات', 'أنشطة واستراتيجيات'];
  const filteredTemplates = selectedCat === 'الكل'
    ? TEMPLATES_CATALOG
    : TEMPLATES_CATALOG.filter((t) => t.category === selectedCat);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🎓 مكتبة شاشات وقوالب الطلاب الجاهزة</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* تصنيفات القوالب */}
          <div className="templates-categories">
            {categories.map((cat) => (
              <div
                key={cat}
                className={`cat-chip ${selectedCat === cat ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* شبكة القوالب */}
          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="template-card">
                <div>
                  <div className="template-card-icon">{template.icon}</div>
                  <div className="template-card-title">{template.title}</div>
                  <div className="template-card-sub">{template.subtitle}</div>
                </div>

                <div className="template-card-actions">
                  <button
                    className="btn-card"
                    onClick={() => {
                      onInsertTemplate(template);
                      onClose();
                    }}
                    title="إدراج في مساحة الشاشة الحالية"
                  >
                    ➕ في الشاشة الحالية
                  </button>
                  <button
                    className="btn-card primary"
                    onClick={() => {
                      onCreateNewScreenWithTemplate(template);
                      onClose();
                    }}
                    title="إنشاء شاشة جديدة مستقلة بهذا القالب"
                  >
                    📄 شاشة جديدة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
