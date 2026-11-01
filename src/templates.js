/**
 * EduCalidraw Student Ready-Made Screens & Templates Generator
 * مولد الشاشات والقوالب التعليمية الجاهزة للطلاب
 */

let idCounter = 1;
export function makeId(prefix = 'elem') {
  return `${prefix}_${Date.now()}_${idCounter++}_${Math.random().toString(36).substring(2, 6)}`;
}

export function createRect({
  x, y, width, height,
  strokeColor = '#1e1e1e',
  backgroundColor = 'transparent',
  fillStyle = 'hachure',
  strokeWidth = 2,
  strokeStyle = 'solid',
  roughness = 1,
  opacity = 100,
  roundness = { type: 3 },
  groupIds = [],
  locked = false
}) {
  return {
    id: makeId('rect'),
    type: 'rectangle',
    x, y, width, height,
    angle: 0,
    strokeColor,
    backgroundColor,
    fillStyle,
    strokeWidth,
    strokeStyle,
    roughness,
    opacity,
    groupIds,
    frameId: null,
    roundness,
    seed: Math.floor(Math.random() * 2000000),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked
  };
}

export function createText({
  x, y, text,
  fontSize = 20,
  fontFamily = 1,
  textAlign = 'right',
  verticalAlign = 'top',
  strokeColor = '#1e1e1e',
  backgroundColor = 'transparent',
  opacity = 100,
  groupIds = [],
  locked = false
}) {
  const lineCount = (text.match(/\n/g) || []).length + 1;
  const approxWidth = Math.max(...text.split('\n').map(l => l.length)) * fontSize * 0.75 + 10;
  const approxHeight = lineCount * fontSize * 1.35;
  return {
    id: makeId('text'),
    type: 'text',
    x, y,
    width: approxWidth,
    height: approxHeight,
    angle: 0,
    strokeColor,
    backgroundColor,
    fillStyle: 'hachure',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity,
    groupIds,
    frameId: null,
    roundness: null,
    seed: Math.floor(Math.random() * 2000000),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked,
    text,
    fontSize,
    fontFamily,
    textAlign,
    verticalAlign,
    baseline: fontSize,
    containerId: null,
    originalText: text
  };
}

export function createLine({
  x, y, points = [[0, 0], [100, 0]],
  strokeColor = '#1e1e1e',
  strokeWidth = 2,
  strokeStyle = 'solid',
  roughness = 1,
  startArrowhead = null,
  endArrowhead = null,
  groupIds = [],
  locked = false
}) {
  const minX = Math.min(...points.map(p => p[0]));
  const maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1]));
  const maxY = Math.max(...points.map(p => p[1]));
  return {
    id: makeId('line'),
    type: 'line',
    x, y,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
    angle: 0,
    strokeColor,
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth,
    strokeStyle,
    roughness,
    opacity: 100,
    groupIds,
    frameId: null,
    roundness: { type: 2 },
    seed: Math.floor(Math.random() * 2000000),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked,
    points,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead,
    endArrowhead
  };
}

export function createEllipse({
  x, y, width, height,
  strokeColor = '#1e1e1e',
  backgroundColor = 'transparent',
  fillStyle = 'hachure',
  strokeWidth = 2,
  strokeStyle = 'solid',
  roughness = 1,
  opacity = 100,
  groupIds = [],
  locked = false
}) {
  return {
    id: makeId('ellipse'),
    type: 'ellipse',
    x, y, width, height,
    angle: 0,
    strokeColor,
    backgroundColor,
    fillStyle,
    strokeWidth,
    strokeStyle,
    roughness,
    opacity,
    groupIds,
    frameId: null,
    roundness: null,
    seed: Math.floor(Math.random() * 2000000),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked
  };
}

// ==========================================
// 1. شبكة المستوى الإحداثي الديكارتي (Cartesian Coordinates)
// ==========================================
export function getCartesianGridTemplate(originX = 100, originY = 80) {
  const elements = [];
  const gid = makeId('group_cartesian');
  const size = 560;
  const half = size / 2;
  const step = 35; // 8 وحدات في كل اتجاه
  const cx = originX + half;
  const cy = originY + half;

  // خلفية الإطار
  elements.push(createRect({
    x: originX - 40,
    y: originY - 50,
    width: size + 360,
    height: size + 100,
    strokeColor: '#ced4da',
    backgroundColor: '#ffffff',
    fillStyle: 'solid',
    strokeWidth: 1.5,
    roundness: { type: 3 },
    groupIds: [gid]
  }));

  // عنوان الشاشة
  elements.push(createText({
    x: originX + 20,
    y: originY - 35,
    text: "📐 شاشة المستوى الإحداثي (Cartesian Plane)",
    fontSize: 24,
    strokeColor: '#1864ab',
    groupIds: [gid]
  }));

  // خطوط الشبكة المساعدة الرمادية
  for (let i = -7; i <= 7; i++) {
    if (i === 0) continue;
    // عمودي
    elements.push(createLine({
      x: cx + i * step,
      y: originY,
      points: [[0, 0], [0, size]],
      strokeColor: '#e9ecef',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      groupIds: [gid]
    }));
    // أفقي
    elements.push(createLine({
      x: originX,
      y: cy + i * step,
      points: [[0, 0], [size, 0]],
      strokeColor: '#e9ecef',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      groupIds: [gid]
    }));
  }

  // المحور السيني الأفقي X مع أسهم
  elements.push(createLine({
    x: originX,
    y: cy,
    points: [[0, 0], [size, 0]],
    strokeColor: '#212529',
    strokeWidth: 3,
    startArrowhead: 'arrow',
    endArrowhead: 'arrow',
    groupIds: [gid]
  }));

  // المحور الصادي الرأسي Y مع أسهم
  elements.push(createLine({
    x: cx,
    y: originY,
    points: [[0, 0], [0, size]],
    strokeColor: '#212529',
    strokeWidth: 3,
    startArrowhead: 'arrow',
    endArrowhead: 'arrow',
    groupIds: [gid]
  }));

  // تسميات المحاور
  elements.push(createText({
    x: originX + size + 8,
    y: cy - 14,
    text: "س+",
    fontSize: 20,
    strokeColor: '#c92a2a',
    groupIds: [gid]
  }));
  elements.push(createText({
    x: originX - 35,
    y: cy - 14,
    text: "س-",
    fontSize: 20,
    strokeColor: '#c92a2a',
    groupIds: [gid]
  }));
  elements.push(createText({
    x: cx - 14,
    y: originY - 30,
    text: "ص+",
    fontSize: 20,
    strokeColor: '#2b8a3e',
    groupIds: [gid]
  }));
  elements.push(createText({
    x: cx - 14,
    y: originY + size + 5,
    text: "ص-",
    fontSize: 20,
    strokeColor: '#2b8a3e',
    groupIds: [gid]
  }));

  // أرقام التدريج
  for (let i = -7; i <= 7; i++) {
    if (i === 0) continue;
    // تدريج X
    elements.push(createLine({
      x: cx + i * step,
      y: cy - 4,
      points: [[0, 0], [0, 8]],
      strokeColor: '#212529',
      strokeWidth: 2,
      groupIds: [gid]
    }));
    elements.push(createText({
      x: cx + i * step - 8,
      y: cy + 8,
      text: `${i}`,
      fontSize: 14,
      strokeColor: '#495057',
      textAlign: 'center',
      groupIds: [gid]
    }));

    // تدريج Y (الأعلى موجب والأسفل سالب)
    elements.push(createLine({
      x: cx - 4,
      y: cy - i * step,
      points: [[0, 0], [8, 0]],
      strokeColor: '#212529',
      strokeWidth: 2,
      groupIds: [gid]
    }));
    elements.push(createText({
      x: cx + 12,
      y: cy - i * step - 9,
      text: `${i}`,
      fontSize: 14,
      strokeColor: '#495057',
      textAlign: 'left',
      groupIds: [gid]
    }));
  }

  // بطاقة تمرين الطالب الجانبية
  const cardX = originX + size + 50;
  elements.push(createRect({
    x: cardX,
    y: originY,
    width: 270,
    height: size,
    strokeColor: '#1971c2',
    backgroundColor: '#e7f5ff',
    fillStyle: 'solid',
    strokeWidth: 2,
    roundness: { type: 3 },
    groupIds: [gid]
  }));

  elements.push(createText({
    x: cardX + 15,
    y: originY + 15,
    text: "🎯 تمرين الطالب:\n\nعيّن النقاط التالية:\n• أ = (٣ ، ٤)\n• ب = (-٢ ، ٥)\n• ج = (-٤ ، -٣)\n• د = (٥ ، -٢)\n\nما هو الشكل الناتج عند\nوصل النقاط أ ، ب ، ج ، د؟",
    fontSize: 18,
    strokeColor: '#0c8599',
    textAlign: 'right',
    groupIds: [gid]
  }));

  return elements;
}

// ==========================================
// 2. خط الأعداد الصحيحة (Number Line)
// ==========================================
export function getNumberLineTemplate(originX = 100, originY = 150) {
  const elements = [];
  const gid = makeId('group_numline');
  const width = 880;
  const step = 40;
  const startNum = -10;
  const endNum = 10;
  const cy = originY + 120;

  elements.push(createRect({
    x: originX - 40,
    y: originY - 40,
    width: width + 80,
    height: 380,
    strokeColor: '#ced4da',
    backgroundColor: '#ffffff',
    fillStyle: 'solid',
    strokeWidth: 1.5,
    roundness: { type: 3 },
    groupIds: [gid]
  }));

  elements.push(createText({
    x: originX,
    y: originY - 20,
    text: "📏 خط الأعداد الصحيحة (Number Line)",
    fontSize: 24,
    strokeColor: '#d6336c',
    groupIds: [gid]
  }));

  // خط الأعداد
  elements.push(createLine({
    x: originX,
    y: cy,
    points: [[0, 0], [width, 0]],
    strokeColor: '#212529',
    strokeWidth: 3.5,
    startArrowhead: 'arrow',
    endArrowhead: 'arrow',
    groupIds: [gid]
  }));

  // التدريجات
  const totalSteps = endNum - startNum;
  for (let i = 0; i <= totalSteps; i++) {
    const num = startNum + i;
    const px = originX + 40 + i * step;
    const isZero = num === 0;

    elements.push(createLine({
      x: px,
      y: isZero ? cy - 14 : cy - 8,
      points: [[0, 0], [0, isZero ? 28 : 16]],
      strokeColor: isZero ? '#e03131' : '#495057',
      strokeWidth: isZero ? 3.5 : 2,
      groupIds: [gid]
    }));

    elements.push(createText({
      x: px - (num < 0 ? 12 : 7),
      y: cy + 16,
      text: `${num}`,
      fontSize: isZero ? 18 : 15,
      strokeColor: isZero ? '#e03131' : '#212529',
      textAlign: 'center',
      groupIds: [gid]
    }));
  }

  // كروت أسئلة
  elements.push(createRect({
    x: originX,
    y: cy + 80,
    width: width,
    height: 120,
    strokeColor: '#fa5252',
    backgroundColor: '#fff5f5',
    fillStyle: 'solid',
    strokeWidth: 2,
    roundness: { type: 3 },
    groupIds: [gid]
  }));

  elements.push(createText({
    x: originX + 20,
    y: cy + 95,
    text: "💡 مهمة الطالب: \n١) ضع علامة دائرية عند العدد (-٥) و (+٤)\n٢) ما هي المسافة (القيمة المطلقة) بين العددين؟\n٣) قارن مستخدماً (< ، > ، =):   -٨  [    ]  -٣",
    fontSize: 18,
    strokeColor: '#c92a2a',
    textAlign: 'right',
    groupIds: [gid]
  }));

  return elements;
}

// ==========================================
// 3. جدول القيم المنزلية (Place Value Table)
// ==========================================
export function getPlaceValueTemplate(originX = 80, originY = 80) {
  const elements = [];
  const gid = makeId('group_placevalue');
  const cols = [
    { title: "مئات الألوف", color: "#e7f5ff", border: "#339af0" },
    { title: "عشرات الألوف", color: "#e7f5ff", border: "#339af0" },
    { title: "آحاد الألوف", color: "#e7f5ff", border: "#339af0" },
    { title: "مئات", color: "#fff3bf", border: "#fcc419" },
    { title: "عشرات", color: "#fff3bf", border: "#fcc419" },
    { title: "آحاد", color: "#fff3bf", border: "#fcc419" },
    { title: "،", color: "#ffe3e3", border: "#ff6b6b", width: 45 },
    { title: "أعشار", color: "#ebfbee", border: "#51cf66" },
    { title: "أجزاء المئة", color: "#ebfbee", border: "#51cf66" },
    { title: "أجزاء الألف", color: "#ebfbee", border: "#51cf66" }
  ];

  elements.push(createText({
    x: originX + 20,
    y: originY - 40,
    text: "📊 جدول المنازل والقيم المكانية (Place Value Table)",
    fontSize: 24,
    strokeColor: '#2b8a3e',
    groupIds: [gid]
  }));

  let curX = originX;
  const colWidth = 90;
  const headerHeight = 55;
  const rowHeight = 70;

  cols.forEach((col) => {
    const w = col.width || colWidth;
    // رأس العمود
    elements.push(createRect({
      x: curX,
      y: originY,
      width: w,
      height: headerHeight,
      strokeColor: col.border,
      backgroundColor: col.color,
      fillStyle: 'solid',
      strokeWidth: 2,
      roundness: { type: 3 },
      groupIds: [gid]
    }));
    elements.push(createText({
      x: curX + (w > 50 ? 8 : 12),
      y: originY + (w > 50 ? 15 : 10),
      text: col.title,
      fontSize: w > 50 ? 15 : 24,
      strokeColor: '#212529',
      textAlign: 'center',
      groupIds: [gid]
    }));

    // خانات الكتابة (3 صفوف)
    for (let r = 0; r < 3; r++) {
      elements.push(createRect({
        x: curX,
        y: originY + headerHeight + r * rowHeight,
        width: w,
        height: rowHeight,
        strokeColor: '#adb5bd',
        backgroundColor: '#ffffff',
        fillStyle: 'solid',
        strokeWidth: 1.5,
        groupIds: [gid]
      }));
    }
    curX += w;
  });

  // بطاقة جانبية للمطلوب
  elements.push(createRect({
    x: originX,
    y: originY + headerHeight + 3 * rowHeight + 30,
    width: curX - originX,
    height: 110,
    strokeColor: '#20c997',
    backgroundColor: '#e6fcf5',
    fillStyle: 'solid',
    strokeWidth: 2,
    roundness: { type: 3 },
    groupIds: [gid]
  }));
  elements.push(createText({
    x: originX + 20,
    y: originY + headerHeight + 3 * rowHeight + 45,
    text: "✍️ اكتب الأعداد التالية في جدول المنازل:\n١) العدد: ٤٥٢,٣٧٨\n٢) العدد: ١,٠٢٥.٤٦\n٣) ما هي القيمة المنزلية للرقم (٥) في كل عدد؟",
    fontSize: 18,
    strokeColor: '#099268',
    textAlign: 'right',
    groupIds: [gid]
  }));

  return elements;
}

// ==========================================
// 4. استراتيجية حل المسائل - خطوات بوليا الأربع
// ==========================================
export function getPolyaProblemSolvingTemplate(originX = 80, originY = 80) {
  const elements = [];
  const gid = makeId('group_polya');

  elements.push(createText({
    x: originX + 20,
    y: originY - 40,
    text: "🧠 استراتيجية حل المسائل (خطوات بوليا الأربع)",
    fontSize: 24,
    strokeColor: '#4c6ef5',
    groupIds: [gid]
  }));

  const steps = [
    { num: "١", title: "أفـهـم 🔍", desc: "• ما هي المعطيات في المسألة؟\n• ما هو المطلوب إيجاده؟", color: "#e7f5ff", border: "#339af0" },
    { num: "٢", title: "أخـطّـط 💡", desc: "• اختيار الخطة المناسبة:\n(رسم شكل، جدول، نمط، التخمين والتحقق...)", color: "#fff3bf", border: "#fcc419" },
    { num: "٣", title: "أحـل ✍️", desc: "• تنفيذ الخطة خطوة بخطوة:\n\n\n", color: "#ebfbee", border: "#51cf66" },
    { num: "٤", title: "أتـحـقـق ✅", desc: "• هل إجابتي معقولة ومنطقية؟\n• التحقق بالعملية العكسية.", color: "#ffe3e3", border: "#ff6b6b" }
  ];

  const cardW = 440;
  const cardH = 240;
  const gap = 25;

  steps.forEach((step, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const px = originX + col * (cardW + gap);
    const py = originY + row * (cardH + gap);

    elements.push(createRect({
      x: px,
      y: py,
      width: cardW,
      height: cardH,
      strokeColor: step.border,
      backgroundColor: step.color,
      fillStyle: 'solid',
      strokeWidth: 2,
      roundness: { type: 3 },
      groupIds: [gid]
    }));

    elements.push(createText({
      x: px + 20,
      y: py + 15,
      text: `${step.title}`,
      fontSize: 22,
      strokeColor: step.border,
      groupIds: [gid]
    }));

    elements.push(createText({
      x: px + 20,
      y: py + 55,
      text: step.desc,
      fontSize: 16,
      strokeColor: '#343a40',
      textAlign: 'right',
      groupIds: [gid]
    }));
  });

  return elements;
}

// ==========================================
// 5. مسودة القسمة المطولة (Long Division Grid)
// ==========================================
export function getLongDivisionTemplate(originX = 100, originY = 80) {
  const elements = [];
  const gid = makeId('group_division');

  elements.push(createText({
    x: originX + 20,
    y: originY - 35,
    text: "➗ مسودة خوارزمية القسمة المطولة (Long Division)",
    fontSize: 24,
    strokeColor: '#f76707',
    groupIds: [gid]
  }));

  // رمز القسمة المطولة
  const divX = originX + 260;
  const divY = originY + 80;

  // الخط العلوي
  elements.push(createLine({
    x: divX,
    y: divY,
    points: [[0, 0], [280, 0]],
    strokeColor: '#212529',
    strokeWidth: 3.5,
    groupIds: [gid]
  }));
  // الخط المنحني الأيسر
  elements.push(createLine({
    x: divX,
    y: divY,
    points: [[0, 0], [-25, 45], [0, 90]],
    strokeColor: '#212529',
    strokeWidth: 3.5,
    groupIds: [gid]
  }));

  // تسميات المقسوم والمقسوم عليه وناتج القسمة
  elements.push(createText({
    x: divX + 60,
    y: divY - 35,
    text: "[ الناتج هنا ]",
    fontSize: 18,
    strokeColor: '#868e96',
    groupIds: [gid]
  }));
  elements.push(createText({
    x: divX + 40,
    y: divY + 30,
    text: "المقسوم",
    fontSize: 22,
    strokeColor: '#1864ab',
    groupIds: [gid]
  }));
  elements.push(createText({
    x: divX - 160,
    y: divY + 30,
    text: "المقسوم عليه",
    fontSize: 20,
    strokeColor: '#d6336c',
    groupIds: [gid]
  }));

  // شبكة خطوات الحل
  elements.push(createRect({
    x: divX,
    y: divY + 110,
    width: 280,
    height: 320,
    strokeColor: '#dee2e6',
    backgroundColor: '#ffffff',
    fillStyle: 'solid',
    strokeWidth: 1.5,
    strokeStyle: 'dashed',
    roundness: { type: 3 },
    groupIds: [gid]
  }));

  // بطاقة التذكير بالخطوات
  elements.push(createRect({
    x: originX + 580,
    y: originY + 50,
    width: 280,
    height: 380,
    strokeColor: '#fd7e14',
    backgroundColor: '#fff4e6',
    fillStyle: 'solid',
    strokeWidth: 2,
    roundness: { type: 3 },
    groupIds: [gid]
  }));
  elements.push(createText({
    x: originX + 600,
    y: originY + 70,
    text: "🔄 خطوات القسمة الذهبية:\n\n١) اقـسـم ➗\n٢) اضـرب ✖️\n٣) اطـرح ➖\n٤) قـارن 👀 (الباقي < المقسوم عليه)\n٥) أنـزل رقـمـاً ⬇️\n٦) كـرّر الخطوات 🔁",
    fontSize: 18,
    strokeColor: '#d9480f',
    textAlign: 'right',
    groupIds: [gid]
  }));

  return elements;
}

// ==========================================
// 6. شرائط نماذج الكسور المتكافئة (Fraction Strips)
// ==========================================
export function getFractionStripsTemplate(originX = 80, originY = 80) {
  const elements = [];
  const gid = makeId('group_fractions');
  const width = 800;
  const barH = 50;
  const gap = 15;

  elements.push(createText({
    x: originX + 20,
    y: originY - 35,
    text: "🍰 شرائط ونماذج الكسور المتكافئة (Fraction Strips)",
    fontSize: 24,
    strokeColor: '#7048e8',
    groupIds: [gid]
  }));

  const fractions = [
    { parts: 1, label: "١ كامل", color: "#eebefa", border: "#ae3ec9" },
    { parts: 2, label: "١/٢", color: "#d0ebff", border: "#1971c2" },
    { parts: 3, label: "١/٣", color: "#d3f9d8", border: "#2f9e44" },
    { parts: 4, label: "١/٤", color: "#ffec99", border: "#f59f00" },
    { parts: 6, label: "١/٦", color: "#ffe066", border: "#f08c00" },
    { parts: 8, label: "١/٨", color: "#ffc9c9", border: "#e03131" }
  ];

  fractions.forEach((f, idx) => {
    const py = originY + idx * (barH + gap);
    const partW = width / f.parts;

    for (let p = 0; p < f.parts; p++) {
      const px = originX + p * partW;
      elements.push(createRect({
        x: px,
        y: py,
        width: partW,
        height: barH,
        strokeColor: f.border,
        backgroundColor: f.color,
        fillStyle: 'solid',
        strokeWidth: 2,
        groupIds: [gid]
      }));
      elements.push(createText({
        x: px + partW / 2 - 14,
        y: py + 14,
        text: f.label,
        fontSize: 18,
        strokeColor: '#212529',
        textAlign: 'center',
        groupIds: [gid]
      }));
    }
  });

  return elements;
}

// ==========================================
// 7. شكل فن للمقارنة الثنائية (Venn Diagram)
// ==========================================
export function getVennDiagramTemplate(originX = 120, originY = 80) {
  const elements = [];
  const gid = makeId('group_venn');

  elements.push(createText({
    x: originX + 20,
    y: originY - 35,
    text: "⚖️ مخطط فن للمقارنة والتحليل (Venn Diagram)",
    fontSize: 24,
    strokeColor: '#1098ad',
    groupIds: [gid]
  }));

  const radius = 220;
  // الدائرة الأولى (يمين)
  elements.push(createEllipse({
    x: originX,
    y: originY + 40,
    width: radius * 2,
    height: radius * 2,
    strokeColor: '#339af0',
    backgroundColor: '#d0ebff',
    fillStyle: 'hachure',
    strokeWidth: 2.5,
    opacity: 60,
    groupIds: [gid]
  }));

  // الدائرة الثانية (يسار)
  elements.push(createEllipse({
    x: originX + 240,
    y: originY + 40,
    width: radius * 2,
    height: radius * 2,
    strokeColor: '#ff6b6b',
    backgroundColor: '#ffc9c9',
    fillStyle: 'hachure',
    strokeWidth: 2.5,
    opacity: 60,
    groupIds: [gid]
  }));

  // العناوين
  elements.push(createText({
    x: originX + 50,
    y: originY + 50,
    text: "المفهوم (أ)\n[خصائص خاصة فقط]",
    fontSize: 18,
    strokeColor: '#1864ab',
    textAlign: 'center',
    groupIds: [gid]
  }));

  elements.push(createText({
    x: originX + 310,
    y: originY + 180,
    text: "أوجه الشبه\n[المشتركة]",
    fontSize: 18,
    strokeColor: '#495057',
    textAlign: 'center',
    groupIds: [gid]
  }));

  elements.push(createText({
    x: originX + 520,
    y: originY + 50,
    text: "المفهوم (ب)\n[خصائص خاصة فقط]",
    fontSize: 18,
    strokeColor: '#c92a2a',
    textAlign: 'center',
    groupIds: [gid]
  }));

  return elements;
}

// ==========================================
// 8. خريطة المفاهيم الذهنية (Mind Map)
// ==========================================
export function getMindMapTemplate(originX = 100, originY = 100) {
  const elements = [];
  const gid = makeId('group_mindmap');
  const cx = originX + 400;
  const cy = originY + 220;

  elements.push(createText({
    x: originX + 20,
    y: originY - 50,
    text: "🗺️ خريطة المفاهيم والأفكار الذهنية (Mind Map)",
    fontSize: 24,
    strokeColor: '#e03131',
    groupIds: [gid]
  }));

  // العقدة المركزية
  elements.push(createRect({
    x: cx - 110,
    y: cy - 45,
    width: 220,
    height: 90,
    strokeColor: '#e03131',
    backgroundColor: '#ffe3e3',
    fillStyle: 'solid',
    strokeWidth: 3,
    roundness: { type: 3 },
    groupIds: [gid]
  }));
  elements.push(createText({
    x: cx - 80,
    y: cy - 15,
    text: "الفكرة الرئيسية للدرس",
    fontSize: 20,
    strokeColor: '#c92a2a',
    textAlign: 'center',
    groupIds: [gid]
  }));

  // الفروع الأربعة
  const branches = [
    { label: "المفهوم الفرعي ١", x: cx - 350, y: cy - 160, color: "#e7f5ff", border: "#1971c2" },
    { label: "المفهوم الفرعي ٢", x: cx + 180, y: cy - 160, color: "#ebfbee", border: "#2b8a3e" },
    { label: "المفهوم الفرعي ٣", x: cx - 350, y: cy + 120, color: "#fff3bf", border: "#f59f00" },
    { label: "المفهوم الفرعي ٤", x: cx + 180, y: cy + 120, color: "#f3f0ff", border: "#7048e8" }
  ];

  branches.forEach((b) => {
    // خط موصل
    elements.push(createLine({
      x: cx,
      y: cy,
      points: [[0, 0], [b.x + 80 - cx, b.y + 35 - cy]],
      strokeColor: b.border,
      strokeWidth: 2.5,
      endArrowhead: 'arrow',
      groupIds: [gid]
    }));

    // بطاقة الفرع
    elements.push(createRect({
      x: b.x,
      y: b.y,
      width: 170,
      height: 70,
      strokeColor: b.border,
      backgroundColor: b.color,
      fillStyle: 'solid',
      strokeWidth: 2,
      roundness: { type: 3 },
      groupIds: [gid]
    }));
    elements.push(createText({
      x: b.x + 15,
      y: b.y + 22,
      text: b.label,
      fontSize: 16,
      strokeColor: '#212529',
      textAlign: 'center',
      groupIds: [gid]
    }));
  });

  return elements;
}

// ==========================================
// 9. جدول التعلم الذاتي KWL
// ==========================================
export function getKWLTableTemplate(originX = 80, originY = 80) {
  const elements = [];
  const gid = makeId('group_kwl');
  const colW = 280;
  const colH = 460;

  elements.push(createText({
    x: originX + 20,
    y: originY - 35,
    text: "📝 جدول التعلم الذاتي (استراتيجية KWL)",
    fontSize: 24,
    strokeColor: '#099268',
    groupIds: [gid]
  }));

  const cols = [
    { title: "ماذا أعرف سابقاً؟ (K) 🧠", color: "#e7f5ff", border: "#1971c2" },
    { title: "ماذا أريد أن أتعلم؟ (W) ❓", color: "#fff3bf", border: "#f59f00" },
    { title: "ماذا تعلمت اليوم؟ (L) 🌟", color: "#ebfbee", border: "#2b8a3e" }
  ];

  cols.forEach((col, idx) => {
    const px = originX + idx * (colW + 20);
    elements.push(createRect({
      x: px,
      y: originY,
      width: colW,
      height: 60,
      strokeColor: col.border,
      backgroundColor: col.color,
      fillStyle: 'solid',
      strokeWidth: 2,
      roundness: { type: 3 },
      groupIds: [gid]
    }));
    elements.push(createText({
      x: px + 15,
      y: originY + 18,
      text: col.title,
      fontSize: 18,
      strokeColor: '#212529',
      textAlign: 'center',
      groupIds: [gid]
    }));

    // مساحة الكتابة
    elements.push(createRect({
      x: px,
      y: originY + 70,
      width: colW,
      height: colH - 70,
      strokeColor: '#ced4da',
      backgroundColor: '#ffffff',
      fillStyle: 'solid',
      strokeWidth: 1.5,
      roundness: { type: 3 },
      groupIds: [gid]
    }));
  });

  return elements;
}

// ==========================================
// 10. بطاقة الخروج السريعة (Exit Ticket)
// ==========================================
export function getExitTicketTemplate(originX = 120, originY = 80) {
  const elements = [];
  const gid = makeId('group_exitticket');
  const w = 720;
  const h = 480;

  elements.push(createRect({
    x: originX,
    y: originY,
    width: w,
    height: h,
    strokeColor: '#d6336c',
    backgroundColor: '#fff0f6',
    fillStyle: 'solid',
    strokeWidth: 2.5,
    roundness: { type: 3 },
    groupIds: [gid]
  }));

  elements.push(createText({
    x: originX + 25,
    y: originY + 25,
    text: "🎟️ بطاقة الخروج (Exit Ticket) - ختام الحصة",
    fontSize: 24,
    strokeColor: '#a61e4d',
    groupIds: [gid]
  }));

  elements.push(createText({
    x: originX + 25,
    y: originY + 70,
    text: "اسم الطالب: _____________________      التاريخ: ___ / ___ / ١٤٤٧هـ",
    fontSize: 18,
    strokeColor: '#495057',
    groupIds: [gid]
  }));

  // الأقسام الثلاثة
  const sections = [
    { title: "١) أهم فكرة أو مهارة أتقنتها في درس اليوم:", y: originY + 120, h: 80 },
    { title: "٢) سؤال أو نقطة لا زلت بحاجة لمراجعتها مع المعلم:", y: originY + 220, h: 80 },
    { title: "٣) تقييمي لمستوى استيعابي وفهمي للحصة:", y: originY + 320, h: 90 }
  ];

  sections.forEach((sec, idx) => {
    elements.push(createText({
      x: originX + 25,
      y: sec.y,
      text: sec.title,
      fontSize: 17,
      strokeColor: '#212529',
      groupIds: [gid]
    }));
    elements.push(createRect({
      x: originX + 25,
      y: sec.y + 30,
      width: w - 50,
      height: sec.h - 30,
      strokeColor: '#e9ecef',
      backgroundColor: '#ffffff',
      fillStyle: 'solid',
      strokeWidth: 1.5,
      roundness: { type: 3 },
      groupIds: [gid]
    }));
  });

  elements.push(createText({
    x: originX + 50,
    y: originY + 360,
    text: "⭐⭐⭐⭐⭐  (ظلل عدد النجوم المناسب لفهمك)",
    fontSize: 20,
    strokeColor: '#f59f00',
    groupIds: [gid]
  }));

  return elements;
}

// ==========================================
// 11. سبورة التحدي الفردي للطالب (Solo Challenge)
// ==========================================
export function getStudentChallengeTemplate(studentName = "الطالب المتميز", originX = 80, originY = 80) {
  const elements = [];
  const gid = makeId('group_challenge');
  const w = 840;

  // الإطار الخارجي
  elements.push(createRect({
    x: originX,
    y: originY,
    width: w,
    height: 520,
    strokeColor: '#228be6',
    backgroundColor: '#ffffff',
    fillStyle: 'solid',
    strokeWidth: 2.5,
    roundness: { type: 3 },
    groupIds: [gid]
  }));

  // الترويسة العلوية
  elements.push(createRect({
    x: originX,
    y: originY,
    width: w,
    height: 70,
    strokeColor: '#1971c2',
    backgroundColor: '#e7f5ff',
    fillStyle: 'solid',
    strokeWidth: 2,
    roundness: { type: 3 },
    groupIds: [gid]
  }));

  elements.push(createText({
    x: originX + 25,
    y: originY + 20,
    text: `🏆 سبورة التحدي الفردي | الطالب: ${studentName}`,
    fontSize: 24,
    strokeColor: '#1864ab',
    groupIds: [gid]
  }));

  // مساحة المسألة
  elements.push(createRect({
    x: originX + 25,
    y: originY + 95,
    width: w - 50,
    height: 100,
    strokeColor: '#ffd43b',
    backgroundColor: '#fff9db',
    fillStyle: 'solid',
    strokeWidth: 2,
    roundness: { type: 3 },
    groupIds: [gid]
  }));
  elements.push(createText({
    x: originX + 45,
    y: originY + 115,
    text: "❓ السؤال / التمرين:\n[ اكتب نص المسألة هنا أو استوردها من الكتاب ]",
    fontSize: 18,
    strokeColor: '#e67700',
    groupIds: [gid]
  }));

  // مساحة خطوات الحل
  elements.push(createRect({
    x: originX + 25,
    y: originY + 215,
    width: w - 300,
    height: 275,
    strokeColor: '#ced4da',
    backgroundColor: '#ffffff',
    fillStyle: 'solid',
    strokeWidth: 1.5,
    roundness: { type: 3 },
    groupIds: [gid]
  }));
  elements.push(createText({
    x: originX + 45,
    y: originY + 230,
    text: "✍️ مسودة وخطوات تفكير الطالب:",
    fontSize: 18,
    strokeColor: '#868e96',
    groupIds: [gid]
  }));

  // مربع الناتج النهائي
  elements.push(createRect({
    x: originX + w - 250,
    y: originY + 215,
    width: 225,
    height: 275,
    strokeColor: '#51cf66',
    backgroundColor: '#ebfbee',
    fillStyle: 'solid',
    strokeWidth: 2.5,
    roundness: { type: 3 },
    groupIds: [gid]
  }));
  elements.push(createText({
    x: originX + w - 230,
    y: originY + 240,
    text: "🎯 الناتج النهائي:\n\n\n\n\n\nدرجة التحدي: [   / ١٠ ]",
    fontSize: 20,
    strokeColor: '#2b8a3e',
    textAlign: 'center',
    groupIds: [gid]
  }));

  return elements;
}

// قائمة جميع القوالب مع وصفها وأيقونتها
export const TEMPLATES_CATALOG = [
  {
    id: 'cartesian',
    title: 'شبكة المستوى الإحداثي',
    subtitle: 'محاور س و ص وأرقام وتدريج كامل مع كارت التمارين',
    icon: '📐',
    category: 'رياضيات',
    generator: getCartesianGridTemplate
  },
  {
    id: 'numline',
    title: 'خط الأعداد الصحيحة',
    subtitle: 'خط أعداد من -١٠ إلى +١٠ مع نقاط ومقارنات',
    icon: '📏',
    category: 'رياضيات',
    generator: getNumberLineTemplate
  },
  {
    id: 'placevalue',
    title: 'جدول القيم المكانية',
    subtitle: 'ألوف، مئات، عشرات، آحاد، وفواصل عشرية',
    icon: '📊',
    category: 'رياضيات',
    generator: getPlaceValueTemplate
  },
  {
    id: 'polya',
    title: 'خطوات بوليا لحل المسائل',
    subtitle: '٤ بطاقات استراتيجية: أفهم، أخطط، أحل، أتحقق',
    icon: '🧠',
    category: 'أنشطة واستراتيجيات',
    generator: getPolyaProblemSolvingTemplate
  },
  {
    id: 'division',
    title: 'مسودة القسمة المطولة',
    subtitle: 'رمز القسمة ومربعات المنازل مع تذكير الخطوات الست',
    icon: '➗',
    category: 'رياضيات',
    generator: getLongDivisionTemplate
  },
  {
    id: 'fractions',
    title: 'شرائط الكسور المتكافئة',
    subtitle: 'نماذج بصرية ملونة لمقارنة الكسور وتبسيطها',
    icon: '🍰',
    category: 'رياضيات',
    generator: getFractionStripsTemplate
  },
  {
    id: 'venn',
    title: 'شكل فن للمقارنة الثنائية',
    subtitle: 'دائرتان متقاطعتان لتحليل أوجه الشبه والاختلاف',
    icon: '⚖️',
    category: 'أنشطة واستراتيجيات',
    generator: getVennDiagramTemplate
  },
  {
    id: 'mindmap',
    title: 'خريطة المفاهيم الذهنية',
    subtitle: 'فكرة رئيسية متفرعة لـ ٤ عناصر لتلخيص الدروس',
    icon: '🗺️',
    category: 'أنشطة واستراتيجيات',
    generator: getMindMapTemplate
  },
  {
    id: 'kwl',
    title: 'جدول التعلم الذاتي KWL',
    subtitle: 'ماذا أعرف؟ ماذا أريد أن أتعلم؟ ماذا تعلمت؟',
    icon: '📝',
    category: 'أنشطة واستراتيجيات',
    generator: getKWLTableTemplate
  },
  {
    id: 'exitticket',
    title: 'بطاقة الخروج الختامية',
    subtitle: 'تذكرة تقييم فهم الطالب وسؤاله الأخير في الحصة',
    icon: '🎟️',
    category: 'أنشطة واستراتيجيات',
    generator: getExitTicketTemplate
  },
  {
    id: 'challenge',
    title: 'سبورة التحدي الفردي للطالب',
    subtitle: 'شاشة مخصصة باسم الطالب للسؤال وخطوات الحل والناتج',
    icon: '🏆',
    category: 'أنشطة واستراتيجيات',
    generator: (name) => getStudentChallengeTemplate(name || 'الطالب')
  }
];
