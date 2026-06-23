import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Auth views
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Shared views
import Profile from './pages/shared/Profile';

// Student views
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentGrades from './pages/student/StudentGrades';
import Timetable from './pages/student/Timetable';
import StudyMaterials from './pages/student/StudyMaterials';
import Assignments from './pages/student/Assignments';
import AIRecommendations from './pages/student/AIRecommendations';
import ResumeBuilder from './pages/student/ResumeBuilder';
import PlacementPortal from './pages/student/PlacementPortal';

// Faculty views
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyAttendance from './pages/faculty/FacultyAttendance';
import FacultyGrades from './pages/faculty/FacultyGrades';
import FacultyMaterials from './pages/faculty/FacultyMaterials';

// Admin views
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminReports from './pages/admin/AdminReports';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <DashboardLayout>
                    <StudentDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <DashboardLayout>
                    <StudentAttendance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/grades"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <DashboardLayout>
                    <StudentGrades />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/timetable"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <DashboardLayout>
                    <Timetable />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/materials"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <DashboardLayout>
                    <StudyMaterials />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <DashboardLayout>
                    <Assignments />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/ai-recommender"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <DashboardLayout>
                    <AIRecommendations />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/resume-builder"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <DashboardLayout>
                    <ResumeBuilder />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/placements"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <DashboardLayout>
                    <PlacementPortal />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Faculty routes */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <DashboardLayout>
                    <FacultyDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/courses"
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <DashboardLayout>
                    <FacultyDashboard /> {/* Embedded course overview */}
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/attendance"
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <DashboardLayout>
                    <FacultyAttendance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/grades"
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <DashboardLayout>
                    <FacultyGrades />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/materials"
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <DashboardLayout>
                    <FacultyMaterials />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout>
                    <AdminUsers />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout>
                    <AdminCourses />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout>
                    <AdminReports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Shared Profile route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback routes redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
