import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

const Timetable = () => {
  const { fetchWithAuth } = useAuth();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const json = await fetchWithAuth('/student/timetable');
        if (json.success) {
          setSchedule(json.data);
        } else {
          setError(json.message || 'Could not load timetable');
        }
      } catch (err) {
        console.error(err);
        setError('Network error syncing weekly schedules');
      } finally {
        setLoading(false);
      }
    };
    loadTimetable();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Helper to color-code cards by course code
  const getSubjectColor = (code = '') => {
    const lastChar = code.charAt(code.length - 1);
    const colors = [
      'border-l-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 dark:bg-indigo-950/20',
      'border-l-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/20',
      'border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 dark:bg-amber-950/20',
      'border-l-sky-500 bg-sky-500/5 hover:bg-sky-500/10 text-sky-700 dark:text-sky-300 dark:bg-sky-950/20',
      'border-l-pink-500 bg-pink-500/5 hover:bg-pink-500/10 text-pink-700 dark:text-pink-300 dark:bg-pink-950/20',
      'border-l-violet-500 bg-violet-500/5 hover:bg-violet-500/10 text-violet-700 dark:text-violet-300 dark:bg-violet-950/20',
    ];
    const index = isNaN(parseInt(lastChar)) ? 0 : parseInt(lastChar) % colors.length;
    return colors[index];
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
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-sm font-semibold text-rose-600 dark:text-rose-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">Class Timetable</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Weekly lectures routing and lab slots mapping</p>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {days.map((day) => {
          const slots = schedule[day] || [];
          return (
            <div 
              key={day} 
              className="glass-panel rounded-3xl p-5 flex flex-col shadow-sm border border-slate-200/40 dark:border-slate-850"
            >
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-indigo-500 shrink-0" />
                {day}
              </h3>

              <div className="flex-1 space-y-4">
                {slots.length > 0 ? (
                  slots.map((slot) => (
                    <div 
                      key={slot._id} 
                      className={`p-3 rounded-2xl border-l-[3px] transition-all duration-200 cursor-pointer ${getSubjectColor(slot.course.code)}`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase">{slot.course.code}</span>
                      <h4 className="text-xs font-bold truncate mt-0.5" title={slot.course.name}>
                        {slot.course.name}
                      </h4>
                      
                      <div className="mt-3.5 space-y-1 text-[10px] font-semibold text-slate-450 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>Room: {slot.room}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-28 flex items-center justify-center rounded-2xl border border-dashed border-slate-200/50 dark:border-slate-800/50 text-slate-400 text-[10px] italic">
                    No classes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timetable;
