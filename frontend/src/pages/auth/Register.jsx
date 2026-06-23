import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Hash, Calendar, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science and Engineering',
    rollNo: '',
    batch: '2023-2027',
    semester: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, rollNo, batch } = formData;

    if (!name || !email || !password || !rollNo || !batch) {
      setError('Please fill in all mandatory fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        ...formData,
        role: 'Student' // Registrations are student-only
      });
      navigate('/student', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Check details or roll number.');
    } finally {
      setLoading(false);
    }
  };

  const departmentsList = [
    'Computer Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology'
  ];

  return (
    <div className="bg-gradient-to-tr from-slate-100 to-indigo-50 dark:from-slate-950 dark:to-indigo-950/40 flex min-h-screen w-screen items-center justify-center p-4 py-12">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-8 shadow-2xl transition-all duration-300">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-3">
            <span className="font-sans font-bold text-white text-lg">A</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Create Student Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Register for Academix Student Portal</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Yaswanth Kumar"
                  required
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yaswanth@university.com"
                  required
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 chars"
                  minlength="6"
                  required
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Roll Number / ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Hash className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  placeholder="CSE-2023-045"
                  required
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Batch */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Academic Batch
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="2023-2027"
                  required
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Current Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:text-slate-100"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Department / Major
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:text-slate-100"
            >
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600/50 disabled:opacity-70 disabled:hover:bg-indigo-600 cursor-pointer mt-6"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Register Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200/30 dark:border-slate-800/30 pt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have a Student/Faculty/Admin account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
