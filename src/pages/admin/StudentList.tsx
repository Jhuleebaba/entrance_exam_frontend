import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import {
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ReceiptLong as ReceiptIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import axios from '../../config/axios';
import ExamSlip from '../../components/ExamSlip';

interface Student {
  examNumber: string;
  fullName: string;
  surname: string;
  firstName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  sex?: string;
  stateOfOrigin?: string;
  nationality?: string;
  createdAt: string;
  examGroup?: number;
  examDateTime?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Students API response:', JSON.stringify(response.data, null, 2));

      if (response.data.students && response.data.students.length > 0) {
        console.log('First student data:', JSON.stringify(response.data.students[0], null, 2));
        console.log('Phone number type:', typeof response.data.students[0].phoneNumber);
        console.log('Phone number value:', response.data.students[0].phoneNumber);
        console.log('Phone number exists:', 'phoneNumber' in response.data.students[0]);

        // Type the API response data
        const apiStudents: Student[] = response.data.students;

        // Process students to ensure phone numbers are displayed correctly
        const processedStudents = apiStudents.map(student => ({
          ...student,
          phoneNumber: String(student.phoneNumber || '').trim() || 'Not provided'
        }));

        setStudents(processedStudents);
      } else {
        setStudents([]);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching students');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
    setTabValue(0);
  };

  const handleViewExamSlip = (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
    setTabValue(1);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedStudent(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // handler to archive year data and download archive
  const handleArchiveYear = async () => {
    try {
      setIsArchiving(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/auth/archive-year', {}, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `archive_${new Date().getFullYear()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      // refresh list (should now be empty)
      fetchStudents();
    } catch (err) {
      console.error('Archive year error:', err);
      setError('Failed to archive year data');
    } finally {
      setIsArchiving(false);
      setShowArchiveConfirm(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Registered Students
        </Typography>
        <Box>
          <Tooltip title="Refresh students list">
            <IconButton onClick={fetchStudents} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Archive year data">
            <IconButton onClick={() => setShowArchiveConfirm(true)} color="warning">
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Exam Number</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Sex</TableCell>
                <TableCell>State of Origin</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No students registered yet
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.examNumber || student.email}>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.examNumber || 'Not assigned'}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phoneNumber}</TableCell>
                    <TableCell>{student.sex || 'Not provided'}</TableCell>
                    <TableCell>{student.stateOfOrigin || 'Not provided'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          startIcon={<InfoIcon />}
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(student)}
                        >
                          Details
                        </Button>
                        <Button
                          startIcon={<ReceiptIcon />}
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleViewExamSlip(student)}
                        >
                          Exam Slip
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="student details tabs">
              <Tab label="Student Details" id="student-tab-0" />
              <Tab label="Exam Slip" id="student-tab-1" />
            </Tabs>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedStudent && (
            <>
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Full Name</Typography>
                    <Typography variant="body1" gutterBottom>{selectedStudent.fullName}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Exam Number</Typography>
                    <Typography variant="body1" gutterBottom>{selectedStudent.examNumber || 'Not assigned'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Email</Typography>
                    <Typography variant="body1" gutterBottom>{selectedStudent.email}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Phone Number</Typography>
                    <Typography variant="body1" gutterBottom>{selectedStudent.phoneNumber}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Date of Birth</Typography>
                    <Typography variant="body1" gutterBottom>{formatDate(selectedStudent.dateOfBirth as unknown as string)}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Sex</Typography>
                    <Typography variant="body1" gutterBottom>{selectedStudent.sex || 'Not provided'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">State of Origin</Typography>
                    <Typography variant="body1" gutterBottom>{selectedStudent.stateOfOrigin || 'Not provided'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Nationality</Typography>
                    <Typography variant="body1" gutterBottom>{selectedStudent.nationality || 'Not provided'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Registration Date</Typography>
                    <Typography variant="body1" gutterBottom>{formatDate(selectedStudent.createdAt)}</Typography>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <ExamSlip student={selectedStudent} onClose={handleCloseDetails} />
              </TabPanel>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive Year Confirmation Dialog */}
      <Dialog open={showArchiveConfirm} onClose={() => setShowArchiveConfirm(false)}>
        <DialogTitle>Archive and Reset Year</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to archive this year's student and exam data? This will download an archive file and clear current records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowArchiveConfirm(false)}>Cancel</Button>
          <Button onClick={handleArchiveYear} variant="contained" color="warning" startIcon={isArchiving ? <CircularProgress size={20} /> : <ArchiveIcon />} disabled={isArchiving}>
            {isArchiving ? 'Archiving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentList; 