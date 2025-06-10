import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PeopleOutline,
  QuestionAnswer,
  Assessment,
  Build as BuildIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import axios from 'axios';

interface DashboardStats {
  totalStudents: number;
  totalQuestions: number;
  completedExams: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalQuestions: 0,
    completedExams: 0,
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Fetching dashboard stats...');
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found in localStorage');
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      console.log('Using headers:', headers);

      const [studentsRes, questionsRes, examsRes] = await Promise.all([
        axios.get('/api/auth/students', { headers }),
        axios.get('/api/questions', { headers }),
        axios.get('/api/exam-results/all', { headers }),
      ]);

      console.log('API Responses:', {
        students: studentsRes.data,
        questions: questionsRes.data,
        exams: examsRes.data,
      });

      setStats({
        totalStudents: studentsRes.data.count || 0,
        totalQuestions: questionsRes.data.count || 0,
        completedExams: examsRes.data.results?.filter((r: any) => r.completed).length || 0,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error.response || error);
      setError(error.response?.data?.message || 'Error loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardItems = [
    {
      title: 'Register Student',
      count: null,
      icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
      link: '/admin/register',
      color: '#d32f2f',
    },
    {
      title: 'Registered Students',
      count: stats.totalStudents,
      icon: <PeopleOutline sx={{ fontSize: 40 }} />,
      link: '/admin/students',
      color: '#1976d2',
    },
    {
      title: 'Question Bank',
      count: stats.totalQuestions,
      icon: <QuestionAnswer sx={{ fontSize: 40 }} />,
      link: '/admin/questions',
      color: '#2e7d32',
    },
    {
      title: 'Completed Exams',
      count: stats.completedExams,
      icon: <Assessment sx={{ fontSize: 40 }} />,
      link: '/admin/results',
      color: '#ed6c02',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Tooltip title="Refresh dashboard data">
          <IconButton onClick={fetchStats} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {dashboardItems.map((item) => (
              <Grid item xs={12} md={3} key={item.title}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: `${item.color}15`,
                          borderRadius: '50%',
                          p: 1,
                          mr: 2,
                          color: item.color,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="h6" component="div">
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" gutterBottom>
                      {item.count}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={RouterLink}
                      to={item.link}
                      size="small"
                      color="primary"
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    component={RouterLink}
                    to="/admin/register"
                    variant="contained"
                    color="error"
                    startIcon={<PersonAddIcon />}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Register New Student
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/admin/questions"
                    variant="contained"
                    color="primary"
                  >
                    Manage Questions
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/admin/students"
                    variant="contained"
                    color="secondary"
                  >
                    View Students
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/admin/results"
                    variant="contained"
                    color="success"
                  >
                    View Results
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <Typography color="textSecondary">
                  Active Exams: {stats.completedExams}
                </Typography>
                <Typography color="textSecondary">
                  Questions Available: {stats.totalQuestions}
                </Typography>
                <Typography color="textSecondary">
                  Registered Students: {stats.totalStudents}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard; 