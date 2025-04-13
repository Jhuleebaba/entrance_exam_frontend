import React, { useRef } from 'react';
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
} from '@mui/material';
import { Download as DownloadIcon, Home as HomeIcon } from '@mui/icons-material';
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
  fullName: string;
  examNumber: string;
  surname?: string;
  firstName?: string;
  email?: string;
  sex?: string;
  stateOfOrigin?: string;
  nationality?: string;
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
  };
}

const ExamReport: React.FC<ExamReportProps> = ({ examData }) => {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

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

  const calculatePercentage = (score: number, total: number) => {
    if (!total) return '0.0';
    return ((score / total) * 100).toFixed(1);
  };

  const determineStatus = (percentage: number) => {
    if (percentage >= 70) return { text: 'Excellent', color: 'success' };
    if (percentage >= 50) return { text: 'Good', color: 'info' };
    if (percentage >= 40) return { text: 'Pass', color: 'warning' };
    return { text: 'Fail', color: 'error' };
  };

  // Calculate subject-wise scores
  const getSubjectScores = () => {
    const subjectScores: Record<string, { score: number; total: number; percentage: number }> = {};
    
    if (!examData.answers || !Array.isArray(examData.answers)) {
      return { 'General': { score: examData.totalScore || 0, total: examData.totalObtainableMarks || 0, percentage: parseFloat(calculatePercentage(examData.totalScore || 0, examData.totalObtainableMarks || 1)) } };
    }
    
    examData.answers.forEach(answer => {
      const subject = answer.question?.subject || 'Unknown';
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
      subjectScores[subject].percentage = parseFloat(((score / total) * 100).toFixed(1));
    });
    
    return subjectScores;
  };

  const subjectScores = getSubjectScores();
  const overallPercentage = parseFloat(calculatePercentage(examData.totalScore, examData.totalObtainableMarks));
  const status = determineStatus(overallPercentage);

  const downloadPdf = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current, {
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

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`GHS-ExamReport-${examData.user.examNumber}.pdf`);
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={downloadPdf}
          sx={{ mr: 2 }}
        >
          Download Exam Report
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/student')}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Card ref={reportRef} sx={{ p: 2, mb: 4 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              GOODLY HERITAGE COMPREHENSIVE HIGH SCHOOL
            </Typography>
            <Typography variant="h6" gutterBottom>
              ENTRANCE EXAMINATION RESULT REPORT
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Personal Details
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 'bold' }}>
                        Exam Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{examData.user.examNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Full Name
                      </TableCell>
                      <TableCell>{examData.user.fullName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Email Address
                      </TableCell>
                      <TableCell>{examData.user.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Sex
                      </TableCell>
                      <TableCell>{examData.user.sex}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        State of Origin
                      </TableCell>
                      <TableCell>{examData.user.stateOfOrigin}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Examination Details
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 'bold' }}>
                        Exam Date
                      </TableCell>
                      <TableCell>{formatDate(examData.startTime)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Start Time
                      </TableCell>
                      <TableCell>{new Date(examData.startTime).toLocaleTimeString()}</TableCell>
                    </TableRow>
                    <TableRow>
  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
    End Time
  </TableCell>
  <TableCell>
    {examData?.endTime
      ? new Date(examData.endTime).toLocaleTimeString()
      : "N/A"}
  </TableCell>
</TableRow>
<TableRow>
  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
    Duration
  </TableCell>
  <TableCell>
    {examData?.endTime && examData?.startTime
      ? Math.round(
          (new Date(examData.endTime).getTime() -
            new Date(examData.startTime).getTime()) / 60000
        ) + " minutes"
      : "N/A"}
  </TableCell>
</TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Subject-wise Scores
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.light' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Obtainable Marks</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(subjectScores).map(([subject, data]) => (
                      <TableRow key={subject}>
                        <TableCell>{subject}</TableCell>
                        <TableCell>{data.score}</TableCell>
                        <TableCell>{data.total}</TableCell>
                        <TableCell>{data.percentage}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{examData.totalScore}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{examData.totalObtainableMarks}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{overallPercentage}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Overall Performance
              </Typography>
              <Box sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4">
                    {overallPercentage}%
                  </Typography>
                  <Chip 
                    label={status.text} 
                    color={status.color as any} 
                    sx={{ fontWeight: 'bold', fontSize: '1rem', padding: 1 }}
                  />
                </Box>
                
                <Typography variant="body1" gutterBottom>
                  <strong>Scored:</strong> {examData.totalScore} out of {examData.totalObtainableMarks} marks
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {overallPercentage >= 70 ? (
                    <Typography variant="body1" color="success.main">
                      Congratulations! You performed excellently in this exam. You are highly likely to be admitted.
                    </Typography>
                  ) : overallPercentage >= 50 ? (
                    <Typography variant="body1" color="info.main">
                      Good performance! You have a strong chance for admission based on your results.
                    </Typography>
                  ) : overallPercentage >= 40 ? (
                    <Typography variant="body1" color="warning.main">
                      You have passed with an acceptable score. Admission will depend on overall competition and available slots.
                    </Typography>
                  ) : (
                    <Typography variant="body1" color="error.main">
                      Your score is below the passing threshold. We encourage you to consider additional preparation and try again.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Next Steps
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" paragraph>
                  1. Admission results will be published within 2 weeks on the school website and notice board.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. If selected, you will need to complete the enrollment process by the deadline stated in your admission letter.
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Be prepared to provide original copies of your documents during enrollment verification.
                </Typography>
                <Typography variant="body2" paragraph>
                  4. For any inquiries, please contact the admission office at admissions@goodlyheritage.edu.ng or call 08012345678.
                </Typography>
                <Typography variant="body2" paragraph>
                  5. Keep this report safe as it may be required during the admission process.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              This is an electronically generated document. No signature required.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Generated on: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExamReport; 