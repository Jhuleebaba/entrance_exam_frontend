import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  Home as HomeIcon,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/ghs_logo.png';

// Constants
const PDF_SCALE = 2;
const SNACKBAR_DURATION = 6000;
const DEFAULT_SUBJECTS = {
    'Mathematics': { score: 0, total: 20, percentage: 0 },
    'English': { score: 0, total: 20, percentage: 0 },
    'Quantitative Reasoning': { score: 0, total: 20, percentage: 0 },
    'Verbal Reasoning': { score: 0, total: 20, percentage: 0 },
    'General Paper': { score: 0, total: 20, percentage: 0 }
};

// Types
interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    subject: string;
    marks: number;
}

interface Answer {
    question: Question;
    selectedAnswer: string;
    isCorrect: boolean;
}

interface User {
    fullName: string;
    examNumber: string;
    surname?: string;
    firstName?: string;
    email?: string;
    sex?: string;
    stateOfOrigin?: string;
    nationality?: string;
}

interface SubjectScore {
    score: number;
    total: number;
    percentage: number;
}

interface ExamReportProps {
    examData: {
        _id: string;
        user: User;
        totalScore: number;
        totalQuestions: number;
        totalObtainableMarks: number;
        startTime: string;
        endTime?: string;
        completed: boolean;
        answers: Answer[];
        nextSteps?: string;
    };
}

const ExamReport: React.FC<ExamReportProps> = ({ examData }) => {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubjectDetails, setShowSubjectDetails] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';

    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const calculatePercentage = (score: number, total: number): string => {
    if (!total) return '0.0';
    return ((score / total) * 100).toFixed(1);
  };

  const determineStatus = (percentage: number): { text: string; color: 'success' | 'info' | 'warning' | 'error' } => {
    if (percentage >= 70) return { text: 'Excellent', color: 'success' };
    if (percentage >= 50) return { text: 'Good', color: 'info' };
    if (percentage >= 40) return { text: 'Pass', color: 'warning' };
    return { text: 'Fail', color: 'error' };
  };

  const getSubjectScores = (): Record<string, SubjectScore> => {
    const subjectScores: Record<string, SubjectScore> = { ...DEFAULT_SUBJECTS };

    if (!examData.answers || !Array.isArray(examData.answers) || examData.answers.length === 0) {
      console.log('No answers found, creating sample subject distribution');
      
      const totalScore = examData.totalScore || 0;
      const totalMarks = examData.totalObtainableMarks || 150;
      
      if (totalScore > 0) {
        const scorePerQuestion = totalScore / totalMarks;
        Object.keys(subjectScores).forEach((subject) => {
          const subjectScore = Math.round(scorePerQuestion * subjectScores[subject].total);
          subjectScores[subject].score = subjectScore;
          subjectScores[subject].percentage = parseFloat(calculatePercentage(subjectScore, subjectScores[subject].total));
        });
      }
      
      return subjectScores;
    }

    examData.answers.forEach(answer => {
      try {
        if (!answer.question) {
          console.warn('Answer missing question data:', answer);
          return;
        }

        const subject = answer.question.subject;
        const marks = answer.question.marks || 1;

        if (subject in subjectScores) {
          if (answer.isCorrect) {
            subjectScores[subject].score += marks;
          }
        }
      } catch (error) {
        console.error('Error processing answer:', error);
      }
    });

    Object.keys(subjectScores).forEach((subject) => {
      const { score, total } = subjectScores[subject];
      subjectScores[subject].percentage = parseFloat(calculatePercentage(score, total));
    });

    return subjectScores;
  };

  const subjectScores = getSubjectScores();
  // Debug: log the calculated subject scores
  console.log('ExamReport: subjectScores =', subjectScores);
  const overallPercentage = parseFloat(calculatePercentage(examData.totalScore, examData.totalObtainableMarks));
  const status = determineStatus(overallPercentage);

  const downloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setError(null);
      
      if (!reportRef.current) {
        throw new Error('Report content not found');
      }

      const canvas = await html2canvas(reportRef.current, {
        scale: PDF_SCALE,
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
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`GHS-Exam-Report-${examData.user.examNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubjectClick = (subject: string) => {
    setSelectedSubject(subject);
    setShowSubjectDetails(true);
  };

  const renderSubjectDetails = () => {
    if (!selectedSubject) return null;

    const subjectData = subjectScores[selectedSubject];
    const answers = examData.answers.filter(a => a.question.subject === selectedSubject);

    return (
      <Dialog
        open={showSubjectDetails}
        onClose={() => setShowSubjectDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSubject} Performance Details
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Score: {subjectData.score} / {subjectData.total} ({subjectData.percentage}%)
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={subjectData.percentage} 
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Your Answer</TableCell>
                    <TableCell>Correct Answer</TableCell>
                    <TableCell>Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {answers.map((answer, index) => (
                    <TableRow key={index}>
                      <TableCell>{answer.question.question}</TableCell>
                      <TableCell>{answer.selectedAnswer}</TableCell>
                      <TableCell>{answer.question.correctAnswer}</TableCell>
                      <TableCell>
                        <Chip 
                          label={answer.isCorrect ? 'Correct' : 'Incorrect'} 
                          color={answer.isCorrect ? 'success' : 'error'} 
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubjectDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {isGeneratingPdf && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1000,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Paper ref={reportRef} elevation={3} sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img
            src={logo}
            alt="School Logo"
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))'
            }} 
          />
          <Typography variant="h5" component="h1" sx={{ mt: 1, color: 'primary.main', fontWeight: 'bold' }}>
            GOODLY HERITAGE COMPREHENSIVE HIGH SCHOOL
          </Typography>
          <Typography variant="h6" component="h2" sx={{ color: 'text.secondary' }}>
            ENTRANCE EXAMINATION RESULT REPORT
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Student Information
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Full Name</TableCell>
                        <TableCell sx={{ py: 1 }}>{examData.user.fullName}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Exam Number</TableCell>
                        <TableCell sx={{ py: 1 }}>{examData.user.examNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Date of Exam</TableCell>
                        <TableCell sx={{ py: 1 }}>{formatDate(examData.startTime)}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Status</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip
                            label={status.text}
                            color={status.color as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Subject-wise Performance
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }} align="right">Score</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }} align="right">Maximum</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }} align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(subjectScores).map(([subject, scores]) => (
                        subject !== 'Overall Score' && (
                        <TableRow key={subject}>
                            <TableCell sx={{ py: 1 }}>{subject}</TableCell>
                            <TableCell sx={{ py: 1 }} align="right">{scores.score}</TableCell>
                            <TableCell sx={{ py: 1 }} align="right">{scores.total}</TableCell>
                            <TableCell sx={{ py: 1 }} align="right">{scores.percentage}%</TableCell>
                        </TableRow>
                        )
                      ))}
                      <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }} align="right">{examData.totalScore}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }} align="right">{examData.totalObtainableMarks}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 1 }} align="right">{overallPercentage}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Overall Performance
                </Typography>
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {overallPercentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Score: {examData.totalScore} / {examData.totalObtainableMarks}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

            <Grid item xs={12}>
              <Card>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Next Steps
                  </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.3 }}>
                  {examData.nextSteps || 
                   "1. Print a copy of your exam results for your records.\n" +
                   "2. Check your email regularly for additional communication from the school.\n" +
                   "3. Admission decisions will be announced within two weeks of the exam date."}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Tooltip title="Download exam report as PDF">
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadPdf}
              disabled={isGeneratingPdf}
            >
              Download PDF
            </Button>
          </Tooltip>
          <Tooltip title="Return to home page">
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              Home
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {renderSubjectDetails()}

      <Snackbar
        open={!!error}
        autoHideDuration={SNACKBAR_DURATION}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExamReport; 