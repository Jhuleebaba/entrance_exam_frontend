import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { Download as DownloadIcon, Login as LoginIcon } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface RegistrationConfirmationProps {
  userData: {
    examNumber: string;
    surname: string;
    firstName: string;
    fullName: string;
    email: string;
    sex: string;
    stateOfOrigin: string;
    examGroup: number;
    examDateTime: string;
  };
}

const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({ userData }) => {
  const navigate = useNavigate();
  const confirmationRef = useRef<HTMLDivElement>(null);

  const handleContinue = () => {
    navigate('/login');
  };

  const formatDateTime = (dateTime: string) => {
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

  const downloadPdf = () => {
    if (confirmationRef.current) {
      html2canvas(confirmationRef.current, {
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

        pdf.save(`GHS-Registration-${userData.examNumber}.pdf`);
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
          Download Registration Slip
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LoginIcon />}
          onClick={handleContinue}
        >
          Continue to Login
        </Button>
      </Box>

      <Card ref={confirmationRef} sx={{ p: 2, mb: 4 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              GOODLY HERITAGE COMPREHENSIVE HIGH SCHOOL
            </Typography>
            <Typography variant="h6" gutterBottom>
              ENTRANCE EXAMINATION REGISTRATION SLIP
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
                        Surname
                      </TableCell>
                      <TableCell>{userData.surname}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        First Name
                      </TableCell>
                      <TableCell>{userData.firstName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Email Address
                      </TableCell>
                      <TableCell>{userData.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Sex
                      </TableCell>
                      <TableCell>{userData.sex}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        State of Origin
                      </TableCell>
                      <TableCell>{userData.stateOfOrigin}</TableCell>
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
                        Exam Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{userData.examNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Exam Date & Time
                      </TableCell>
                      <TableCell>{formatDateTime(userData.examDateTime)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Exam Group
                      </TableCell>
                      <TableCell>Group {(userData.examGroup || 0) + 1}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Exam Venue
                      </TableCell>
                      <TableCell>Goodly Heritage Comprehensive High School</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Important Notes
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" paragraph>
                  1. Please arrive at the exam venue at least 30 minutes before your scheduled time.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. Bring this registration slip, a valid ID card, and writing materials.
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Your login credentials: Exam Number and Password (your surname).
                </Typography>
                <Typography variant="body2" paragraph>
                  4. Mobile phones and electronic devices are not allowed during the exam.
                </Typography>
                <Typography variant="body2" paragraph>
                  5. For any inquiries, please contact the school administration.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              This is an electronically generated document. No signature required.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Registration Date: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegistrationConfirmation; 