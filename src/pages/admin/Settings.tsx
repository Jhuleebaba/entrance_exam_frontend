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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from '../../config/axios';

const Settings = () => {
  const [examDuration, setExamDuration] = useState<number>(120);
  const [examInstructions, setExamInstructions] = useState<string>(
    `Welcome to the Goodly Heritage School Entrance Examination.\n\n` +
    `IMPORTANT INSTRUCTIONS:\n\n` +
    `1. You have 120 minutes to complete this exam.\n` +
    `2. The exam consists of multiple-choice questions covering Mathematics, English, and General Knowledge.\n` +
    `3. Read each question carefully before selecting your answer.\n` +
    `4. You may navigate between questions using the Next and Previous buttons.\n` +
    `5. Use the "Mark for Review" feature if you want to come back to a question later.\n` +
    `6. Click "Submit Exam" when you have completed all questions.\n` +
    `7. Do not refresh the page or navigate away during the exam as this may result in lost answers.\n` +
    `8. If you experience any technical issues, contact the exam supervisor immediately.\n\n` +
    `Good luck!`
  );
  const [examStartDate, setExamStartDate] = useState<string>('');
  const [examStartTime, setExamStartTime] = useState<string>('09:00');
  const [examGroupSize, setExamGroupSize] = useState<number>(10);
  const [examGroupIntervalHours, setExamGroupIntervalHours] = useState<number>(2);
  const [totalExamQuestions, setTotalExamQuestions] = useState<number>(60);
  const [examReportNextSteps, setExamReportNextSteps] = useState<string>(
    `NEXT STEPS AFTER COMPLETING THE ENTRANCE EXAM:\n\n` +
    `1. Print a copy of your exam results for your records.\n` +
    `2. Check your email regularly for additional communication from the school.\n` +
    `3. Admission decisions will be announced within two weeks of the exam date.\n` +
    `4. If admitted, you will need to complete the enrollment process by submitting:\n` +
    `   - Birth certificate\n` +
    `   - Previous school records\n` +
    `   - Medical forms\n` +
    `   - School fees deposit\n` +
    `5. Orientation for new students will be held one week before the start of the term.\n` +
    `6. For any questions about your results or the admission process, please contact the school office at admissions@goodlyheritage.edu.`
  );
  const [examSlipInstructions, setExamSlipInstructions] = useState<string>(
    `1. Please arrive at the exam venue at least 30 minutes before your scheduled time.\n` +
    `2. Bring this registration slip, a valid ID card, and writing materials.\n` +
    `3. Your login credentials: Exam Number and Password (your surname).\n` +
    `4. Mobile phones and electronic devices are not allowed during the exam.\n` +
    `5. Dress appropriately in accordance with the school dress code.\n` +
    `6. In case of any emergency on the day of the exam, contact: 08012345678.\n` +
    `7. For any inquiries, please contact the school administration.`
  );
  const [examVenue, setExamVenue] = useState<string>('Goodly Heritage Comprehensive High School');
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // New state for managing subjects
  const [subjects, setSubjects] = useState<{name: string, questions: number}[]>([
    { name: 'Mathematics', questions: 20 },
    { name: 'English', questions: 20 },
    { name: 'General Knowledge', questions: 20 }
  ]);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectQuestions, setNewSubjectQuestions] = useState<number>(20);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found. Please log in again.');
          return;
        }
        
        console.log('[Frontend-Settings] Fetching settings...');
        
        const response = await axios.get('/api/auth/settings', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // 10 second timeout
        });

        console.log('[Frontend-Settings] Received settings:', response.data);
        
        // The API returns { success: true, settings: {...} }
        const settings = response.data.settings || response.data;

        // Update state with fetched settings
        const updates = {
          examDuration: settings.examDurationMinutes || 120,
          examInstructions: settings.examInstructions || examInstructions,
          examReportNextSteps: settings.examReportNextSteps || examReportNextSteps,
          examSlipInstructions: settings.examSlipInstructions || examSlipInstructions,
          examVenue: settings.examVenue || examVenue,
          totalExamQuestions: settings.totalExamQuestions || 100, // Fixed to 100 questions
        };

        // Batch state updates to prevent multiple re-renders
        setExamDuration(updates.examDuration);
        setExamInstructions(updates.examInstructions);
        setExamReportNextSteps(updates.examReportNextSteps);
        setExamSlipInstructions(updates.examSlipInstructions);
        setExamVenue(updates.examVenue);
        setTotalExamQuestions(updates.totalExamQuestions);

        // Handle date formatting
        if (settings.examStartDate) {
          const date = new Date(settings.examStartDate);
          if (!isNaN(date.getTime())) {
            setExamStartDate(date.toISOString().split('T')[0]);
          }
        } else {
          // Set current date as fallback
          const today = new Date();
          setExamStartDate(today.toISOString().split('T')[0]);
        }

        setExamStartTime(settings.examStartTime || '09:00');
        setExamGroupSize(settings.examGroupSize || 10);
        setExamGroupIntervalHours(settings.examGroupIntervalHours || 2);

        // Note: Subjects are now fixed and not configurable
        console.log('[Frontend-Settings] Settings loaded successfully');
        
      } catch (error: any) {
        console.error('[Frontend-Settings] Error fetching settings:', error);
        
        // More specific error handling
        if (error.code === 'ECONNABORTED') {
          setError('Request timed out. Please check your connection and try again.');
        } else if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          // Settings not found - use defaults without showing error
          console.log('[Frontend-Settings] Settings not found, using defaults');
          const today = new Date();
          setExamStartDate(today.toISOString().split('T')[0]);
        } else {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch settings';
          setError(`Failed to load settings: ${errorMessage}`);
        }

        // Set current date as fallback for exam start date
        const today = new Date();
        setExamStartDate(today.toISOString().split('T')[0]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Convert subjects array to Map/Object for the backend
      const subjectsMap: Record<string, number> = {};
      subjects.forEach(subject => {
        subjectsMap[subject.name] = subject.questions;
      });
      
      // Calculate total questions based on subjects
      const calculatedTotalQuestions = subjects.reduce((sum, subject) => sum + subject.questions, 0);
      
      const requestBody = {
        examDurationMinutes: examDuration,
        examInstructions,
        examStartDate: examStartDate ? new Date(examStartDate).toISOString() : null,
        examStartTime,
        examGroupSize,
        examGroupIntervalHours,
        examReportNextSteps,
        examSlipInstructions,
        examVenue,
        totalExamQuestions: calculatedTotalQuestions,
        questionsPerSubject: subjectsMap
      };
      
      console.log('[Frontend-Settings] Token:', token);
      console.log('[Frontend-Settings] Request URL:', '/api/auth/settings');
      console.log('[Frontend-Settings] Request Headers:', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      console.log('[Frontend-Settings] Request Body:', JSON.stringify(requestBody, null, 2));
      
      const response = await axios.put('/api/auth/settings',
        requestBody,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          validateStatus: function (status) {
            return status < 500; // Resolve only if the status code is less than 500
          }
        }
      );
      
      console.log('[Frontend-Settings] Response Status:', response.status);
      console.log('[Frontend-Settings] Response Headers:', response.headers);
      console.log('[Frontend-Settings] Response Data:', response.data);
      
      if (response.status === 200 && response.data && response.data.success) {
        setSuccess('Settings updated successfully');
        // Trigger a refresh in other components
        window.dispatchEvent(new Event('settingsUpdated'));
      } else {
        console.error('[Frontend-Settings] Save response did not indicate success:', response.data);
        const errorMessage = response.data?.message || 'Settings update failed. Please try again.';
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('[Frontend-Settings] Error updating settings:', error);
      console.error('[Frontend-Settings] Error response:', error.response?.data);
      console.error('[Frontend-Settings] Error status:', error.response?.status);
      console.error('[Frontend-Settings] Error config:', error.config);
      
      let errorMessage = 'Failed to update settings: ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new subject
  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      setError('Subject name cannot be empty');
      return;
    }
    
    // Check if subject already exists
    if (subjects.some(subject => subject.name.toLowerCase() === newSubjectName.toLowerCase())) {
      setError('Subject already exists');
      return;
    }
    
    setSubjects([...subjects, { 
      name: newSubjectName.trim(), 
      questions: newSubjectQuestions || 20 
    }]);
    
    // Reset input fields
    setNewSubjectName('');
    setNewSubjectQuestions(20);
    setError('');
  };

  // Handle removing a subject
  const handleRemoveSubject = (index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects);
  };

  // Handle updating question count for a subject
  const handleUpdateQuestions = (index: number, questions: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index].questions = questions;
    setSubjects(updatedSubjects);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading settings...</Typography>
        </Box>
      </Container>
    );
  }

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

          <Grid item xs={12} md={6}>
            <TextField
              label="Exam Venue"
              value={examVenue}
              onChange={(e) => setExamVenue(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Enter the venue for the entrance exam"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Exam Configuration</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure the exam settings below. Note that subjects are fixed and cannot be modified.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              The exam consists of 5 fixed subjects:
              <ul>
                <li>Mathematics (20 questions)</li>
                <li>English (20 questions)</li>
                <li>Verbal Reasoning (20 questions)</li>
                <li>Quantitative Reasoning (20 questions)</li>
                <li>General Paper (20 questions)</li>
              </ul>
              Total: 100 questions
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Exam Duration (minutes)"
                  type="number"
                  value={examDuration}
                  onChange={(e) => setExamDuration(Number(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Exam Instructions"
                  multiline
                  rows={4}
                  value={examInstructions}
                  onChange={(e) => setExamInstructions(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
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
            <Typography variant="h6" gutterBottom>Exam Slip Instructions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              These instructions will appear on the exam registration slip that students receive and print.
            </Typography>
            <TextField
              label="Exam Slip Instructions"
              multiline
              rows={6}
              value={examSlipInstructions}
              onChange={(e) => setExamSlipInstructions(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Enter instructions for the exam slip..."
              helperText="Format as a numbered list (e.g., '1. Arrive 30 minutes early...')"
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
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave} 
            size="large"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings; 