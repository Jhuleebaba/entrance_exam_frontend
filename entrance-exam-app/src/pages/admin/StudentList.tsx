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
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import axios from 'axios';

interface Student {
  examNumber: string;
  fullName: string;
  surname: string;
  firstName: string;
  email: string;
  dateOfBirth?: Date;
  sex?: string;
  stateOfOrigin?: string;
  nationality?: string;
  createdAt: string;
}

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching students');
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedStudent(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Registered Students
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Exam Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Sex</TableCell>
              <TableCell>State of Origin</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={index}>
                <TableCell>{student.fullName}</TableCell>
                <TableCell>{student.examNumber || 'Not assigned'}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.sex || 'Not provided'}</TableCell>
                <TableCell>{student.stateOfOrigin || 'Not provided'}</TableCell>
                <TableCell>{formatDate(student.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    startIcon={<InfoIcon />}
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewDetails(student)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {selectedStudent && (
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentList; 