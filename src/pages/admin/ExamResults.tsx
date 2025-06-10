import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from '../../config/axios';
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
  const reportRef = useRef<HTMLDivElement>(null);

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
      const response = await axios.get(`/api/exam-results/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get the data from either data or result property
      const examData = response.data.data || response.data.result;

      // Make sure we have all the required fields with proper defaults
      const processedResult = {
        ...examData,
        user: {
          ...examData.user,
          // Ensure fullName is always available with fallback
          fullName: examData.user.fullName || 
            `${examData.user.firstName || ''} ${examData.user.surname || ''}`.trim() || 
            'Student Name Not Available',
          surname: examData.user.surname || '',
          firstName: examData.user.firstName || '',
          email: examData.user.email || '',
          sex: examData.user.sex || '',
          stateOfOrigin: examData.user.stateOfOrigin || '',
          nationality: examData.user.nationality || ''
        },
        // Ensure answers array exists with proper structure
        answers: Array.isArray(examData.answers) ? examData.answers.map((answer: Answer) => ({
          ...answer,
          question: {
            ...answer.question,
            subject: answer.question?.subject || 'General',
            marks: answer.question?.marks || 1,
          },
          isCorrect: !!answer.isCorrect, // Ensure boolean value
        })) : []
      };

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

  // Download PDF using the ExamReport ref
  const handleDownloadDialogReport = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
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
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`GHS-ExamReport-${selectedResult?.user.examNumber || 'Student'}.pdf`);
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
                        startIcon={loadingReport === result._id ? <CircularProgress size={16} color="inherit" /> : <VisibilityIcon />}
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleViewDetails(result._id)}
                        disabled={loadingReport === result._id}
                      >
                        {loadingReport === result._id ? 'Loading...' : 'View'}
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
            <div ref={reportRef}>
              <ExamReport examData={{ ...selectedResult, answers: selectedResult.answers || [] }} />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {selectedResult && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadDialogReport}
              startIcon={<DownloadIcon />}
            >
              Download PDF
            </Button>
          )}
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