import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, MapPin, Key, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile forms
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Resume builder data (Student only)
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  
  const [education, setEducation] = useState(user?.education || []);
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', year: '', percentage: '' });

  const [experience, setExperience] = useState(user?.experience || []);
  const [newExp, setNewExp] = useState({ company: '', role: '', duration: '', description: '' });

  const [projects, setProjects] = useState(user?.projects || []);
  const [newProj, setNewProj] = useState({ title: '', description: '', technologies: '', link: '' });

  const handleBaseUpdate = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updateData = { phone, address };
      if (password) {
        updateData.password = password;
      }
      await updateProfile(updateData);
      setSuccessMsg('Profile details updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSave = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateProfile({
        skills,
        education,
        experience,
        projects
      });
      setSuccessMsg('Resume portfolio details saved successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Error saving resume details');
    } finally {
      setLoading(false);
    }
  };

  // Skill Add/Remove
  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Education Add/Remove
  const addEducation = () => {
    if (newEdu.institution && newEdu.degree) {
      setEducation([...education, newEdu]);
      setNewEdu({ institution: '', degree: '', year: '', percentage: '' });
    }
  };
  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Experience Add/Remove
  const addExperience = () => {
    if (newExp.company && newExp.role) {
      setExperience([...experience, newExp]);
      setNewExp({ company: '', role: '', duration: '', description: '' });
    }
  };
  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Project Add/Remove
  const addProject = () => {
    if (newProj.title) {
      setProjects([...projects, newProj]);
      setNewProj({ title: '', description: '', technologies: '', link: '' });
    }
  };
  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage credentials and portfolios</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm font-semibold text-rose-600 dark:text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Info Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card & Base Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white text-3xl font-bold shadow-lg shadow-indigo-500/20 mb-4">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{user.name}</h2>
              <span className="mt-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {user.role}
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">{user.email}</p>
            </div>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Department:</span>
                <span className="font-medium text-right text-slate-800 dark:text-slate-200">{user.department}</span>
              </div>
              {user.role === 'Student' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Roll Number:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{user.rollNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Batch:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{user.batch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Semester:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">Semester {user.semester}</span>
                  </div>
                </>
              )}
              {user.role === 'Faculty' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Faculty ID:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{user.facultyId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Designation:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{user.designation || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Update Form & Resume Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Base Form */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" />
              Contact and Security Settings
            </h3>
            
            <form onSubmit={handleBaseUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Residential Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City, State"
                      className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                Update Details
              </button>
            </form>
          </div>

          {/* Student Portfolio Profile (For Resume Builder) */}
          {user.role === 'Student' && (
            <div className="glass-panel rounded-3xl p-6 shadow-sm space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Portfolio Details</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">This information will automatically compile into your downloadable resume.</p>
              </div>

              {/* Skills section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">Professional Skills</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="React, CSS, SQL, Python"
                    className="max-w-xs rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                  <button
                    onClick={addSkill}
                    className="flex items-center gap-1 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 px-4 py-2 text-sm font-semibold transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {skill}
                      <button onClick={() => removeSkill(index)} className="text-red-500 hover:text-red-600 font-bold ml-1">×</button>
                    </span>
                  ))}
                  {skills.length === 0 && <p className="text-xs text-slate-400">No skills added yet.</p>}
                </div>
              </div>

              {/* Education section */}
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">Education Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Institution"
                    value={newEdu.institution}
                    onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Degree/Class"
                    value={newEdu.degree}
                    onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Year Range"
                    value={newEdu.year}
                    onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Score (GPA/%)"
                    value={newEdu.percentage}
                    onChange={(e) => setNewEdu({ ...newEdu, percentage: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>
                <button
                  onClick={addEducation}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Education Entry
                </button>

                <div className="space-y-3 pt-2">
                  {education.map((edu, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/20">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{edu.institution}</h5>
                        <p className="text-[11px] text-slate-500">{edu.degree} | {edu.year} | Marks: {edu.percentage}</p>
                      </div>
                      <button onClick={() => removeEducation(index)} className="text-rose-500 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience section */}
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">Work Experience</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Company/Org"
                    value={newExp.company}
                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={newExp.role}
                    onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 3 Months)"
                    value={newExp.duration}
                    onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>
                <textarea
                  placeholder="Responsibilities / Projects worked on"
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  rows="2"
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                />
                <button
                  onClick={addExperience}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Experience Entry
                </button>

                <div className="space-y-3 pt-2">
                  {experience.map((exp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/20">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.company} - {exp.role}</h5>
                        <p className="text-[11px] text-slate-500">{exp.duration} | {exp.description}</p>
                      </div>
                      <button onClick={() => removeExperience(index)} className="text-rose-500 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects section */}
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">Projects</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={newProj.title}
                    onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Technologies (e.g. React, Node)"
                    value={newProj.technologies}
                    onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Project Link (GitHub/Live)"
                    value={newProj.link}
                    onChange={(e) => setNewProj({ ...newProj, link: e.target.value })}
                    className="rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>
                <textarea
                  placeholder="Short project description..."
                  value={newProj.description}
                  onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                  rows="2"
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100"
                />
                <button
                  onClick={addProject}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Project Entry
                </button>

                <div className="space-y-3 pt-2">
                  {projects.map((proj, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/20">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{proj.title}</h5>
                        <p className="text-[11px] text-slate-500">{proj.technologies} | {proj.description}</p>
                        {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 font-semibold">{proj.link}</a>}
                      </div>
                      <button onClick={() => removeProject(index)} className="text-rose-500 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button for Resume Profile */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <button
                  onClick={handleResumeSave}
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Save Portfolio Details
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
