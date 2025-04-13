import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Download as DownloadIcon,
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import axios from 'axios';
import ExamReport from '../../components/ExamReport';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Answer {
  question: {
    question: string;
    options: string[];
    correctAnswer: string;
    subject: string;
    marks: number;
  };
  selectedAnswer: string;
  isCorrect: boolean;
}

interface User {
  _id: string;
  examNumber: string;
  fullName: string;
  surname?: string;
  firstName?: string;
  email?: string;
  sex?: string;
  stateOfOrigin?: string;
  nationality?: string;
}

interface ExamResult {
  _id: string;
  user: User;
  totalScore: number;
  totalQuestions: number;
  totalObtainableMarks: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
  answers?: Answer[];
}

const ExamResults = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/exam-results/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data.results);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching results');
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleViewDetails = async (id: string) => {
    try {
      setLoadingReport(id);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/exam-results/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Get the data from either data or result property
      const examData = response.data.data || response.data.result;
      
      // Make sure we have all the required fields with proper defaults
      const processedResult = {
        ...examData,
        user: {
          ...examData.user,
          // Provide default values for user fields that might be missing
          surname: examData.user.surname || '',
          firstName: examData.user.firstName || '',
          email: examData.user.email || '',
          sex: examData.user.sex || '',
          stateOfOrigin: examData.user.stateOfOrigin || '',
          nationality: examData.user.nationality || ''
        },
        // Ensure answers array exists with proper structure
        answers: Array.isArray(examData.answers) ? examData.answers.map((answer: { question: any }) => ({
          ...answer,
          question: {
            ...answer.question,
            subject: answer.question?.subject || 'General',

const processedAnswers = Array.isArray(examData.answers)
  ? examData.answers.map((answer: Answer) => ({
      ...answer,
      question: {
        ...answer.question,
        marks: answer.question?.marks || 1
      },
      isCorrect: !!answer.isCorrect // Ensure boolean value
    }))
  : [];
      
      setSelectedResult(processedResult);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching result details:', error);
      setError('Error loading exam result details. Please try again.');
    } finally {
      setLoadingReport(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedResult(null);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  const calculatePercentage = (score: number, total: number) => {
    return ((score / total) * 100).toFixed(1);
  };

  const handleResetExam = async (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setShowResetConfirm(true);
  };

  const confirmResetExam = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/exam-results/admin-reset/${selectedUser.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess(`Exam status reset successfully for ${selectedUser.name}`);
        fetchResults(); // Refresh the results
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error resetting exam status');
    } finally {
      setShowResetConfirm(false);
      setSelectedUser(null);
    }
  };

  // Generate and download PDF report directly
  const handleDownloadReport = async (examId: string) => {
    try {
      setLoadingReport(examId);
      // Fetch the detailed exam result
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/exam-results/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Also fetch the settings to get the custom next steps
      const settingsResponse = await axios.get('/api/auth/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const examData = response.data.data || response.data.result;
      const settings = settingsResponse.data;
      
      if (!examData) {
        throw new Error('No exam data found');
      }
      
      // Get the next steps from settings or use default
      const nextStepsContent = settings.examReportNextSteps || `1. Admission results will be published within 2 weeks on the school website and notice board.
2. If selected, you will need to complete the enrollment process by the deadline stated in your admission letter.
3. Be prepared to provide original copies of your documents during enrollment verification.
4. For any inquiries, please contact the admission office at admissions@goodlyheritage.edu.ng or call 08012345678.`;
      
      // Convert the next steps string to HTML paragraphs
      const nextStepsHtml = nextStepsContent
        .split('\n')
        .map(line => `<p style="margin: 5px 0;">${line}</p>`)
        .join('');
      
      // Create a hidden div to render the report
      const reportContainer = document.createElement('div');
      reportContainer.style.position = 'absolute';
      reportContainer.style.left = '-9999px';
      document.body.appendChild(reportContainer);
      
      // Get student data with fallbacks
      const examNumber = examData.user?.examNumber || 'N/A';
      const surname = examData.user?.surname || 'N/A';
      const firstName = examData.user?.firstName || 'N/A';
      const email = examData.user?.email || 'N/A';
      const sex = examData.user?.sex || 'N/A';
      const stateOfOrigin = examData.user?.stateOfOrigin || 'N/A';
      const nationality = examData.user?.nationality || 'N/A';
      const score = examData.totalScore || 0;
      const totalMarks = examData.totalObtainableMarks || 0;
      const percentage = totalMarks ? ((score / totalMarks) * 100).toFixed(1) : '0.0';
      const isPassing = parseFloat(percentage) >= 40;
      
      // Sort subjects alphabetically, but ensure core subjects come first
      const subjectOrder = ['Mathematics', 'English', 'Science', 'General Knowledge'];
      
      // Calculate subject-wise scores
      const subjectScores: Record<string, { score: number; total: number; percentage: number }> = {};
      
      if (examData.answers && Array.isArray(examData.answers)) {
        // First initialize standard subject containers with zeros
        subjectOrder.forEach(subject => {
          subjectScores[subject] = { score: 0, total: 0, percentage: 0 };
        });
        
        // Then populate with actual scores
        examData.answers.forEach((answer: any) => {
          const subject = answer.question?.subject || 'General Knowledge';
          const marks = answer.question?.marks || 1;
          
          if (!subjectScores[subject]) {
            subjectScores[subject] = { score: 0, total: 0, percentage: 0 };
          }
          
          subjectScores[subject].total += marks;
          if (answer.isCorrect) {
            subjectScores[subject].score += marks;
          }
        });
        
        // Calculate percentages
        Object.keys(subjectScores).forEach(subject => {
          const { score, total } = subjectScores[subject];
          if (total > 0) {
            subjectScores[subject].percentage = parseFloat(((score / total) * 100).toFixed(1));
          }
        });
      } else {
        // If no answers array, create default subjects with even distribution
        const subjectsCount = 4; // Standard number of subjects
        const scorePerSubject = Math.floor(score / subjectsCount);
        const marksPerSubject = Math.floor(totalMarks / subjectsCount);
        
        subjectOrder.forEach(subject => {
          subjectScores[subject] = {
            score: scorePerSubject,
            total: marksPerSubject,
            percentage: marksPerSubject > 0 ? parseFloat(((scorePerSubject / marksPerSubject) * 100).toFixed(1)) : 0
          };
        });
      }
      
      // Generate subject scores table rows based on preferred order
      let subjectScoresHTML = '';
      
      // First add the standard subjects in the correct order
      subjectOrder.forEach(subject => {
        if (subjectScores[subject]) {
          const data = subjectScores[subject];
          subjectScoresHTML += `
            <tr>
              <td>${subject}</td>
              <td>${data.score}</td>
              <td>${data.total}</td>
              <td>${data.percentage}%</td>
            </tr>
          `;
        }
      });
      
      // Then add any other subjects not in the standard list
      Object.entries(subjectScores)
        .filter(([subject]) => !subjectOrder.includes(subject))
        .sort((a, b) => a[0].localeCompare(b[0])) // Sort alphabetically
        .forEach(([subject, data]) => {
          subjectScoresHTML += `
            <tr>
              <td>${subject}</td>
              <td>${data.score}</td>
              <td>${data.total}</td>
              <td>${data.percentage}%</td>
            </tr>
          `;
        });
      
      // Render the ExamReport component to the hidden div
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0;">GOODLY HERITAGE COMPREHENSIVE HIGH SCHOOL</h1>
            <h2 style="margin: 0;">ENTRANCE EXAMINATION RESULT REPORT</h2>
          </div>
          <hr/>
          <div style="margin-top: 20px;">
            <h3>Personal Details</h3>
            <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
              <tr>
                <th style="width: 40%; text-align: left;">Exam Number</th>
                <td><strong>${examNumber}</strong></td>
              </tr>
              <tr>
                <th style="text-align: left;">Surname</th>
                <td>${surname}</td>
              </tr>
              <tr>
                <th style="text-align: left;">First Name</th>
                <td>${firstName}</td>
              </tr>
              <tr>
                <th style="text-align: left;">Email</th>
                <td>${email}</td>
              </tr>
              <tr>
                <th style="text-align: left;">Sex</th>
                <td>${sex}</td>
              </tr>
              <tr>
                <th style="text-align: left;">State of Origin</th>
                <td>${stateOfOrigin}</td>
              </tr>
              <tr>
                <th style="text-align: left;">Nationality</th>
                <td>${nationality}</td>
              </tr>
            </table>
            
            <h3>Subject Scores</h3>
            <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="text-align: left;">Subject</th>
                  <th style="text-align: left;">Score</th>
                  <th style="text-align: left;">Total Marks</th>
                  <th style="text-align: left;">Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${subjectScoresHTML}
                <tr style="background-color: #e6e6e6; font-weight: bold;">
                  <td>Total</td>
                  <td>${score}</td>
                  <td>${totalMarks}</td>
                  <td>${percentage}%</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Overall Result</h3>
            <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
              <tr>
                <th style="text-align: left;">Percentage</th>
                <td><strong>${percentage}%</strong></td>
              </tr>
              <tr>
                <th style="text-align: left;">Status</th>
                <td style="color: ${isPassing ? 'green' : 'red'}; font-weight: bold">
                  ${isPassing ? 'PASS' : 'FAIL'}
                </td>
              </tr>
            </table>

            <div style="margin-top: 30px; border: 1px solid #ddd; padding: 15px; background-color: #f9f9f9;">
              <h4 style="margin-top: 0;">Next Steps</h4>
              ${nextStepsHtml}
            </div>

            <p style="margin-top: 40px; text-align: center; font-size: 12px;">
              This is an electronically generated document. No signature required.<br>
              Generated on: ${new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      `;
      reportContainer.appendChild(tempDiv);
      
      // Use html2canvas to capture the rendered component
      html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`GHS-ExamReport-${examNumber}.pdf`);
        
        // Clean up
        document.body.removeChild(reportContainer);
        setLoadingReport(null);
      }).catch(err => {
        console.error('PDF generation error:', err);
        setError('Failed to generate PDF report: ' + err.message);
        setLoadingReport(null);
      });
    } catch (error: any) {
      console.error('Error downloading report:', error);
      setError('Failed to download exam report: ' + (error.message || 'Unknown error'));
      setLoadingReport(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Exam Results
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Exam Number</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Percentage</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result._id}>
                <TableCell>{result.user.fullName}</TableCell>
                <TableCell>{result.user.examNumber}</TableCell>
                <TableCell>
                  {result.completed ? (
                    `${result.totalScore}/${result.totalObtainableMarks}`
                  ) : (
                    'In Progress'
                  )}
                </TableCell>
                <TableCell>
                  {result.completed ? (
                    `${calculatePercentage(result.totalScore, result.totalObtainableMarks)}%`
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={result.completed ? 'Completed' : 'In Progress'}
                    color={result.completed ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(result.startTime)}</TableCell>
                <TableCell>
                  {result.endTime ? formatDate(result.endTime) : 'Not completed'}
                </TableCell>
                <TableCell>
                  {result.completed ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        startIcon={<VisibilityIcon />}
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleViewDetails(result._id)}
                        disabled={loadingReport === result._id}
                      >
                        View
                      </Button>
                      <Button
                        startIcon={<DownloadIcon />}
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleDownloadReport(result._id)}
                        disabled={loadingReport === result._id}
                      >
                        Report
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      startIcon={<RefreshIcon />}
                      variant="outlined"
                      color="warning"
                      size="small"
                      onClick={() => handleResetExam(result.user._id, result.user.fullName)}
                    >
                      Reset Status
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>
          Exam Result Details {selectedResult ? `- ${selectedResult.user.fullName}` : ''}
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            selectedResult.answers && selectedResult.answers.length > 0 ? (
              <ExamReport examData={selectedResult} />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Result Information
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" sx={{ width: '40%', fontWeight: 'bold' }}>Student Name</TableCell>
                        <TableCell>{selectedResult.user.fullName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>Exam Number</TableCell>
                        <TableCell>{selectedResult.user.examNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>Score</TableCell>
                        <TableCell>{selectedResult.totalScore}/{selectedResult.totalObtainableMarks}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                        <TableCell>{calculatePercentage(selectedResult.totalScore, selectedResult.totalObtainableMarks)}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell>
                          <Chip 
                            label={selectedResult.completed ? "Completed" : "In Progress"} 
                            color={selectedResult.completed ? "success" : "warning"} 
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Alert severity="info">
                  Detailed answer information is not available for this exam result. You can still download a basic report using the "Report" button in the actions column.
                </Alert>
              </Box>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
        <DialogTitle>Reset Exam Status</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the exam status for {selectedUser?.name}?
            This will clear their ongoing exam and allow them to start fresh.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetConfirm(false)}>Cancel</Button>
          <Button onClick={confirmResetExam} variant="contained" color="warning">
            Reset Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamResults; 