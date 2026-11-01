import React, { useState } from 'react';

export default function LiveRoomModal({
  isOpen,
  onClose,
  isLive,
  roomId,
  role,
  connectedStudents,
  isBroadcasting,
  onStartTeacherRoom,
  onJoinStudentRoom,
  onToggleBroadcast,
  onCloseRoom
}) {
  const [customRoomId, setCustomRoomId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.origin + window.location.pathname;
  const shareLink = `${currentUrl}?room=${roomId}&role=student`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📡 الغرفة الصفية والبث المباشر</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {isLive ? (
            /* حالة الغرفة النشطة */
            <div>
              <div
                style={{
                  background: '#e7f5ff',
                  border: '1px solid #74c0fc',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontSize: '13px', color: '#1971c2', fontWeight: 'bold' }}>
                  {role === 'teacher' ? '🟢 أنت تبث كمعلم (مقدم الحصة)' : '🟢 متصل بغرفة المعلم كطالب'}
                </div>
                <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '2px', color: '#1864ab', margin: '8px 0' }}>
                  {roomId}
                </div>

                {role === 'teacher' && (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                    <button
                      onClick={copyToClipboard}
                      className="btn-card primary"
                      style={{ padding: '7px 16px', fontSize: '13px' }}
                    >
                      {copied ? '✅ تم نسخ الرابط!' : '🔗 نسخ رابط دعوة الطلاب'}
                    </button>
                  </div>
                )}
              </div>

              {/* خيارات المعلم للبث والطلاب */}
              {role === 'teacher' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8f9fa',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      marginBottom: '16px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#212529' }}>
                        📡 وضع البث الحي التلقائي
                      </div>
                      <div style={{ fontSize: '12px', color: '#868e96' }}>
                        إرسال كل ما ترسمه وتكتبه فوراً إلى شاشات الطلاب
                      </div>
                    </div>
                    <button
                      onClick={onToggleBroadcast}
                      className={`btn-card ${isBroadcasting ? 'primary' : ''}`}
                      style={{ padding: '6px 14px' }}
                    >
                      {isBroadcasting ? 'نشط 🟢' : 'معطل ⚪'}
                    </button>
                  </div>

                  {/* قائمة الطلاب المتصلين */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#343a40', marginBottom: '8px' }}>
                      👥 الطلاب المتصلون حالياً ({connectedStudents.length}):
                    </div>
                    {connectedStudents.length === 0 ? (
                      <div style={{ fontSize: '13px', color: '#868e96', background: '#f8f9fa', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                        في انتظار انضمام الطلاب عبر الرابط أو كود الغرفة...
                      </div>
                    ) : (
                      <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {connectedStudents.map((st, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              background: '#f1f3f5',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '13px'
                            }}
                          >
                            <span style={{ fontWeight: 'bold', color: '#212529' }}>👤 {st.name}</span>
                            <span style={{ color: '#868e96', fontSize: '11px' }}>{st.joinedAt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  onClick={onCloseRoom}
                  className="btn-card"
                  style={{ background: '#ffe3e3', color: '#c92a2a', borderColor: '#ffa8a8' }}
                >
                  🚪 إنهاء الغرفة
                </button>
              </div>
            </div>
          ) : (
            /* حالة إنشاء أو انضمام جديد */
            <div>
              {/* قسم المعلم */}
              <div style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '18px', marginBottom: '18px' }}>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#1971c2', marginBottom: '6px' }}>
                  👨‍🏫 وضع المعلم: إنشاء غرفة صفية جديدة
                </div>
                <p style={{ fontSize: '13px', color: '#495057', marginBottom: '10px' }}>
                  أنشئ غرفة صفية وشارك الكود مع طلابك لبث الشرح واستقبال حلولهم على الفور:
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={customRoomId}
                    onChange={(e) => setCustomRoomId(e.target.value)}
                    placeholder="كود مخصص (اختياري مثلا: MATH101)"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #ced4da',
                      fontFamily: 'var(--font-arabic)',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    onClick={() => onStartTeacherRoom(customRoomId)}
                    className="btn-card primary"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    🚀 بدء الغرفة الصفية
                  </button>
                </div>
              </div>

              {/* قسم الطالب */}
              <div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#2b8a3e', marginBottom: '6px' }}>
                  🎒 وضع الطالب: الانضمام إلى غرفة المعلم
                </div>
                <p style={{ fontSize: '13px', color: '#495057', marginBottom: '10px' }}>
                  أدخل اسمك وكود الغرفة الذي زودك به المعلم لمتابعة الدرس وتسليم حلك:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="اسم الطالب (مثال: أحمد المحمد)"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #ced4da',
                      fontFamily: 'var(--font-arabic)',
                      fontSize: '13px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="كود الغرفة (مثال: EDU-XYZ123)"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #ced4da',
                        fontFamily: 'var(--font-arabic)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!joinCode.trim()) {
                          alert('الرجاء إدخال كود الغرفة');
                          return;
                        }
                        onJoinStudentRoom(joinCode.trim(), studentName.trim() || 'طالب');
                      }}
                      className="btn-card"
                      style={{ background: '#2b8a3e', color: '#fff', borderColor: '#2b8a3e', padding: '8px 18px' }}
                    >
                      🚪 انضمام الآن
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
