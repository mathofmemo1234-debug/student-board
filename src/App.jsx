import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Excalidraw, exportToBlob, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

import {
  getCartesianGridTemplate,
  getNumberLineTemplate,
  TEMPLATES_CATALOG,
  makeId
} from './templates';

import { classroomService } from './services/classroomService';

import ProtractorOverlay from './components/ProtractorOverlay';
import ClassroomTimer from './components/ClassroomTimer';
import DiceRoller from './components/DiceRoller';
import TemplatesModal from './components/TemplatesModal';
import BatchStudentsModal from './components/BatchStudentsModal';
import ScreensBar from './components/ScreensBar';
import LiveRoomModal from './components/LiveRoomModal';
import SubmissionsDashboard from './components/SubmissionsDashboard';
import StudentSubmitModal from './components/StudentSubmitModal';

const LOCAL_STORAGE_KEY = 'educalidraw_project_v1';

export default function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  // حالة النوافذ المنبثقة والأدوات
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isProtractorOpen, setIsProtractorOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isDiceOpen, setIsDiceOpen] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // حالة الغرفة الصفية والبث المباشر
  const [isLive, setIsLive] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [roomRole, setRoomRole] = useState('none'); // 'teacher' | 'student' | 'none'
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [teacherNotification, setTeacherNotification] = useState('');

  // الشاشات المتعددة
  const [screens, setScreens] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.screens && parsed.screens.length > 0) {
          return parsed.screens;
        }
      }
    } catch (e) {}

    return [
      {
        id: 'screen_1',
        title: 'شاشة ١: المستوى الإحداثي',
        elements: getCartesianGridTemplate(80, 60),
        appState: { viewBackgroundColor: '#ffffff', currentItemFontFamily: 1 }
      },
      {
        id: 'screen_2',
        title: 'شاشة ٢: خط الأعداد',
        elements: getNumberLineTemplate(80, 100),
        appState: { viewBackgroundColor: '#ffffff', currentItemFontFamily: 1 }
      }
    ];
  });

  const [activeScreenId, setActiveScreenId] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeScreenId) return parsed.activeScreenId;
      }
    } catch (e) {}
    return 'screen_1';
  });

  // حفظ حالة الشاشة الحالية
  const saveCurrentScreenToState = useCallback(() => {
    if (!excalidrawAPI) return screens;
    const currentElements = excalidrawAPI.getSceneElements();
    const currentAppState = excalidrawAPI.getAppState();

    const updated = screens.map((s) => {
      if (s.id === activeScreenId) {
        return {
          ...s,
          elements: currentElements,
          appState: {
            viewBackgroundColor: currentAppState.viewBackgroundColor || '#ffffff',
            zoom: currentAppState.zoom,
            scrollX: currentAppState.scrollX,
            scrollY: currentAppState.scrollY
          }
        };
      }
      return s;
    });

    setScreens(updated);
    return updated;
  }, [excalidrawAPI, screens, activeScreenId]);

  // حفظ في LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ activeScreenId, screens })
      );
    } catch (e) {}
  }, [screens, activeScreenId]);

  // تحميل الشاشة
  const activeScreen = screens.find((s) => s.id === activeScreenId) || screens[0];
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!excalidrawAPI || !activeScreen) return;

    excalidrawAPI.updateScene({
      elements: activeScreen.elements || [],
      appState: { ...(activeScreen.appState || {}), collaborators: new Map() }
    });

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      setTimeout(() => {
        excalidrawAPI.scrollToContent(activeScreen.elements, { fitToViewport: true });
      }, 200);
    }
  }, [excalidrawAPI, activeScreenId]);

  // ==========================================
  // إعداد مستمعي الغرفة الصفية والبث المباشر
  // ==========================================
  useEffect(() => {
    classroomService.on('onStudentJoined', (data) => {
      setConnectedStudents(data.studentsList || []);
      setTeacherNotification(`👋 انضم الطالب: ${data.name}`);
      setTimeout(() => setTeacherNotification(''), 4000);
    });

    classroomService.on('onStudentLeft', (data) => {
      setConnectedStudents(data.studentsList || []);
    });

    classroomService.on('onSolutionReceived', (solution) => {
      setSubmissions((prev) => [solution, ...prev]);
      setTeacherNotification(`🔔 حل جديد مستلم من الطالب: ${solution.studentName}`);
      setTimeout(() => setTeacherNotification(''), 5000);
    });

    classroomService.on('onSceneUpdated', (data) => {
      // الطالب يستقبل تحديث البث من المعلم
      if (excalidrawAPI && data.elements) {
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: data.appState || {}
        });
      }
    });

    classroomService.on('onFeedbackReceived', (data) => {
      alert(`⭐ تقييم المعلم لحلك:\nالدرجة: ${data.grade}\nالملاحظة: ${data.feedback}`);
    });

    classroomService.on('onStatusChanged', (status) => {
      if (status.status === 'ready' || status.status === 'connected') {
        setIsLive(true);
        setRoomId(status.roomId);
        setRoomRole(status.role);
      } else if (status.status === 'disconnected') {
        setIsLive(false);
        setRoomRole('none');
      }
    });

    // قراءة معاملات الرابط عند الفتح (إذا فتح الطالب رابط الدعوة)
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setIsLiveModalOpen(true);
    }
  }, [excalidrawAPI]);

  // بث تحديثات اللوحة إذا كان البث مفعلاً
  const handleCanvasChange = (elements, appState) => {
    if (isLive && roomRole === 'teacher' && isBroadcasting) {
      classroomService.broadcastScene(elements, appState);
    }
  };

  // بدء الغرفة كمعلم
  const handleStartTeacherRoom = async (customId) => {
    try {
      const id = await classroomService.startTeacherRoom(customId);
      setRoomId(id);
      setIsLive(true);
      setRoomRole('teacher');
      setIsBroadcasting(true);
    } catch (e) {
      alert('تعذر إنشاء الغرفة: ' + e.message);
    }
  };

  // الانضمام كطالب
  const handleJoinStudentRoom = async (targetRoomId, sName) => {
    try {
      await classroomService.joinRoomAsStudent(targetRoomId, sName);
      setRoomId(targetRoomId);
      setIsLive(true);
      setRoomRole('student');
      setIsLiveModalOpen(false);
      alert(`مرحباً ${sName}! تم الانضمام إلى غرفة المعلم بنجاح.`);
    } catch (e) {
      alert('تعذر الانضمام للغرفة. تأكد من كود الغرفة وأن المعلم متصل.');
    }
  };

  // إغلاق الغرفة
  const handleCloseRoom = () => {
    classroomService.close();
    setIsLive(false);
    setRoomId('');
    setRoomRole('none');
    setConnectedStudents([]);
    setIsBroadcasting(false);
  };

  // قيام الطالب بتسليم حله للمعلم
  const handleStudentSubmitSolution = async ({ studentName, taskTitle, notes }) => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();

    // التقاط صورة عالية الدقة للسبورة
    const blob = await exportToBlob({
      elements,
      appState: { ...appState, exportWithDarkMode: false, exportBackground: true },
      files: excalidrawAPI.getFiles(),
      mimeType: 'image/png'
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      classroomService.submitSolution({
        studentName,
        taskTitle,
        elements,
        imageBase64: base64data,
        notes
      });
    };
    reader.readAsDataURL(blob);
  };

  // عرض حل الطالب على السبورة الرئيسية
  const handleProjectSolutionToBoard = (solution) => {
    saveCurrentScreenToState();
    const newId = makeId('screen_proj');
    const newScreen = {
      id: newId,
      title: `حل الطالب: ${solution.studentName}`,
      elements: solution.elements || [],
      appState: { viewBackgroundColor: '#ffffff' }
    };
    setScreens((prev) => [...prev, newScreen]);
    setActiveScreenId(newId);
  };

  // ==========================================
  // دوال الشاشات
  // ==========================================
  const handleSelectScreen = (screenId) => {
    if (screenId === activeScreenId) return;

    if (excalidrawAPI) {
      const currentElements = excalidrawAPI.getSceneElements();
      const currentAppState = excalidrawAPI.getAppState();

      setScreens((prev) =>
        prev.map((s) =>
          s.id === activeScreenId
            ? {
                ...s,
                elements: currentElements,
                appState: {
                  viewBackgroundColor: currentAppState.viewBackgroundColor || '#ffffff',
                  zoom: currentAppState.zoom,
                  scrollX: currentAppState.scrollX,
                  scrollY: currentAppState.scrollY
                }
              }
            : s
        )
      );
    }

    setActiveScreenId(screenId);
    const target = screens.find((s) => s.id === screenId);
    if (target && excalidrawAPI) {
      excalidrawAPI.updateScene({
        elements: target.elements || [],
        appState: { ...(target.appState || {}), collaborators: new Map() }
      });
      setTimeout(() => {
        excalidrawAPI.scrollToContent(target.elements, { fitToViewport: true });
      }, 50);
    }
  };

  const handleAddScreen = () => {
    saveCurrentScreenToState();
    const newId = makeId('screen');
    const newScreen = {
      id: newId,
      title: `شاشة ${screens.length + 1}`,
      elements: [],
      appState: { viewBackgroundColor: '#ffffff' }
    };
    setScreens((prev) => [...prev, newScreen]);
    setActiveScreenId(newId);
  };

  const handleDuplicateScreen = (screenId) => {
    saveCurrentScreenToState();
    const source = screens.find((s) => s.id === screenId);
    if (!source) return;

    const newId = makeId('screen');
    const clonedElements = JSON.parse(JSON.stringify(source.elements || []));
    const newScreen = {
      id: newId,
      title: `${source.title} (نسخة)`,
      elements: clonedElements,
      appState: { ...(source.appState || {}) }
    };
    setScreens((prev) => [...prev, newScreen]);
    setActiveScreenId(newId);
  };

  const handleDeleteScreen = (screenId) => {
    if (screens.length <= 1) return;
    const filtered = screens.filter((s) => s.id !== screenId);
    setScreens(filtered);
    if (activeScreenId === screenId) {
      setActiveScreenId(filtered[0].id);
    }
  };

  const handleRenameScreen = (screenId, newTitle) => {
    setScreens((prev) =>
      prev.map((s) => (s.id === screenId ? { ...s, title: newTitle } : s))
    );
  };

  const handleInsertTemplate = (template) => {
    if (!excalidrawAPI) return;
    const currentElements = excalidrawAPI.getSceneElements();
    const templateElements = template.generator();
    excalidrawAPI.updateScene({ elements: [...currentElements, ...templateElements] });
    excalidrawAPI.scrollToContent(templateElements, { fitToViewport: true });
  };

  const handleCreateNewScreenWithTemplate = (template) => {
    saveCurrentScreenToState();
    const newId = makeId('screen');
    const templateElements = template.generator();
    const newScreen = {
      id: newId,
      title: `${template.title}`,
      elements: templateElements,
      appState: { viewBackgroundColor: '#ffffff' }
    };
    setScreens((prev) => [...prev, newScreen]);
    setActiveScreenId(newId);
  };

  const handleGenerateScreens = (studentNames, template) => {
    saveCurrentScreenToState();
    const newScreens = studentNames.map((name) => {
      const newId = makeId('screen_student');
      const elements = template.generator(name);
      return {
        id: newId,
        title: `طالب: ${name}`,
        elements,
        appState: { viewBackgroundColor: '#ffffff' }
      };
    });
    setScreens((prev) => [...prev, ...newScreens]);
    if (newScreens.length > 0) {
      setActiveScreenId(newScreens[0].id);
    }
  };

  const handleExportPNG = async () => {
    if (!excalidrawAPI) return;
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const blob = await exportToBlob({
        elements,
        appState: { ...appState, exportWithDarkMode: false, exportBackground: true },
        files: excalidrawAPI.getFiles(),
        mimeType: 'image/png'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeScreen.title || 'whiteboard'}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('حدث خطأ أثناء التصدير');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* تنبيه الإشعارات اللحظية للمعلم */}
      {teacherNotification && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2b8a3e',
            color: '#ffffff',
            padding: '8px 24px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {teacherNotification}
        </div>
      )}

      {/* الشريط العلوي */}
      <header className="edu-header">
        <div className="brand-section">
          <span className="brand-logo">🎨</span>
          <div>
            <span className="brand-title">سبورة إكسكاليدرو للطلاب</span>
            <span className="brand-badge">Edu Edition</span>
          </div>
        </div>

        <div className="actions-section">
          {/* زر الغرفة الصفية والبث المباشر */}
          <button
            className={`btn-header ${isLive ? 'active' : 'primary'}`}
            onClick={() => setIsLiveModalOpen(true)}
            title="إنشاء غرفة بث مباشر أو الانضمام إليها"
          >
            <span>📡</span>
            <span>{isLive ? `غرفة: ${roomId}` : 'الغرفة الصفية والبث'}</span>
          </button>

          {/* زر لوحة استلام حلول الطلاب (للمعلم) */}
          <button
            className="btn-header"
            onClick={() => setIsSubmissionsOpen(true)}
            style={{
              background: submissions.length > 0 ? '#fff3bf' : '#ffffff',
              borderColor: submissions.length > 0 ? '#fcc419' : '#ced4da',
              color: submissions.length > 0 ? '#d9480f' : '#343a40'
            }}
            title="عرض الحلول التي سلمها الطلاب للمعلم"
          >
            <span>📥</span>
            <span>حلول الطلاب ({submissions.length})</span>
          </button>

          {/* زر تسليم الحل (للطالب) */}
          <button
            className="btn-header"
            onClick={() => {
              if (!isLive) {
                alert('يجب أولاً الانضمام إلى غرفة المعلم عبر زر "الغرفة الصفية" لتسليم الحل');
                setIsLiveModalOpen(true);
                return;
              }
              setIsSubmitModalOpen(true);
            }}
            style={{ background: '#ebfbee', borderColor: '#51cf66', color: '#2b8a3e' }}
            title="تسليم حلك على السبورة إلى المعلم"
          >
            <span>📤</span>
            <span>تسليم حلي للمعلم</span>
          </button>

          {/* زر شاشات وقوالب الطلاب */}
          <button
            className="btn-header accent"
            onClick={() => setIsTemplatesOpen(true)}
            title="استعراض شاشات وقوالب الرياضيات والأنشطة الجاهزة"
          >
            <span>🎓</span>
            <span>شاشات وقوالب الطلاب</span>
          </button>

          {/* زر توليد شاشات للطلاب بالأسماء */}
          <button
            className="btn-header"
            onClick={() => setIsBatchModalOpen(true)}
            title="توليد شاشة لكل طالب في الفصل تلقائياً"
          >
            <span>👥</span>
            <span>توليد شاشات للطلاب</span>
          </button>

          {/* أدوات تعليمية مساعدة */}
          <button
            className={`btn-header ${isProtractorOpen ? 'active' : ''}`}
            onClick={() => setIsProtractorOpen(!isProtractorOpen)}
            title="منقلة قياس الزوايا الشفافة"
          >
            <span>📐</span>
            <span>المنقلة</span>
          </button>

          <button
            className={`btn-header ${isTimerOpen ? 'active' : ''}`}
            onClick={() => setIsTimerOpen(!isTimerOpen)}
            title="مؤقت الحصة التنازلي"
          >
            <span>⏱️</span>
            <span>المؤقت</span>
          </button>

          <button
            className={`btn-header ${isDiceOpen ? 'active' : ''}`}
            onClick={() => setIsDiceOpen(!isDiceOpen)}
            title="نرد الأرقام العشوائية"
          >
            <span>🎲</span>
            <span>النرد</span>
          </button>

          {/* التصدير */}
          <button
            className="btn-header"
            onClick={handleExportPNG}
            title="حفظ الشاشة الحالية كصورة PNG عالية الدقة"
          >
            <span>💾</span>
            <span>حفظ كصورة</span>
          </button>
        </div>
      </header>

      {/* مساحة الكانفاس (Excalidraw الرسمي) */}
      <div className="canvas-wrapper">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleCanvasChange}
          initialData={{
            elements: activeScreen?.elements || [],
            appState: activeScreen?.appState || { viewBackgroundColor: '#ffffff' }
          }}
          langCode="ar-SA"
        >
          <MainMenu>
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.Help />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.ToolbarHint />
          </WelcomeScreen>
        </Excalidraw>

        {isProtractorOpen && <ProtractorOverlay onClose={() => setIsProtractorOpen(false)} />}
        {isTimerOpen && <ClassroomTimer onClose={() => setIsTimerOpen(false)} />}
        {isDiceOpen && <DiceRoller onClose={() => setIsDiceOpen(false)} />}
      </div>

      {/* شريط إدارة الشاشات والشرائح السفلية للطلاب */}
      <ScreensBar
        screens={screens}
        activeScreenId={activeScreenId}
        onSelectScreen={handleSelectScreen}
        onAddScreen={handleAddScreen}
        onDuplicateScreen={handleDuplicateScreen}
        onDeleteScreen={handleDeleteScreen}
        onRenameScreen={handleRenameScreen}
      />

      {/* النوافذ المنبثقة */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onInsertTemplate={handleInsertTemplate}
        onCreateNewScreenWithTemplate={handleCreateNewScreenWithTemplate}
      />

      <BatchStudentsModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onGenerateScreens={handleGenerateScreens}
      />

      <LiveRoomModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        isLive={isLive}
        roomId={roomId}
        role={roomRole}
        connectedStudents={connectedStudents}
        isBroadcasting={isBroadcasting}
        onStartTeacherRoom={handleStartTeacherRoom}
        onJoinStudentRoom={handleJoinStudentRoom}
        onToggleBroadcast={() => setIsBroadcasting(!isBroadcasting)}
        onCloseRoom={handleCloseRoom}
      />

      <SubmissionsDashboard
        isOpen={isSubmissionsOpen}
        onClose={() => setIsSubmissionsOpen(false)}
        submissions={submissions}
        onProjectToBoard={handleProjectSolutionToBoard}
        onSendFeedback={(stId, g, f) => classroomService.sendFeedbackToStudent(stId, g, f)}
        onClearSubmissions={() => setSubmissions([])}
      />

      <StudentSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleStudentSubmitSolution}
        currentTaskTitle={activeScreen.title}
      />
    </div>
  );
}
