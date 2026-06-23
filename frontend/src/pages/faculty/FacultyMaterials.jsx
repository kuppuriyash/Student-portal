import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, PlusCircle, Upload, CheckCircle2, Loader2, ClipboardList, Calendar } from 'lucide-react';

const FacultyMaterials = () => {
  const { fetchWithAuth, apiUrl } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  // Study Material form states
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matFile, setMatFile] = useState(null);
  const [matUploading, setMatUploading] = useState(false);
  const [matSuccess, setMatSuccess] = useState('');

  // Assignment form states
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignMaxMarks, setAssignMaxMarks] = useState(100);
  const [assignFile, setAssignFile] = useState(null);
  const [assignUploading, setAssignUploading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const json = await fetchWithAuth('/faculty/courses');
        if (json.success) {
          setCourses(json.data);
          if (json.data.length > 0) {
            setSelectedCourse(json.data[0]._id);
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

  const handleMaterialUpload = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !matTitle || !matFile) return;

    setMatUploading(true);
    setMatSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('courseId', selectedCourse);
      formData.append('title', matTitle);
      formData.append('description', matDesc);
      formData.append('material', matFile);

      const res = await fetch(`${apiUrl}/faculty/materials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const json = await res.json();

      if (json.success) {
        setMatSuccess('Study material note published successfully!');
        setMatTitle('');
        setMatDesc('');
        setMatFile(null);
        // Reset file input element visually
        e.target.reset();
      } else {
        alert(json.message || 'Material upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading study material');
    } finally {
      setMatUploading(false);
    }
  };

  const handleAssignmentUpload = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !assignTitle || !assignDesc || !assignDueDate) return;

    setAssignUploading(true);
    setAssignSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('courseId', selectedCourse);
      formData.append('title', assignTitle);
      formData.append('description', assignDesc);
      formData.append('dueDate', assignDueDate);
      formData.append('maxMarks', assignMaxMarks);
      if (assignFile) {
        formData.append('assignment', assignFile);
      }

      const res = await fetch(`${apiUrl}/faculty/assignments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const json = await res.json();

      if (json.success) {
        setAssignSuccess('Assignment course task posted successfully!');
        setAssignTitle('');
        setAssignDesc('');
        setAssignDueDate('');
        setAssignMaxMarks(100);
        setAssignFile(null);
        e.target.reset();
      } else {
        alert(json.message || 'Assignment posting failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error posting assignment details');
    } finally {
      setAssignUploading(false);
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <BookOpen className="h-8 w-8 text-indigo-500" />
          Course uploads
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Publish lecture references and grade assignment prompts</p>
      </div>

      {/* Course Global Selector */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm max-w-md">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Target Active Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
        >
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
          ))}
        </select>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Material Section */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <PlusCircle className="h-5.5 w-5.5 text-indigo-500" />
              Publish Reference Notes
            </h3>

            {matSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-450">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                {matSuccess}
              </div>
            )}

            <form onSubmit={handleMaterialUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Material Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binary Search Trees Reference"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Short note description..."
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select File (PDF, PPT, Word)
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setMatFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/20 dark:file:text-indigo-400 border border-slate-200/50 dark:border-slate-800 rounded-xl p-2 bg-white/40 dark:bg-slate-900/40"
                />
              </div>

              <button
                type="submit"
                disabled={matUploading || !selectedCourse}
                className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {matUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading Attachment...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Publish Note Material
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Upload Assignment Section */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <ClipboardList className="h-5.5 w-5.5 text-indigo-500" />
              Post Course Assignment
            </h3>

            {assignSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-450">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                {assignSuccess}
              </div>
            )}

            <form onSubmit={handleAssignmentUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assignment 2: Hash Map Implementations"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Problem Prompt
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Specify list of questions or instructions..."
                  value={assignDesc}
                  onChange={(e) => setAssignDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={assignMaxMarks}
                    onChange={(e) => setAssignMaxMarks(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-505 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                  Attachment sheet (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setAssignFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/20 dark:file:text-indigo-400 border border-slate-200/50 dark:border-slate-800 rounded-xl p-2 bg-white/40 dark:bg-slate-900/40"
                />
              </div>

              <button
                type="submit"
                disabled={assignUploading || !selectedCourse}
                className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {assignUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Publishing Task...
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-3.5 w-3.5" />
                    Publish Assignment Task
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyMaterials;
