import Peer from 'peerjs';

/**
 * خدمة الغرفة الصفية والبث المباشر وتسليم الحلول
 * تستخدم تقنية WebRTC (PeerJS) للاتصال المباشر فائق السرعة وبدون الحاجة لأي خادم أو حساب خارجي
 */

class ClassroomService {
  constructor() {
    this.peer = null;
    this.roomId = null;
    this.role = 'none'; // 'teacher' | 'student' | 'none'
    this.connections = []; // للاتصالات النشطة (عند المعلم)
    this.studentConnection = null; // اتصال الطالب بالمعلم
    this.listeners = {
      onStudentJoined: [],
      onStudentLeft: [],
      onSolutionReceived: [],
      onSceneUpdated: [],
      onFeedbackReceived: [],
      onStatusChanged: []
    };
    this.connectedStudents = new Map(); // id -> studentInfo
  }

  // إضافة مستمع للأحداث
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in listener for ${event}:`, e);
        }
      });
    }
  }

  // إنشاء معرف غرفة فريد
  static generateRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `EDU-${res}`;
  }

  // ==========================================
  // إعداد المعلم (Host / Teacher)
  // ==========================================
  startTeacherRoom(customRoomId) {
    return new Promise((resolve, reject) => {
      this.close();
      const roomId = customRoomId || ClassroomService.generateRoomId();
      this.roomId = roomId;
      this.role = 'teacher';

      try {
        this.peer = new Peer(roomId.toLowerCase(), {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        this.peer.on('open', (id) => {
          this.emit('onStatusChanged', { status: 'ready', roomId: this.roomId, role: 'teacher' });
          resolve(this.roomId);
        });

        this.peer.on('error', (err) => {
          console.error('Peer error:', err);
          if (err.type === 'unavailable-id') {
            // المعرف مستخدم، نحاول توليد معرف آخر
            const retryId = ClassroomService.generateRoomId();
            this.startTeacherRoom(retryId).then(resolve).catch(reject);
          } else {
            this.emit('onStatusChanged', { status: 'error', error: err.message });
            reject(err);
          }
        });

        // استقبال اتصالات الطلاب
        this.peer.on('connection', (conn) => {
          this.handleIncomingStudent(conn);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  handleIncomingStudent(conn) {
    conn.on('open', () => {
      this.connections.push(conn);

      conn.on('data', (data) => {
        if (!data || !data.type) return;

        switch (data.type) {
          case 'STUDENT_JOIN':
            this.connectedStudents.set(conn.peer, {
              peerId: conn.peer,
              name: data.name || 'طالب',
              joinedAt: new Date().toLocaleTimeString('ar-SA')
            });
            this.emit('onStudentJoined', {
              peerId: conn.peer,
              name: data.name,
              totalStudents: this.connectedStudents.size,
              studentsList: Array.from(this.connectedStudents.values())
            });
            // نرسل للطالب تأكيد الانضمام
            conn.send({
              type: 'JOIN_CONFIRMED',
              roomId: this.roomId,
              message: 'تم الانضمام إلى غرفة المعلم بنجاح!'
            });
            break;

          case 'SUBMIT_SOLUTION':
            // استلام حل الطالب
            this.emit('onSolutionReceived', {
              id: `sol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              studentName: data.studentName || 'طالب',
              studentPeerId: conn.peer,
              taskTitle: data.taskTitle || 'حل مسألة',
              elements: data.elements || [],
              appState: data.appState || {},
              imageBase64: data.imageBase64,
              notes: data.notes || '',
              timestamp: new Date().toLocaleTimeString('ar-SA')
            });
            // تأكيد استلام الحل للطالب
            conn.send({
              type: 'SOLUTION_CONFIRMED',
              message: 'تم استلام حلك بنجاح لدى المعلم!'
            });
            break;

          default:
            break;
        }
      });
    });

    conn.on('close', () => {
      this.connections = this.connections.filter((c) => c !== conn);
      this.connectedStudents.delete(conn.peer);
      this.emit('onStudentLeft', {
        peerId: conn.peer,
        totalStudents: this.connectedStudents.size,
        studentsList: Array.from(this.connectedStudents.values())
      });
    });
  }

  // بث التغييرات على اللوحة لجميع الطلاب المتصلين
  broadcastScene(elements, appState) {
    if (this.role !== 'teacher' || this.connections.length === 0) return;

    // استبعاد الخصائص غير الضرورية لتقليل حجم الحزمة
    const cleanElements = (elements || []).map((el) => ({ ...el }));
    const payload = {
      type: 'SCENE_BROADCAST',
      elements: cleanElements,
      appState: {
        viewBackgroundColor: appState?.viewBackgroundColor || '#ffffff'
      }
    };

    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(payload);
        } catch (e) {
          console.warn('Failed to send to peer', e);
        }
      }
    });
  }

  // إرسال تقييم أو درجة لطالب معين
  sendFeedbackToStudent(studentPeerId, grade, feedbackText) {
    const conn = this.connections.find((c) => c.peer === studentPeerId);
    if (conn && conn.open) {
      conn.send({
        type: 'TEACHER_FEEDBACK',
        grade,
        feedback: feedbackText,
        time: new Date().toLocaleTimeString('ar-SA')
      });
      return true;
    }
    return false;
  }

  // ==========================================
  // إعداد الطالب (Student / Participant)
  // ==========================================
  joinRoomAsStudent(roomId, studentName) {
    return new Promise((resolve, reject) => {
      this.close();
      this.roomId = roomId;
      this.role = 'student';

      try {
        this.peer = new Peer({
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        this.peer.on('open', () => {
          const targetId = roomId.toLowerCase().trim();
          const conn = this.peer.connect(targetId, { reliable: true });
          this.studentConnection = conn;

          conn.on('open', () => {
            // إرسال بيانات انضمام الطالب
            conn.send({
              type: 'STUDENT_JOIN',
              name: studentName || 'طالب جديد'
            });

            this.emit('onStatusChanged', { status: 'connected', roomId, role: 'student' });
            resolve(conn);
          });

          conn.on('data', (data) => {
            if (!data || !data.type) return;

            switch (data.type) {
              case 'SCENE_BROADCAST':
                this.emit('onSceneUpdated', data);
                break;
              case 'SOLUTION_CONFIRMED':
                alert('✅ ' + data.message);
                break;
              case 'TEACHER_FEEDBACK':
                this.emit('onFeedbackReceived', data);
                break;
              default:
                break;
            }
          });

          conn.on('close', () => {
            this.emit('onStatusChanged', { status: 'disconnected', role: 'student' });
          });

          conn.on('error', (err) => {
            console.error('Student connection error:', err);
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          console.error('Peer student error:', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // قيام الطالب بتسليم حله إلى المعلم
  submitSolution({ studentName, taskTitle, elements, imageBase64, notes }) {
    if (!this.studentConnection || !this.studentConnection.open) {
      throw new Error('أنت غير متصل بغرفة المعلم حالياً!');
    }

    this.studentConnection.send({
      type: 'SUBMIT_SOLUTION',
      studentName,
      taskTitle,
      elements,
      imageBase64,
      notes
    });
  }

  // إغلاق الاتصال
  close() {
    if (this.connections.length > 0) {
      this.connections.forEach((c) => c.close());
      this.connections = [];
    }
    if (this.studentConnection) {
      this.studentConnection.close();
      this.studentConnection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connectedStudents.clear();
    this.role = 'none';
    this.roomId = null;
  }
}

export const classroomService = new ClassroomService();
