import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Award, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

const StudentGrades = () => {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSem, setExpandedSem] = useState({});

  useEffect(() => {
    const loadGrades = async () => {
      try {
        const json = await fetchWithAuth('/student/grades');
        if (json.success) {
          setData(json.data);
          // Expand all semesters by default
          const defaultExpanded = {};
          Object.keys(json.data.semesters).forEach(sem => {
            defaultExpanded[sem] = true;
          });
          setExpandedSem(defaultExpanded);
        } else {
          setError(json.message || 'Could not load grades');
        }
      } catch (err) {
        console.error(err);
        setError('Network error syncing academic records');
      } finally {
        setLoading(false);
      }
    };
    loadGrades();
  }, []);

  const toggleSemester = (sem) => {
    setExpandedSem(prev => ({
      ...prev,
      [sem]: !prev[sem]
    }));
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

  const { cgpa, semesters } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Grades & Results</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Official semester transcripts and faculty feedback</p>
      </div>

      {/* CGPA Summary Banner */}
      <div className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden bg-gradient-to-tr from-indigo-500/10 to-violet-600/5 dark:from-indigo-950/20 dark:to-slate-900">
        <div className="flex items-center gap-4 z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cumulative Performance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Calculated based on current graded modules</p>
          </div>
        </div>

        <div className="mt-6 md:mt-0 flex items-center gap-2 z-10">
          <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">CGPA:</span>
          <span className="text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
            {cgpa}
          </span>
          <span className="text-slate-400 font-bold text-lg">/ 10.0</span>
        </div>
      </div>

      {/* Semesters list */}
      <div className="space-y-6">
        {Object.keys(semesters).length > 0 ? (
          Object.keys(semesters).map((sem) => (
            <div key={sem} className="glass-panel rounded-3xl overflow-hidden shadow-sm">
              {/* Semester Accordion Header */}
              <button
                onClick={() => toggleSemester(sem)}
                className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-indigo-500" />
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Semester {sem}</span>
                </div>
                {expandedSem[sem] ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </button>

              {/* Semester Grades Body */}
              {expandedSem[sem] && (
                <div className="p-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60 text-xs font-bold text-slate-400 uppercase">
                        <th className="py-3">Subject</th>
                        <th className="py-3">Evaluation Type</th>
                        <th className="py-3">Score</th>
                        <th className="py-3">Grade</th>
                        <th className="py-3">Instructor Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/20">
                      {semesters[sem].map((g) => (
                        <tr key={g._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                          <td className="py-4">
                            <span className="font-bold text-slate-800 dark:text-slate-300 block">{g.course.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">{g.course.code}</span>
                          </td>
                          <td className="py-4 text-slate-500 dark:text-slate-400 font-medium">
                            {g.examType}
                          </td>
                          <td className="py-4 font-mono text-slate-600 dark:text-slate-450 font-bold">
                            {g.marksObtained} <span className="text-slate-400 font-normal">/ {g.maxMarks}</span>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-extrabold ${
                              g.grade === 'A+' || g.grade === 'A' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                              g.grade === 'B+' || g.grade === 'B' ? 'bg-blue-500/10 text-blue-600' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {g.grade}
                            </span>
                          </td>
                          <td className="py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                            {g.feedback ? (
                              <div className="flex gap-1.5 items-start">
                                <MessageCircle className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                                <span>{g.feedback}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No feedback provided</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
            No grades logged or semester transcripts generated yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGrades;
