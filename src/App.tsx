import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import theme from './theme';
import logo from './assets/ghs_logo.png';

// Student/Public components
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';

// Admin components 
import AdminLogin from './pages/admin/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import ExamPage from './pages/student/ExamPage';
import ResultPage from './pages/student/ResultPage';
import QuestionManagement from './pages/admin/QuestionManagement';
import StudentList from './pages/admin/StudentList';
import RegisterStudent from './pages/admin/RegisterStudent';
import ExamResults from './pages/admin/ExamResults';
import Settings from './pages/admin/Settings';
import { useAuth } from './contexts/AuthContext';
import './App.css';

interface PrivateRouteProps {
  element: React.ReactElement;
  requiredRole?: 'admin' | 'student';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to the appropriate login based on the required role
    return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/login'} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If admin tries to access student route, send to admin dashboard
    if (user?.role === 'admin' && requiredRole === 'student') {
      return <Navigate to="/admin" />;
    }
    // If student tries to access admin route, send to student dashboard
    if (user?.role === 'student' && requiredRole === 'admin') {
      return <Navigate to="/student" />;
    }
    // Otherwise just go to home
    return <Navigate to="/" />;
  }

  return element;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Watermark and content wrapper */}
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        {/* Watermark background */}
        <Box
          component="img"
          src={logo}
          alt="Watermark"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.05,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        {/* Foreground content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Router>
            <Routes>
              {/* Admin Routes (completely separate section) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/questions" element={<AdminLayout><QuestionManagement /></AdminLayout>} />
              <Route path="/admin/students" element={<AdminLayout><StudentList /></AdminLayout>} />
              <Route path="/admin/register" element={<AdminLayout><RegisterStudent /></AdminLayout>} />
              <Route path="/admin/results" element={<AdminLayout><ExamResults /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />

              {/* Public/Student Routes with Navbar */}
              <Route path="/*" element={
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Landing />} />
                      <Route path="/login" element={<Login />} />

                      {/* Student Routes */}
                      <Route path="/student" element={<PrivateRoute element={<StudentDashboard />} requiredRole="student" />} />
                      <Route path="/student/exam" element={<PrivateRoute element={<ExamPage />} requiredRole="student" />} />
                      <Route path="/student/result/:id" element={<PrivateRoute element={<ResultPage />} requiredRole="student" />} />

                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              } />
            </Routes>
          </Router>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
