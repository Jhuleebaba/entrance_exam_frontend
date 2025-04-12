import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import axios from 'axios';
import ExamReport from '../../components/ExamReport';

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
  surname: string;
  firstName: string;
  email: string;
  sex: string;
  stateOfOrigin: string;
  nationality: string;
}

interface ExamResult {
  _id: string;
  user: User;
  totalScore: number;
  totalQuestions: number;
  totalObtainableMarks: number;
  startTime: string;
  endTime: string;
  completed: boolean;
  answers: Answer[];
}

const ResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/exam-results/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Ensure the result data is properly formatted
        if (response.data.data) {
          setResult(response.data.data);
        } else if (response.data.result) {
          setResult(response.data.result);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/student')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Use the new ExamReport component */}
        <ExamReport examData={result} />
      </Box>
    </Container>
  );
};

export default ResultPage; 