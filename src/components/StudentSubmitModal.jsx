import React, { useState } from 'react';

export default function StudentSubmitModal({
  isOpen,
  onClose,
  onSubmit,
  currentTaskTitle
}) {
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('educali_student_name') || '';
  });
  const [taskTitle, setTaskTitle] = useState(currentTaskTitle || 'حل مسألة');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      alert('الرجاء إدخال اسمك لتسليم الحل');
      return;
    }

    try {
      setIsSubmitting(true);
      localStorage.setItem('educali_student_name', studentName.trim());
      await onSubmit({
        studentName: studentName.trim(),
        taskTitle: taskTitle.trim(),
        notes: notes.trim()
      });
      setIsSubmitting(false);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
      alert(e.message || 'حدث خطأ أثناء تسليم الحل');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📤 تسليم الحل إلى المعلم</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: '#495057', marginBottom: '14px' }}>
            سيتم التقاط صورة من حلك على السبورة وإرسالها مباشرة إلى لوحة تحكم المعلم:
          </p>

          <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
            اسم الطالب:
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="مثال: أحمد المحمد"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ced4da',
              fontFamily: 'var(--font-arabic)',
              fontSize: '13.5px',
              marginBottom: '12px'
            }}
          />

          <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
            عنوان التمرين / المسألة:
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="مثال: تمرين المستوى الإحداثي ص ٤٢"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ced4da',
              fontFamily: 'var(--font-arabic)',
              fontSize: '13.5px',
              marginBottom: '12px'
            }}
          />

          <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
            ملاحظة إضافية للمعلم (اختياري):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="مثال: قمت بحل السؤال الأول والتحقق بالرسم..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ced4da',
              fontFamily: 'var(--font-arabic)',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-card" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </button>
            <button
              className="btn-card primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ padding: '8px 20px', background: '#2b8a3e', borderColor: '#2b8a3e' }}
            >
              {isSubmitting ? 'جاري الإرسال...' : '🚀 تسليم الحل الآن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
