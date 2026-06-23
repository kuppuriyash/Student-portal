import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, QrCode, CheckCircle, Save, Loader2, Sparkles } from 'lucide-react';

const FacultyAttendance = () => {
  const { fetchWithAuth } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  
  // Manual attendance matrix state
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'Present'|'Absent'|'Excused' }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // QR Session state
  const [isQRSessionActive, setIsQRSessionActive] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [countdown, setCountdown] = useState(20);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const json = await fetchWithAuth('/faculty/courses');
        if (json.success) {
          setCourses(json.data);
          if (json.data.length > 0) {
            setSelectedCourse(json.data[0]._id);
            setStudents(json.data[0].students || []);
            // Prepopulate attendance map to 'Present' for convenience
            const initialMap = {};
            json.data[0].students.forEach(s => {
              initialMap[s._id] = 'Present';
            });
            setAttendanceMap(initialMap);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Update students roster when course changes
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    
    // Stop any active QR session
    setIsQRSessionActive(false);
    setQrToken('');

    const courseObj = courses.find(c => c._id === courseId);
    if (courseObj) {
      setStudents(courseObj.students || []);
      const initialMap = {};
      courseObj.students.forEach(s => {
        initialMap[s._id] = 'Present';
      });
      setAttendanceMap(initialMap);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Format records array
    const records = Object.keys(attendanceMap).map(studentId => ({
      studentId,
      status: attendanceMap[studentId]
    }));

    try {
      const json = await fetchWithAuth('/faculty/attendance', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourse,
          date,
          records
        })
      });

      if (json.success) {
        setMessage({ type: 'success', text: `Successfully marked attendance for ${records.length} students!` });
      } else {
        setMessage({ type: 'error', text: json.message || 'Failed to submit attendance.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error posting attendance logs.' });
    } finally {
      setSaving(false);
    }
  };

  // QR CODE GENERATION TRIGGER & LOOP
  const triggerQRTokenFetch = async () => {
    if (!selectedCourse) return;
    setQrLoading(true);
    try {
      const json = await fetchWithAuth('/qr/generate', {
        method: 'POST',
        body: JSON.stringify({ courseId: selectedCourse })
      });
      if (json.success) {
        setQrToken(json.data.qrToken);
        setCountdown(json.data.expiresIn);
      }
    } catch (err) {
      console.error('Error generating QR Token:', err);
    } finally {
      setQrLoading(false);
    }
  };

  // Dynamic loop for QR Session
  useEffect(() => {
    let timer;
    if (isQRSessionActive) {
      // First fetch
      if (!qrToken) {
        triggerQRTokenFetch();
      }

      // Countdown timer
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            triggerQRTokenFetch(); // Re-fetch on expire
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setQrToken('');
    }

    return () => clearInterval(timer);
  }, [isQRSessionActive, qrToken, selectedCourse]);

  const toggleQRSession = () => {
    setIsQRSessionActive(!isQRSessionActive);
    setQrToken('');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // Render QR Code using Google Charts API
  const qrCodeUrl = qrToken 
    ? `https://chart.googleapis.com/chart?chs=260x260&cht=qr&chl=${encodeURIComponent(qrToken)}&choe=UTF-8`
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* Attendance marking console */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Calendar className="h-8 w-8 text-indigo-500" />
            Class Register
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select subject and date to register students</p>
        </div>

        {/* Dropdowns panel */}
        <div className="glass-panel rounded-3xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              disabled={isQRSessionActive}
              className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
            >
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isQRSessionActive}
              className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
            />
          </div>
        </div>

        {message.text && (
          <div className={`rounded-2xl border p-4 text-sm font-semibold flex items-center gap-2 ${
            message.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
          }`}>
            <CheckCircle className="h-5 w-5 shrink-0" />
            {message.text}
          </div>
        )}

        {/* Manual Mark register */}
        {!isQRSessionActive ? (
          <div className="glass-panel rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="h-5 w-5 text-indigo-500" />
                Enrolled Roster ({students.length})
              </h3>

              <button
                onClick={handleSaveAttendance}
                disabled={saving || students.length === 0}
                className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Roster Attendance
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                    <th className="py-3">Roll No</th>
                    <th className="py-3">Student Name</th>
                    <th className="py-3 text-right">Status Option</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="py-3.5 font-mono text-slate-500 dark:text-slate-400 text-xs font-bold">
                        {student.rollNo || 'N/A'}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-850 dark:text-slate-350">
                        {student.name}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1 text-xs">
                          {['Present', 'Absent', 'Excused'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student._id, status)}
                              className={`rounded-lg px-3 py-1 font-bold transition-all cursor-pointer ${
                                attendanceMap[student._id] === status
                                  ? status === 'Present' ? 'bg-emerald-500 text-white shadow-sm' :
                                    status === 'Absent' ? 'bg-rose-500 text-white shadow-sm' :
                                    'bg-blue-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-400">No students enrolled in this subject.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-8 text-center text-slate-500 space-y-4">
            <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">QR Session Active</h3>
            <p className="text-xs max-w-sm mx-auto">Manual roster marking is disabled during QR generation. Standard scans populate directly into the system database.</p>
          </div>
        )}
      </div>

      {/* QR Code session launcher console (Right side) */}
      <div className="lg:col-span-1 glass-panel rounded-3xl p-6 shadow-md flex flex-col items-center justify-between text-center gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 justify-center">
            <QrCode className="h-5.5 w-5.5 text-indigo-500 animate-pulse" />
            QR Attendance
          </h3>
          <p className="text-xs text-slate-450 mt-1 max-w-[240px]">Starts a dynamic rotating QR code display for the class project.</p>
        </div>

        {isQRSessionActive ? (
          <div className="space-y-6 w-full flex flex-col items-center">
            {/* Display QR code */}
            {qrLoading ? (
              <div className="h-[260px] w-[260px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : (
              qrCodeUrl && (
                <div className="p-3 bg-white rounded-[24px] shadow-lg border border-slate-200/50">
                  <img src={qrCodeUrl} alt="Signed rotating QR code" className="h-[220px] w-[220px]" />
                </div>
              )
            )}

            {/* Countdown timer */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">QR Tokens Rotator</span>
              <div className="flex items-center gap-2 justify-center">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 font-mono">Refreshes in {countdown}s</span>
              </div>
            </div>

            {/* Print out signed token payload for verification/testing simulation */}
            <div className="w-full text-left bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
              <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Active Token (Simulation Copy)</span>
              <p className="text-[9px] font-mono break-all text-slate-500 select-all mt-1">{qrToken || 'Fetching payload...'}</p>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-indigo-500/5 border border-dashed border-indigo-500/20 flex items-center justify-center text-slate-350">
              <QrCode className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 max-w-[200px]">Launch to project the scanner barcode onto the classroom projector board.</p>
          </div>
        )}

        <button
          onClick={toggleQRSession}
          disabled={!selectedCourse}
          className={`w-full py-3 rounded-2xl text-xs font-semibold shadow-md transition-all cursor-pointer ${
            isQRSessionActive 
              ? 'bg-rose-500 hover:bg-rose-600 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
          }`}
        >
          {isQRSessionActive ? 'Terminate QR Session' : 'Launch QR Session'}
        </button>
      </div>

    </div>
  );
};

export default FacultyAttendance;
