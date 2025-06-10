import React, { useRef, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Divider,
    CircularProgress,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Tooltip
} from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from '../config/axios';
import logo from '../assets/ghs_logo.png';

// Constants
const DEFAULT_EXAM_VENUE = 'School Hall, Goodly Heritage Comprehensive High School, Lagos';
const PDF_SCALE = 2;
const SNACKBAR_DURATION = 6000;

// Types
interface Student {
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
}

interface ExamSlipProps {
    student: Student;
    showButtons?: boolean;
    onClose?: () => void;
}

const ExamSlip: React.FC<ExamSlipProps> = ({ student, showButtons = true, onClose }) => {
    const slipRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [examVenue, setExamVenue] = useState<string>(DEFAULT_EXAM_VENUE);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Hardcoded exam slip instructions
    const examSlipInstructions = `1. Please arrive at the examination venue at least 30 minutes before the scheduled time.
2. Bring this exam slip with you (printed or digital copy).
3. No electronic devices (phones, calculators, smartwatches) are allowed in the exam hall.
4. Wear your school uniform or formal attire.
5. Parents/guardians can drop off candidates but will not be allowed into the examination halls.
6. Ensure you have had adequate rest and breakfast before the exam.
7. For any inquiries, please contact the Admission Office at goodlyheritageschools@gmail.com
8. Contact us locally and on WhatsApp on: 08054100257, 09070469544 and 08119666657.`;
    console.log('ExamSlip received student:', JSON.stringify(student, null, 2));
    console.log('ExamSlip phone number:', student.phoneNumber);
    console.log('ExamSlip phone number type:', typeof student.phoneNumber);

    useEffect(() => {
        // Venue is now hardcoded - no need to fetch from backend
        setExamVenue('School Hall, Goodly Heritage Comprehensive High School, Lagos');
    }, []);

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
        const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const downloadPdf = async () => {
        if (!slipRef.current) {
            setError('Failed to generate PDF: Content not found');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const canvas = await html2canvas(slipRef.current, {
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
            pdf.save(`GHS-Exam-Slip-${student.examNumber}.pdf`);
            setSuccess('Exam slip downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = async () => {
        if (!slipRef.current) {
            setError('Failed to open print preview: Content not found');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const canvas = await html2canvas(slipRef.current, {
                scale: PDF_SCALE,
                logging: false,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const printWindow = window.open('', '_blank');
            
            if (!printWindow) {
                throw new Error('Failed to open print window');
            }

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Exam Slip - ${student.examNumber}</title>
                        <style>
                            body { margin: 0; padding: 0; }
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
            setSuccess('Print window opened successfully!');
        } catch (error) {
            console.error('Error generating print preview:', error);
            setError('Failed to open print preview. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatInstructions = (instructionsText: string) => {
        if (!instructionsText || instructionsText.trim() === '') {
            return (
                <Typography variant="body1" color="error">
                    No instructions available. Please contact an administrator to configure exam instructions.
                </Typography>
            );
        }

        // Split by new lines and render each line as a separate paragraph
        return instructionsText.split('\n').map((line, index) => (
            <Typography key={index} variant="body1" paragraph sx={{ my: 0.5 }}>
                {line}
            </Typography>
        ));
    };

    // Fix any missing fields in student data - pre-process for display
    const enhancedStudent = {
        ...student,
        phoneNumber: String(student.phoneNumber || '').trim() || 'Not provided',
        nationality: student.nationality || 'Nigerian',
        examGroup: student.examGroup !== undefined ? student.examGroup : 0
    };

    console.log('Enhanced student phone number:', enhancedStudent.phoneNumber);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative' }}>
            {isLoading && (
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
            
            <Paper ref={slipRef} elevation={3} sx={{ p: 3, position: 'relative' }}>
                {/* Watermark */}
                <Box
                    component="img"
                    src={logo}
                    alt="Watermark"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.05,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
                <div>
                    {/* Header: logo on left, titles on right */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                            component="img"
                            src={logo}
                            alt="Logo"
                            sx={{ 
                                height: 90, 
                                mr: 2,
                                filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))'
                            }}
                        />
                        <Box>
                            <Typography
                                variant="h4"
                                gutterBottom
                                sx={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', mb: 1 }}
                            >
                                GOODLY HERITAGE COMPREHENSIVE HIGH SCHOOL
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ fontFamily: 'Georgia, serif' }}
                            >
                                2025 ENTRANCE EXAMINATION SLIP
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                        {/* Personal details section */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom sx={{ backgroundColor: '#FFA07A', p: 1, borderRadius: 1, fontWeight: 'bold' }}>
                                Personal Details
                            </Typography>
                            <div>
                                <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: '#FAF0E6' }}>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                                                    Surname
                                                </TableCell>
                                                <TableCell>{enhancedStudent.surname || 'Not provided'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    First Name
                                                </TableCell>
                                                <TableCell>{enhancedStudent.firstName || 'Not provided'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    Email
                                                </TableCell>
                                                <TableCell>{enhancedStudent.email || 'Not provided'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    Phone
                                                </TableCell>
                                                <TableCell>{enhancedStudent.phoneNumber || 'Not provided'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    Date of Birth
                                                </TableCell>
                                                <TableCell>{formatDate(enhancedStudent.dateOfBirth)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    Sex
                                                </TableCell>
                                                <TableCell>{enhancedStudent.sex || 'Not provided'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    State of Origin
                                                </TableCell>
                                                <TableCell>{enhancedStudent.stateOfOrigin || 'Not provided'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                    Nationality
                                                </TableCell>
                                                <TableCell>{enhancedStudent.nationality || 'Not provided'}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </Grid>

                        {/* Examination details section */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom sx={{ backgroundColor: '#FFA07A', p: 1, borderRadius: 1, fontWeight: 'bold' }}>
                                Examination Details
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: '#FAF0E6' }}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                                                Exam Number
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{enhancedStudent.examNumber || 'Not assigned'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Exam Date & Time
                                            </TableCell>
                                            <TableCell>{formatDateTime(enhancedStudent.examDateTime)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                Exam Group
                                            </TableCell>
                                            <TableCell>Group {enhancedStudent.examGroup ? enhancedStudent.examGroup + 1 : '1 (Default)'}</TableCell>
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

                        {/* Instructions section */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ backgroundColor: '#FFA07A', p: 1, borderRadius: 1, fontWeight: 'bold', mt: 1 }}>
                                Important Instructions
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#FAF0E6' }}>
                                {formatInstructions(examSlipInstructions)}
                            </Paper>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                            This is an electronically generated document. No signature required.
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Printed on: {new Date().toLocaleDateString()}
                        </Typography>
                    </Box>
                </div>
            </Paper>

            {showButtons && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Tooltip title="Download exam slip as PDF">
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={downloadPdf}
                            disabled={isLoading}
                        >
                            Download PDF
                        </Button>
                    </Tooltip>
                    <Tooltip title="Print exam slip">
                        <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                            disabled={isLoading}
                        >
                            Print
                        </Button>
                    </Tooltip>
                </Box>
            )}

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

            <Snackbar
                open={!!success}
                autoHideDuration={SNACKBAR_DURATION}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ExamSlip; 