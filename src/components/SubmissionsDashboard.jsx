import React, { useState } from 'react';

export default function SubmissionsDashboard({
  isOpen,
  onClose,
  submissions,
  onProjectToBoard,
  onSendFeedback,
  onClearSubmissions
}) {
  const [selectedSub, setSelectedSub] = useState(null);
  const [grade, setGrade] = useState('10/10');
  const [feedback, setFeedback] = useState('أحسنت! إجابة متميزة وخطوات مرتبة ⭐');
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!isOpen) return null;

  const handleSendFeedback = () => {
    if (!selectedSub) return;
    onSendFeedback(selectedSub.studentPeerId, grade, feedback);
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 2000);
  };

  const downloadImage = (sub) => {
    if (!sub.imageBase64) return;
    const link = document.createElement('a');
    link.href = sub.imageBase64;
    link.download = `حل_${sub.studentName}_${sub.taskTitle}.png`;
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '880px', height: '88vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            📥 لوحة استلام وتقييم حلول الطلاب ({submissions.length})
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
          {/* القائمة الجانبية لحلول الطلاب */}
          <div
            style={{
              width: '280px',
              borderLeft: '1px solid #dee2e6',
              paddingLeft: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>قائمة الحلول المستلمة</span>
              {submissions.length > 0 && (
                <button
                  onClick={onClearSubmissions}
                  style={{ background: 'none', border: 'none', color: '#e03131', fontSize: '11.5px', cursor: 'pointer' }}
                >
                  مسح الكل
                </button>
              )}
            </div>

            {submissions.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#868e96', fontSize: '13px', margin: 'auto 0' }}>
                لا توجد حلول مستلمة بعد.<br />ستظهر هنا فور قيام الطلاب بتسليم حلولهم!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {submissions.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #1971c2' : '1px solid #dee2e6',
                        background: isSelected ? '#e7f5ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#212529' }}>
                          👤 {sub.studentName}
                        </span>
                        <span style={{ fontSize: '11px', color: '#868e96' }}>{sub.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#495057' }}>📌 {sub.taskTitle}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* مساحة المعاينة والتقييم للحل المحدد */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {selectedSub ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* ترويسة تفاصيل الحل */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1864ab' }}>
                      حل الطالب: {selectedSub.studentName}
                    </h3>
                    <div style={{ fontSize: '12.5px', color: '#495057' }}>
                      المهمة: {selectedSub.taskTitle} | وقت التسليم: {selectedSub.timestamp}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        onProjectToBoard(selectedSub);
                        onClose();
                      }}
                      className="btn-card primary"
                      style={{ padding: '6px 12px' }}
                      title="عرض هذا الحل على سبورة الفصل ومناقشته مع الطلاب"
                    >
                      🎨 عرض على السبورة
                    </button>
                    <button
                      onClick={() => downloadImage(selectedSub)}
                      className="btn-card"
                      style={{ padding: '6px 10px' }}
                      title="تنزيل الحل كصورة"
                    >
                      💾 تنزيل
                    </button>
                  </div>
                </div>

                {/* معاينة صورة الحل */}
                <div
                  style={{
                    flex: 1,
                    background: '#f8f9fa',
                    border: '1px solid #ced4da',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: '14px',
                    minHeight: '260px'
                  }}
                >
                  {selectedSub.imageBase64 ? (
                    <img
                      src={selectedSub.imageBase64}
                      alt="حل الطالب"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ color: '#868e96' }}>لا تتوفر معاينة صورية</span>
                  )}
                </div>

                {/* ملاحظات الطالب إن وجدت */}
                {selectedSub.notes && (
                  <div style={{ background: '#fff9db', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                    <strong>ملاحظة الطالب:</strong> {selectedSub.notes}
                  </div>
                )}

                {/* صندوق التقييم وإرسال التغذية الراجعة للطالب */}
                <div style={{ background: '#f1f3f5', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13.5px', color: '#212529', marginBottom: '8px' }}>
                    ⭐ إرسال التقييم والدرجة مباشرة إلى شاشة الطالب:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="الدرجة (مثال: 10/10)"
                      style={{
                        width: '100px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #ced4da',
                        fontFamily: 'var(--font-arabic)',
                        fontSize: '13px'
                      }}
                    />
                    <input
                      type="text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="ملاحظات المعلم وتشجيعه..."
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #ced4da',
                        fontFamily: 'var(--font-arabic)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      onClick={handleSendFeedback}
                      className="btn-card"
                      style={{ background: '#2b8a3e', color: '#fff', borderColor: '#2b8a3e', padding: '6px 14px' }}
                    >
                      {feedbackSent ? '✅ تم الإرسال!' : '📨 إرسال'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#868e96' }}>
                اختر حلاً من القائمة الجانبية لمعاينته وتصحيحه وعرضه على السبورة.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
