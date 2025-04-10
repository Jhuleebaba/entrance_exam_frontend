import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Box, 
  Paper,
  Grid,
  Divider 
} from '@mui/material';
import axios from 'axios';

const Settings = () => {
  const [examDuration, setExamDuration] = useState<number>(120);
  const [examInstructions, setExamInstructions] = useState<string>('');
  const [examStartDate, setExamStartDate] = useState<string>('');
  const [examStartTime, setExamStartTime] = useState<string>('09:00');
  const [examGroupSize, setExamGroupSize] = useState<number>(10);
  const [examGroupIntervalHours, setExamGroupIntervalHours] = useState<number>(2);
  const [examReportNextSteps, setExamReportNextSteps] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setExamDuration(response.data.examDurationMinutes);
        setExamInstructions(response.data.examInstructions || '');
        setExamReportNextSteps(response.data.examReportNextSteps || '');
        
        // Format the date for the date input
        if (response.data.examStartDate) {
          const date = new Date(response.data.examStartDate);
          setExamStartDate(date.toISOString().split('T')[0]);
        }
        
        setExamStartTime(response.data.examStartTime || '09:00');
        setExamGroupSize(response.data.examGroupSize || 10);
        setExamGroupIntervalHours(response.data.examGroupIntervalHours || 2);
      } catch (error: any) {
        console.error('Error fetching settings:', error);
        setError('Failed to fetch settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/settings', 
        { 
          examDurationMinutes: examDuration, 
          examInstructions,
          examStartDate: new Date(examStartDate),
          examStartTime,
          examGroupSize,
          examGroupIntervalHours,
          examReportNextSteps
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Settings updated successfully');
    } catch (error: any) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Exam Settings</Typography>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>General Exam Settings</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Exam Duration (minutes)"
              type="number"
              value={examDuration}
              onChange={(e) => setExamDuration(Number(e.target.value))}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Exam Scheduling</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure when exams start and how students are grouped for testing sessions.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Exam Start Date"
              type="date"
              value={examStartDate}
              onChange={(e) => setExamStartDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Exam Start Time"
              type="time"
              value={examStartTime}
              onChange={(e) => setExamStartTime(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Students Per Group"
              type="number"
              value={examGroupSize}
              onChange={(e) => setExamGroupSize(Number(e.target.value))}
              fullWidth
              margin="normal"
              helperText="Number of students that can take the exam at the same time"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Hours Between Groups"
              type="number"
              value={examGroupIntervalHours}
              onChange={(e) => setExamGroupIntervalHours(Number(e.target.value))}
              fullWidth
              margin="normal"
              helperText="Hours between consecutive exam groups"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Exam Instructions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              These instructions will be shown to students before they start the exam.
            </Typography>
            <TextField
              label="Instructions"
              multiline
              rows={8}
              value={examInstructions}
              onChange={(e) => setExamInstructions(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Enter exam instructions here..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Exam Report Next Steps</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              This content will appear in the "Next Steps" section of student exam reports.
            </Typography>
            <TextField
              label="Next Steps Content"
              multiline
              rows={6}
              value={examReportNextSteps}
              onChange={(e) => setExamReportNextSteps(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Enter guidance for students after exam completion..."
              helperText="Format as a numbered list (e.g., '1. First step...')"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={handleSave} size="large">
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings; 