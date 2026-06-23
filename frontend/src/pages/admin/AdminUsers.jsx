import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, Edit, Trash2, X, Search, Loader2 } from 'lucide-react';

const AdminUsers = () => {
  const { fetchWithAuth } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // null means "Create", otherwise "Update"
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    department: 'Computer Science and Engineering',
    rollNo: '',
    batch: '2023-2027',
    semester: 1,
    facultyId: '',
    designation: 'Associate Professor',
    phone: '',
    address: ''
  });

  const loadUsers = async () => {
    try {
      const url = roleFilter ? `/admin/users?role=${roleFilter}` : '/admin/users';
      const json = await fetchWithAuth(url);
      if (json.success) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Student',
      department: 'Computer Science and Engineering',
      rollNo: '',
      batch: '2023-2027',
      semester: 1,
      facultyId: '',
      designation: 'Associate Professor',
      phone: '',
      address: ''
    });
    setFormMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (userObj) => {
    setEditId(userObj._id);
    setFormData({
      name: userObj.name || '',
      email: userObj.email || '',
      password: '', // Keep blank unless resetting
      role: userObj.role || 'Student',
      department: userObj.department || 'Computer Science and Engineering',
      rollNo: userObj.rollNo || '',
      batch: userObj.batch || '2023-2027',
      semester: userObj.semester || 1,
      facultyId: userObj.facultyId || '',
      designation: userObj.designation || 'Associate Professor',
      phone: userObj.phone || '',
      address: userObj.address || ''
    });
    setFormMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg({ type: '', text: '' });

    try {
      const method = editId ? 'PUT' : 'POST';
      const endpoint = editId ? `/admin/users/${editId}` : '/admin/users';
      
      const payload = { ...formData };
      // Delete password field on edit if empty
      if (editId && !payload.password) {
        delete payload.password;
      }

      const json = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (json.success) {
        setFormMsg({ type: 'success', text: json.message || 'Saved successfully!' });
        setTimeout(() => {
          setShowModal(false);
          loadUsers();
        }, 800);
      } else {
        setFormMsg({ type: 'error', text: json.message || 'Error occurred.' });
      }
    } catch (err) {
      console.error(err);
      setFormMsg({ type: 'error', text: 'Connection error communicating with user API.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user account? All attendance, grades, and submissions mapping details will be erased.')) return;
    try {
      const json = await fetchWithAuth(`/admin/users/${id}`, {
        method: 'DELETE'
      });
      if (json.success) {
        loadUsers();
      } else {
        alert(json.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error deleting user');
    }
  };

  // Search filter
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.rollNo && u.rollNo.toLowerCase().includes(search.toLowerCase())) ||
    (u.facultyId && u.facultyId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Users className="h-8 w-8 text-indigo-500" />
            User Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage, register and edit student, faculty or admin accounts</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer bg-indigo-605"
        >
          <Plus className="h-4 w-4" />
          Add User Account
        </button>
      </div>

      {/* Filters Panel */}
      <div className="glass-panel rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-450">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, roll, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200/60 bg-white/60 pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
          />
        </div>

        {/* Role select */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="Student">Students Only</option>
            <option value="Faculty">Faculty Only</option>
            <option value="Admin">Admins Only</option>
          </select>
        </div>

      </div>

      {/* Roster list */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-105 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3">Name / Email</th>
                  <th className="py-3">ID / Roll No</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Department</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 dark:text-slate-300 block">{u.name}</span>
                      <span className="text-xs text-slate-450">{u.email}</span>
                    </td>
                    <td className="py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {u.role === 'Student' ? u.rollNo : u.role === 'Faculty' ? u.facultyId : 'N/A'}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        u.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-650' :
                        u.role === 'Faculty' ? 'bg-emerald-500/10 text-emerald-650' :
                        'bg-amber-500/10 text-amber-650'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {u.department}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="inline-flex rounded-lg p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="inline-flex rounded-lg p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">No user accounts found matching query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl relative border border-white/20 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Users className="h-5.5 w-5.5 text-indigo-500" />
              {editId ? 'Modify User Profile' : 'Register New User'}
            </h3>

            {formMsg.text && (
              <div className={`mb-5 rounded-2xl border p-4 text-xs font-semibold ${
                formMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
              }`}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Role Type
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={!!editId} // Cannot change role type once registered
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    required
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@university.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Password (Mandatory for create, optional/blank for edit) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password {editId && '(Leave blank to keep unchanged)'}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!editId}
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              {/* Role specific forms */}
              {formData.role === 'Student' && (
                <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        name="rollNo"
                        required
                        placeholder="CSE-001"
                        value={formData.rollNo}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Batch Range
                      </label>
                      <input
                        type="text"
                        name="batch"
                        required
                        placeholder="2023-2027"
                        value={formData.batch}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Semester
                      </label>
                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {formData.role === 'Faculty' && (
                <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Faculty ID
                      </label>
                      <input
                        type="text"
                        name="facultyId"
                        required
                        placeholder="FAC-CSE-01"
                        value={formData.facultyId}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="designation"
                        required
                        placeholder="Professor"
                        value={formData.designation}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving profile registers...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
