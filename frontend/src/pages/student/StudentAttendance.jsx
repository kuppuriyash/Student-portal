import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const StudentAttendance = () => {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Self-Marking form states
  const [selectedCourse, setSelectedCourse] = useState('');
  const [markingLoading, setMarkingLoading] = useState(false);
  const [markingMsg, setMarkingMsg] = useState({ type: '', text: '' });

  const loadAttendance = async () => {
    try {
      const json = await fetchWithAuth('/student/attendance');
      if (json.success) {
        setData(json.data);
        if (json.data.summary.length > 0) {
          setSelectedCourse(json.data.summary[0].courseId);
        }
      } else {
        setError(json.message || 'Could not load attendance details');
      }
    } catch (err) {
      console.error(err);
      setError('Network error syncing attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleSelfMark = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setMarkingLoading(true);
    setMarkingMsg({ type: '', text: '' });

    try {
      const json = await fetchWithAuth('/student/attendance/self', {
        method: 'POST',
        body: JSON.stringify({ courseId: selectedCourse })
      });

      if (json.success) {
        setMarkingMsg({ type: 'success', text: json.message || 'Attendance registered successfully!' });
        loadAttendance(); // Refresh logs
      } else {
        setMarkingMsg({ type: 'error', text: json.message || 'Verification failed.' });
      }
    } catch (err) {
      console.error(err);
      setMarkingMsg({ type: 'error', text: 'Attendance already marked for today or database timeout.' });
    } finally {
      setMarkingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-sm font-semibold text-rose-600 dark:text-rose-450">
        {error}
      </div>
    );
  }

  const { summary, logs } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">Attendance Log</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed subject-wise analytics and class logs</p>
      </div>

      {/* Grid: Left column has summary, Right column has Simple Self-marking card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Attendance Summary list (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summary.map((item) => (
              <div 
                key={item.courseId} 
                className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between border border-slate-200/40 dark:border-slate-850"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.courseCode}</span>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">{item.courseName}</h3>
                    </div>
                    <span className={`inline-flex rounded-xl px-2.5 py-1 text-sm font-extrabold ${
                      item.percentage >= 75 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">Instructor: {item.facultyName}</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-800/50 pt-4 flex justify-between text-xs font-semibold text-slate-550">
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Total</span>
                    <span className="text-slate-805 dark:text-slate-350 font-bold mt-0.5">{item.totalClasses}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-500 text-[10px] uppercase font-bold">Present</span>
                    <span className="text-emerald-600 dark:text-emerald-450 font-bold mt-0.5">{item.presentClasses}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-rose-500 text-[10px] uppercase font-bold">Absent</span>
                    <span className="text-rose-600 dark:text-rose-450 font-bold mt-0.5">{item.absentClasses}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-blue-500 text-[10px] uppercase font-bold">Excused</span>
                    <span className="text-blue-600 dark:text-blue-450 font-bold mt-0.5">{item.excusedClasses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Self-marking Widget (Right) */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Self-Mark Attendance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Register yourself present for today's lecture directly.</p>
            
            {markingMsg.text && (
              <div className={`rounded-xl border p-3 text-xs font-semibold ${
                markingMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
              }`}>
                {markingMsg.text}
              </div>
            )}

            <form onSubmit={handleSelfMark} className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Active Subject
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                >
                  {summary.map(item => (
                    <option key={item.courseId} value={item.courseId}>{item.courseCode} - {item.courseName}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={markingLoading || summary.length === 0}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {markingLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Registering present...
                  </>
                ) : (
                  'Mark Myself Present'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Raw Attendance Register Logs */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-500" />
          Raw Daily Class Registers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3">Date</th>
                <th className="py-3">Subject / Code</th>
                <th className="py-3">Marked By</th>
                <th className="py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="py-3.5 font-medium text-slate-650 dark:text-slate-400">
                    {new Date(log.date).toLocaleDateString(undefined, { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-850 dark:text-slate-300 block">{log.course.name}</span>
                    <span className="text-[10px] font-mono text-slate-450 uppercase">{log.course.code}</span>
                  </td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400">
                    {log.markedBy ? log.markedBy.name : 'N/A'}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                      log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      log.status === 'Absent' ? 'bg-rose-500/10 text-rose-600' :
                      'bg-blue-500/10 text-blue-600'
                    }`}>
                      {log.status === 'Present' && <CheckCircle className="h-3 w-3" />}
                      {log.status === 'Absent' && <XCircle className="h-3 w-3" />}
                      {log.status === 'Excused' && <AlertCircle className="h-3 w-3" />}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-455">No attendance history logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default StudentAttendance;
