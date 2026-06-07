import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout & Route protections
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected dashboard pages
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import NotesSummarizer from './pages/NotesSummarizer';
import QuizGenerator from './pages/QuizGenerator';
import StudyAssistant from './pages/StudyAssistant';
import FocusMode from './pages/FocusMode';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Page Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Page Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Planner />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NotesSummarizer />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <QuizGenerator />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <StudyAssistant />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <FocusMode />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Global Toast Notifications banner */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f0f19',
            color: '#f9fafb',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#0f0f19',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0f0f19',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
