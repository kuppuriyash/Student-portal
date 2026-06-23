import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Award, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const FacultyGrades = () => {
  const { fetchWithAuth } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  
  // Grade form state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [semester, setSemester] = useState(1);
  const [examType, setExamType] = useState('Mid-Term');
  const [marksObtained, setMarksObtained] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [grade, setGrade] = useState('A');
  const [feedback, setFeedback] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const json = await fetchWithAuth('/faculty/courses');
        if (json.success) {
          setCourses(json.data);
          if (json.data.length > 0) {
            setSelectedCourse(json.data[0]._id);
            setStudents(json.data[0].students || []);
            if (json.data[0].students.length > 0) {
              setSelectedStudent(json.data[0].students[0]._id);
            }
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

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    const courseObj = courses.find(c => c._id === courseId);
    if (courseObj) {
      setStudents(courseObj.students || []);
      if (courseObj.students.length > 0) {
        setSelectedStudent(courseObj.students[0]._id);
      } else {
        setSelectedStudent('');
      }
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedStudent || !marksObtained || !maxMarks) {
      setMsg({ type: 'error', text: 'Please fill in all grade sheet credentials.' });
      return;
    }

    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const json = await fetchWithAuth('/faculty/grades', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent,
          courseId: selectedCourse,
          semester,
          examType,
          marksObtained: parseFloat(marksObtained),
          maxMarks: parseFloat(maxMarks),
          grade,
          feedback
        })
      });

      if (json.success) {
        setMsg({ type: 'success', text: 'Grade record logged and published successfully!' });
        setMarksObtained('');
        setFeedback('');
      } else {
        setMsg({ type: 'error', text: json.message || 'Error posting grade details.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Error posting grade to backend database.' });
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
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <Award className="h-8 w-8 text-indigo-500" />
          Grades Posting
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload component marks and assign letter grades</p>
      </div>

      {msg.text && (
        <div className={`rounded-2xl border p-4 text-sm font-semibold flex items-center gap-2 ${
          msg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
        }`}>
          {msg.type === 'error' ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle className="h-5 w-5 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Input panel Form */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleGradeSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Course select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wider mb-2">
                Select Subject
              </label>
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            {/* Student select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wider mb-2">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
              >
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.rollNo})</option>
                ))}
                {students.length === 0 && (
                  <option value="">No enrolled students found</option>
                )}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wider mb-2">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider mb-2">
                Evaluation Component
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
              >
                {['Quiz', 'Mid-Term', 'End-Term', 'Assignment', 'Practical'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Letter Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider mb-2">
                Letter Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
              >
                {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Marks Obtained */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wider mb-2">
                Marks Obtained
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                placeholder="e.g. 85"
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value)}
                className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>

            {/* Max Marks */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wider mb-2">
                Maximum Score
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 100"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>

          </div>

          {/* Feedback details */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-405 uppercase tracking-wider mb-2">
              Performance Feedback
            </label>
            <textarea
              rows="3"
              placeholder="Provide constructive review comments for the student portfolio..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={saving || students.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading Grades...
              </>
            ) : (
              'Publish Student Grade'
            )}
          </button>
        </form>
      </div>

    </div>
  );
};

export default FacultyGrades;
