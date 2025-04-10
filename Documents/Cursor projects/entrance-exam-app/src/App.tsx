import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import ExamPage from './pages/student/ExamPage';
import ResultPage from './pages/student/ResultPage';
import QuestionManagement from './pages/admin/QuestionManagement';
import StudentList from './pages/admin/StudentList';
import ExamResults from './pages/admin/ExamResults';
import Settings from './pages/admin/Settings';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#2e7d32',
    },
  },
});

interface PrivateRouteProps {
  element: React.ReactElement;
  requiredRole?: 'admin' | 'student';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return element;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} requiredRole="admin" />} />
              <Route path="/admin/questions" element={<PrivateRoute element={<QuestionManagement />} requiredRole="admin" />} />
              <Route path="/admin/students" element={<PrivateRoute element={<StudentList />} requiredRole="admin" />} />
              <Route path="/admin/results" element={<PrivateRoute element={<ExamResults />} requiredRole="admin" />} />
              <Route path="/admin/settings" element={<PrivateRoute element={<Settings />} requiredRole="admin" />} />
              
              {/* Student Routes */}
              <Route path="/student" element={<PrivateRoute element={<StudentDashboard />} requiredRole="student" />} />
              <Route path="/student/exam" element={<PrivateRoute element={<ExamPage />} requiredRole="student" />} />
              <Route path="/student/result/:id" element={<PrivateRoute element={<ResultPage />} requiredRole="student" />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
