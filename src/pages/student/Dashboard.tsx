import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface ExamResult {
  _id: string;
  completed: boolean;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasActiveExam, setHasActiveExam] = useState(false);
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [examInstructions, setExamInstructions] = useState<string>('');
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [isResettingExam, setIsResettingExam] = useState(false);
  const [isLoadingExamStatus, setIsLoadingExamStatus] = useState(true);

  const fetchExamStatus = async () => {
    try {
      setIsLoadingExamStatus(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/exam-results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        const results = response.data.results || [];
        setHasActiveExam(results.some((result: ExamResult) => !result.completed));
      }
    } catch (error: any) {
      console.error('Error fetching exam status:', error);
      setError(error.response?.data?.message || 'Error checking exam status');
    } finally {
      setIsLoadingExamStatus(false);
    }
  };

  const fetchExamSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/exam-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.examInstructions) {
        setExamInstructions(response.data.examInstructions);
      }
    } catch (error: any) {
      console.error('Error fetching exam settings:', error);
      // Don't set an error message as this isn't critical
    }
  };

  useEffect(() => {
    fetchExamStatus();
    fetchExamSettings();
  }, []);

  const handleStartExam = async () => {
    try {
      setIsStartingExam(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/exam-results/start',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Exam started successfully, navigate to exam page
        navigate('/student/exam');
      }
    } catch (error: any) {
      console.error('Error starting exam:', error);
      setError(error.response?.data?.message || 'Failed to start exam');
    } finally {
      setIsStartingExam(false);
    }
  };

  const handleResetExam = async () => {
    try {
      setIsResettingExam(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/exam-results/reset',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setResetSuccess(true);
        setHasActiveExam(false);
        setShowResetConfirm(false);
      }
    } catch (error: any) {
      console.error('Error resetting exam:', error);
      setError(error.response?.data?.message || 'Failed to reset exam status');
    } finally {
      setIsResettingExam(false);
    }
  };

  // Format the exam date and time
  const formatExamDateTime = (dateTime: string | null | undefined) => {
    if (!dateTime) return 'Not scheduled yet';
    
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate time remaining until exam
  const getTimeRemaining = (dateTime: string | null | undefined) => {
    if (!dateTime) return 'Not scheduled yet';
    
    const examDate = new Date(dateTime);
    const now = new Date();
    
    if (examDate <= now) {
      return 'Exam is now available';
    }
    
    const diffTime = Math.abs(examDate.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} days, ${diffHours} hours`;
    } else if (diffHours > 0) {
      return `${diffHours} hours, ${diffMinutes} minutes`;
    } else {
      return `${diffMinutes} minutes`;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {resetSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Exam status has been reset successfully. You can now start a new exam.
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Entrance Examination
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {hasActiveExam
                    ? 'You have an ongoing examination. Please complete it or reset if stuck.'
                    : 'Start your entrance examination when you are ready.'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button
                  startIcon={isStartingExam ? <CircularProgress size={20} /> : <StartIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleStartExam}
                  disabled={hasActiveExam || isStartingExam || isLoadingExamStatus}
                  size="large"
                >
                  {isStartingExam ? 'Starting...' : hasActiveExam ? 'Exam in Progress' : 'Start Exam'}
                </Button>
                {hasActiveExam && (
                  <Button
                    startIcon={<RefreshIcon />}
                    variant="outlined"
                    color="warning"
                    onClick={() => setShowResetConfirm(true)}
                    disabled={isLoadingExamStatus}
                  >
                    Reset Exam Status
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Exam Schedule
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    <strong>Scheduled time:</strong> {formatExamDateTime(user?.examDateTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    <strong>Time remaining:</strong> {getTimeRemaining(user?.examDateTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    <strong>Exam group:</strong> Group {(user?.examGroup || 0) + 1}
                  </Typography>
                </Box>
                <Chip 
                  label={hasActiveExam ? "Started" : "Not Started"} 
                  color={hasActiveExam ? "success" : "primary"} 
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 4, p: 3 }}>
          
          {examInstructions.split('\n').map((instruction, index) => (
            <Typography key={index} paragraph>
              {instruction}
            </Typography>
          ))}
        </Paper>

        <Dialog open={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
          <DialogTitle>Reset Exam Status</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to reset your exam status? This will clear any ongoing exam and allow you to start fresh.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResetConfirm(false)} disabled={isResettingExam}>
              Cancel
            </Button>
            <Button 
              onClick={handleResetExam} 
              variant="contained" 
              color="warning"
              disabled={isResettingExam}
              startIcon={isResettingExam ? <CircularProgress size={20} /> : null}
            >
              {isResettingExam ? 'Resetting...' : 'Reset Status'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default StudentDashboard; 