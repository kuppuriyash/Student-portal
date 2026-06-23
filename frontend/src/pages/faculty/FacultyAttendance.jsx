import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, CheckCircle, Save, Loader2 } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <Calendar className="h-8 w-8 text-indigo-500" />
          Class Register
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select subject and date to register students</p>
      </div>

      {/* Dropdowns panel */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200/40 dark:border-slate-850">
        <div>
          <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-2">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={handleCourseChange}
            className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
          >
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
      <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850 space-y-6">
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
              <tr className="border-b border-slate-100 dark:border-slate-805 text-xs font-bold text-slate-400 uppercase">
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
    </div>
  );
};

export default FacultyAttendance;
