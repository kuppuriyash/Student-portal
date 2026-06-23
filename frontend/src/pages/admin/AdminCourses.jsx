import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Plus, Edit, Trash2, X, Search, Loader2, Users } from 'lucide-react';

const AdminCourses = () => {
  const { fetchWithAuth } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editId, setEditId] = useState(null); // null = Create
  
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourseObj, setSelectedCourseObj] = useState(null);
  const [enrollCheckMap, setEnrollCheckMap] = useState({}); // { studentId: boolean }

  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Course Form fields
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: 'Computer Science and Engineering',
    semester: 1,
    facultyId: '', // Assigned faculty mongo ID
    description: ''
  });

  const loadAllData = async () => {
    try {
      const courseJson = await fetchWithAuth('/admin/courses');
      const facultyJson = await fetchWithAuth('/admin/users?role=Faculty');
      const studentJson = await fetchWithAuth('/admin/users?role=Student');

      if (courseJson.success) setCourses(courseJson.data);
      if (facultyJson.success) setFacultyList(facultyJson.data);
      if (studentJson.success) setAllStudents(studentJson.data);
    } catch (err) {
      console.error('Error loading academic lists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      code: '',
      department: 'Computer Science and Engineering',
      semester: 1,
      facultyId: facultyList.length > 0 ? facultyList[0]._id : '',
      description: ''
    });
    setFormMsg({ type: '', text: '' });
    setShowCourseModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditId(c._id);
    setFormData({
      name: c.name || '',
      code: c.code || '',
      department: c.department || 'Computer Science and Engineering',
      semester: c.semester || 1,
      facultyId: c.faculty ? c.faculty._id : '',
      description: c.description || ''
    });
    setFormMsg({ type: '', text: '' });
    setShowCourseModal(true);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg({ type: '', text: '' });

    try {
      const method = editId ? 'PUT' : 'POST';
      const endpoint = editId ? `/admin/courses/${editId}` : '/admin/courses';
      
      const payload = {
        name: formData.name,
        code: formData.code,
        department: formData.department,
        semester: formData.semester,
        description: formData.description
      };
      
      if (method === 'POST') {
        payload.facultyId = formData.facultyId;
      } else {
        payload.faculty = formData.facultyId; // Backend PUT uses faculty parameter
      }

      const json = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (json.success) {
        setFormMsg({ type: 'success', text: json.message || 'Course saved successfully!' });
        setTimeout(() => {
          setShowCourseModal(false);
          loadAllData();
        }, 800);
      } else {
        setFormMsg({ type: 'error', text: json.message || 'Error occurred.' });
      }
    } catch (err) {
      console.error(err);
      setFormMsg({ type: 'error', text: 'Error posting course metadata.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? It will wipe out all corresponding timetables, attendance, grades, and student listings.')) return;
    try {
      const json = await fetchWithAuth(`/admin/courses/${id}`, {
        method: 'DELETE'
      });
      if (json.success) {
        loadAllData();
      } else {
        alert(json.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting course');
    }
  };

  // ENROLLMENT MANAGEMENT FLOWS
  const handleOpenEnrollment = (courseObj) => {
    setSelectedCourseObj(courseObj);
    
    // Create pre-checked mapping from enrolled student IDs
    const checked = {};
    allStudents.forEach(student => {
      checked[student._id] = courseObj.students.some(s => s._id.toString() === student._id.toString());
    });
    setEnrollCheckMap(checked);
    setFormMsg({ type: '', text: '' });
    setShowEnrollModal(true);
  };

  const handleEnrollToggle = (studentId) => {
    setEnrollCheckMap(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSaveEnrollments = async () => {
    if (!selectedCourseObj) return;
    setFormLoading(true);
    setFormMsg({ type: '', text: '' });

    // Map checked student IDs back into array
    const studentList = Object.keys(enrollCheckMap).filter(id => enrollCheckMap[id]);

    try {
      const json = await fetchWithAuth(`/admin/courses/${selectedCourseObj._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          students: studentList
        })
      });

      if (json.success) {
        setFormMsg({ type: 'success', text: 'Student enrollment list updated successfully!' });
        setTimeout(() => {
          setShowEnrollModal(false);
          loadAllData();
        }, 800);
      } else {
        setFormMsg({ type: 'error', text: json.message || 'Error occurred.' });
      }
    } catch (err) {
      console.error(err);
      setFormMsg({ type: 'error', text: 'Connection error updating enrollment register.' });
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <BookOpen className="h-8 w-8 text-indigo-500" />
            Course Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure subjects registers, enroll students, and link faculty</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer bg-indigo-605"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm max-w-sm">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-455">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by code, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200/60 bg-white/60 pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Courses roster table */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3">Course / Code</th>
                  <th className="py-3">Department</th>
                  <th className="py-3">Sem</th>
                  <th className="py-3">Assigned Faculty</th>
                  <th className="py-3 text-center">Enrolled</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
                {filteredCourses.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 dark:text-slate-300 block">{c.name}</span>
                      <span className="text-[10px] font-mono text-slate-450 uppercase">{c.code}</span>
                    </td>
                    <td className="py-3.5 text-xs font-semibold text-slate-550 dark:text-slate-400">
                      {c.department}
                    </td>
                    <td className="py-3.5 font-bold text-slate-700 dark:text-slate-400 font-mono">
                      {c.semester}
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-350">
                      {c.faculty ? (
                        <div>
                          <span className="font-semibold block">{c.faculty.name}</span>
                          <span className="text-[10px] text-slate-400 block">{c.faculty.email}</span>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-bold text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleOpenEnrollment(c)}
                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-600 dark:text-indigo-400 px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        {c.students.length} Student(s)
                      </button>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="inline-flex rounded-lg p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-850 dark:hover:bg-slate-750 dark:text-slate-400 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="inline-flex rounded-lg p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">No subjects matches query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT COURSE MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-white/20 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button 
              onClick={() => setShowCourseModal(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <BookOpen className="h-5.5 w-5.5 text-indigo-500" />
              {editId ? 'Modify Course details' : 'Register New Course'}
            </h3>

            {formMsg.text && (
              <div className={`mb-5 rounded-2xl border p-4 text-xs font-semibold ${
                formMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
              }`}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Course / Subject Title
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Data Structures & Algorithms"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="CS201"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  required
                  placeholder="Computer Science"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              {/* Assign Instructor dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                  Assign Instructor
                </label>
                <select
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">Select Instructor</option>
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.facultyId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                  Course description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Subject scope, topics, objectives..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-855 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Subject...
                  </>
                ) : (
                  'Save Subject Details'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT ENROLLMENTS MANAGEMENT MODAL */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-white/20 dark:border-slate-805 max-h-[85vh] flex flex-col justify-between">
            {/* Close */}
            <button 
              onClick={() => setShowEnrollModal(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-805 dark:text-slate-200 mb-1">
                Student Enrollment Register
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">Subject: <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedCourseObj?.code} - {selectedCourseObj?.name}</span></p>

              {formMsg.text && (
                <div className={`mb-5 rounded-2xl border p-4 text-xs font-semibold ${
                  formMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                }`}>
                  {formMsg.text}
                </div>
              )}

              {/* Student Checklist roster */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {allStudents.map(student => (
                  <label 
                    key={student._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/25 hover:border-indigo-500/20 cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-250 block">{student.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{student.rollNo} • {student.department}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!enrollCheckMap[student._id]}
                      onChange={() => handleEnrollToggle(student._id)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                  </label>
                ))}
                {allStudents.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No students registered in the system registry.</p>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveEnrollments}
              disabled={formLoading || allStudents.length === 0}
              className="w-full mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Enrollment registers...
                </>
              ) : (
                'Save Enrollments'
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCourses;
