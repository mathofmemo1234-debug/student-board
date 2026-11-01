import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Excalidraw, exportToBlob, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

import {
  getCartesianGridTemplate,
  getNumberLineTemplate,
  TEMPLATES_CATALOG,
  makeId
} from './templates';

import ProtractorOverlay from './components/ProtractorOverlay';
import ClassroomTimer from './components/ClassroomTimer';
import DiceRoller from './components/DiceRoller';
import TemplatesModal from './components/TemplatesModal';
import BatchStudentsModal from './components/BatchStudentsModal';
import ScreensBar from './components/ScreensBar';

const LOCAL_STORAGE_KEY = 'educalidraw_project_v1';

export default function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isProtractorOpen, setIsProtractorOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isDiceOpen, setIsDiceOpen] = useState(false);

  // حالة الشاشات المتعددة
  const [screens, setScreens] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.screens && parsed.screens.length > 0) {
          return parsed.screens;
        }
      }
    } catch (e) {
      console.warn('Could not restore from localStorage', e);
    }

    // الشاشات الافتراضية للدرس
    return [
      {
        id: 'screen_1',
        title: 'شاشة ١: المستوى الإحداثي',
        elements: getCartesianGridTemplate(80, 60),
        appState: {
          viewBackgroundColor: '#ffffff',
          currentItemFontFamily: 1
        }
      },
      {
        id: 'screen_2',
        title: 'شاشة ٢: خط الأعداد',
        elements: getNumberLineTemplate(80, 100),
        appState: {
          viewBackgroundColor: '#ffffff',
          currentItemFontFamily: 1
        }
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

  // حفظ حالة الشاشة الحالية في الذاكرة
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

  // حفظ المشروع تلقائياً في LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          activeScreenId,
          screens
        })
      );
    } catch (e) {}
  }, [screens, activeScreenId]);

  // تحميل الشاشة عند تغيير activeScreenId أو عند تجهيز API
  const activeScreen = screens.find((s) => s.id === activeScreenId) || screens[0];
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!excalidrawAPI || !activeScreen) return;

    excalidrawAPI.updateScene({
      elements: activeScreen.elements || [],
      appState: {
        ...(activeScreen.appState || {}),
        collaborators: new Map()
      }
    });

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      setTimeout(() => {
        excalidrawAPI.scrollToContent(activeScreen.elements, { fitToViewport: true });
      }, 200);
    }
  }, [excalidrawAPI, activeScreenId]);

  // التبديل إلى شاشة أخرى
  const handleSelectScreen = (screenId) => {
    if (screenId === activeScreenId) return;

    // حفظ محتويات الشاشة الحالية أولاً
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

  // إضافة شاشة جديدة فارغة
  const handleAddScreen = () => {
    saveCurrentScreenToState();
    const newId = makeId('screen');
    const newScreen = {
      id: newId,
      title: `شاشة ${screens.length + 1}`,
      elements: [],
      appState: {
        viewBackgroundColor: '#ffffff'
      }
    };
    setScreens((prev) => [...prev, newScreen]);
    setActiveScreenId(newId);
  };

  // تكرار الشاشة الحالية
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

  // حذف شاشة
  const handleDeleteScreen = (screenId) => {
    if (screens.length <= 1) return;
    const filtered = screens.filter((s) => s.id !== screenId);
    setScreens(filtered);
    if (activeScreenId === screenId) {
      setActiveScreenId(filtered[0].id);
    }
  };

  // تعديل اسم الشاشة
  const handleRenameScreen = (screenId, newTitle) => {
    setScreens((prev) =>
      prev.map((s) => (s.id === screenId ? { ...s, title: newTitle } : s))
    );
  };

  // إدراج قالب في الشاشة الحالية
  const handleInsertTemplate = (template) => {
    if (!excalidrawAPI) return;
    const currentElements = excalidrawAPI.getSceneElements();
    const templateElements = template.generator();

    excalidrawAPI.updateScene({
      elements: [...currentElements, ...templateElements]
    });

    excalidrawAPI.scrollToContent(templateElements, { fitToViewport: true });
  };

  // إنشاء شاشة جديدة بقالب محدد
  const handleCreateNewScreenWithTemplate = (template) => {
    saveCurrentScreenToState();
    const newId = makeId('screen');
    const templateElements = template.generator();

    const newScreen = {
      id: newId,
      title: `${template.title}`,
      elements: templateElements,
      appState: {
        viewBackgroundColor: '#ffffff'
      }
    };

    setScreens((prev) => [...prev, newScreen]);
    setActiveScreenId(newId);
  };

  // توليد شاشات مخصصة لعدة طلاب بالأسماء
  const handleGenerateScreens = (studentNames, template) => {
    saveCurrentScreenToState();
    const newScreens = studentNames.map((name, idx) => {
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

  // تصدير الشاشة الحالية كصورة PNG عالية الدقة
  const handleExportPNG = async () => {
    if (!excalidrawAPI) return;
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const blob = await exportToBlob({
        elements,
        appState: {
          ...appState,
          exportWithDarkMode: false,
          exportBackground: true
        },
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
      console.error('Export failed', e);
      alert('حدث خطأ أثناء التصدير');
    }
  };

  // تصدير المشروع بالكامل كملف JSON (.educali)
  const handleExportProjectJSON = () => {
    const updatedScreens = saveCurrentScreenToState();
    const projectData = {
      version: 1,
      name: 'EduCalidraw_Project',
      createdAt: new Date().toISOString(),
      activeScreenId,
      screens: updatedScreens
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سبورة_الطلاب_${new Date().toLocaleDateString('ar-SA')}.educali`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // استيراد ملف مشروع
  const fileInputRef = useRef(null);
  const handleImportProjectJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.screens && Array.isArray(parsed.screens)) {
          setScreens(parsed.screens);
          if (parsed.activeScreenId) {
            setActiveScreenId(parsed.activeScreenId);
          } else {
            setActiveScreenId(parsed.screens[0].id);
          }
          alert(`تم استيراد ${parsed.screens.length} شاشة بنجاح!`);
        } else {
          alert('ملف غير صالح');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* الشريط العلوي للسبورة التعليمية */}
      <header className="edu-header">
        <div className="brand-section">
          <span className="brand-logo">🎨</span>
          <div>
            <span className="brand-title">سبورة إكسكاليدرو للطلاب</span>
            <span className="brand-badge">Edu Edition</span>
          </div>
        </div>

        <div className="actions-section">
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

          {/* التصدير والحفظ */}
          <button
            className="btn-header primary"
            onClick={handleExportPNG}
            title="حفظ الشاشة الحالية كصورة PNG عالية الدقة"
          >
            <span>💾</span>
            <span>حفظ كصورة</span>
          </button>

          <button
            className="btn-header"
            onClick={handleExportProjectJSON}
            title="حفظ مشروع السبورة كملف (.educali)"
          >
            <span>📦</span>
            <span>حفظ المشروع</span>
          </button>

          <button
            className="btn-header"
            onClick={() => fileInputRef.current?.click()}
            title="فتح مشروع سابق"
          >
            <span>📂</span>
            <span>فتح مشروع</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".educali,.json"
            style={{ display: 'none' }}
            onChange={handleImportProjectJSON}
          />
        </div>
      </header>

      {/* مساحة الكانفاس التفاعلية (Excalidraw الرسمي) */}
      <div className="canvas-wrapper">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{
            elements: activeScreen?.elements || [],
            appState: activeScreen?.appState || { viewBackgroundColor: '#ffffff' }
          }}
          langCode="ar-SA"
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: true,
              clearCanvas: true,
              export: {
                saveFileToDisk: true
              },
              loadScene: true,
              saveToActiveFile: false,
              theme: true
            }
          }}
        >
          {/* القائمة الرئيسية المدمجة */}
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

        {/* الأدوات العائمة (منقلة، مؤقت، نرد) */}
        {isProtractorOpen && (
          <ProtractorOverlay onClose={() => setIsProtractorOpen(false)} />
        )}
        {isTimerOpen && (
          <ClassroomTimer onClose={() => setIsTimerOpen(false)} />
        )}
        {isDiceOpen && (
          <DiceRoller onClose={() => setIsDiceOpen(false)} />
        )}
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
    </div>
  );
}
