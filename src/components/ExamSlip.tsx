import React, { useRef, useEffect, useState } from 'react';
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
    CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from '../config/axios';

interface ExamSlipProps {
    student: {
        examNumber: string;
        surname: string;
        firstName: string;
        fullName: string;
        email: string;
        phoneNumber?: string;
        sex?: string;
        stateOfOrigin?: string;
        nationality?: string;
        dateOfBirth?: string | Date;
        examGroup?: number;
        examDateTime?: string;
    };
    showButtons?: boolean;
    onClose?: () => void;
}

const ExamSlip: React.FC<ExamSlipProps> = ({ student, showButtons = true, onClose }) => {
    const slipRef = useRef<HTMLDivElement>(null);
    const [examSlipInstructions, setExamSlipInstructions] = useState<string>('');
    const [examVenue, setExamVenue] = useState<string>('Goodly Heritage Comprehensive High School');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/auth/settings', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const settings = response.data;
                setExamSlipInstructions(settings.examSlipInstructions || '');
                setExamVenue(settings.examVenue || examVenue);
            } catch (error) {
                console.error('Error fetching exam slip settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [examVenue]);

    const formatDateTime = (dateTime?: string) => {
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

    const formatDate = (dateStr?: string | Date) => {
        if (!dateStr) return 'Not provided';

        // Convert Date object to date string if needed
        const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const downloadPdf = () => {
        if (slipRef.current) {
            setIsLoading(true);
            html2canvas(slipRef.current, {
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

                pdf.save(`GHS-Exam-Slip-${student.examNumber}.pdf`);
                setIsLoading(false);
            });
        }
    };

    const handlePrint = () => {
        if (slipRef.current) {
            html2canvas(slipRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');

                // Create a new window and print it
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`
            <html>
              <head>
                <title>Exam Slip - ${student.examNumber}</title>
                <style>
                  body { margin: 0; padding: 20px; }
                  img { max-width: 100%; height: auto; }
                  @media print {
                    body { margin: 0; padding: 0; }
                  }
                </style>
              </head>
              <body>
                <img src="${imgData}" alt="Exam Slip" />
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                      setTimeout(function() { window.close(); }, 500);
                    }, 200);
                  }
                </script>
              </body>
            </html>
          `);
                    printWindow.document.close();
                }
            });
        }
    };

    const formatInstructions = (instructionsText: string) => {
        if (!instructionsText) return null;

        // Split by new lines and render each line as a separate paragraph
        return instructionsText.split('\n').map((line, index) => (
            <Typography key={index} variant="body2" paragraph>
                {line}
            </Typography>
        ));
    };

    if (isLoading && !examSlipInstructions) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {showButtons && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={downloadPdf}
                        sx={{ mr: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Download PDF'}
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        sx={{ mr: 2 }}
                    >
                        Print
                    </Button>

                    {onClose && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    )}
                </Box>
            )}

            <Card ref={slipRef} sx={{ p: 2, mb: 4 }}>
                <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            GOODLY HERITAGE COMPREHENSIVE HIGH SCHOOL
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            ENTRANCE EXAMINATION SLIP
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
                                            <TableCell>{student.surname || 'Not provided'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                First Name
                                            </TableCell>
                                            <TableCell>{student.firstName || 'Not provided'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Email Address
                                            </TableCell>
                                            <TableCell>{student.email || 'Not provided'}</TableCell>
                                        </TableRow>
                                        {student.phoneNumber && (
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    Phone Number
                                                </TableCell>
                                                <TableCell>{student.phoneNumber}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Date of Birth
                                            </TableCell>
                                            <TableCell>{formatDate(student.dateOfBirth)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Sex
                                            </TableCell>
                                            <TableCell>{student.sex || 'Not provided'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                State of Origin
                                            </TableCell>
                                            <TableCell>{student.stateOfOrigin || 'Not provided'}</TableCell>
                                        </TableRow>
                                        {student.nationality && (
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    Nationality
                                                </TableCell>
                                                <TableCell>{student.nationality}</TableCell>
                                            </TableRow>
                                        )}
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
                                            <TableCell sx={{ fontWeight: 'bold' }}>{student.examNumber || 'Not assigned'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Exam Date & Time
                                            </TableCell>
                                            <TableCell>{formatDateTime(student.examDateTime)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Exam Group
                                            </TableCell>
                                            <TableCell>Group {student.examGroup ? student.examGroup + 1 : 'Not assigned'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Exam Venue
                                            </TableCell>
                                            <TableCell>{examVenue}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                                Important Instructions
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                {formatInstructions(examSlipInstructions)}
                            </Paper>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                            This is an electronically generated document. No signature required.
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Printed on: {new Date().toLocaleDateString()}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ExamSlip; 