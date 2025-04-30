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
import axios from '../../config/axios';
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
        setLoading(true);
        const token = localStorage.getItem('token');

        // Use axios config to ensure proper base URL is used
        const response = await axios.get(`/api/exam-results/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Exam result response:', response.data);

        // Check if we have a valid response with result data
        if (response.data && (response.data.result || response.data.data)) {
          // Handle both possible response structures
          const resultData = response.data.result || response.data.data;

          // Ensure proper data structure, especially for the user field
          if (typeof resultData.user === 'string') {
            // If user is just an ID, fetch the user data separately
            try {
              const userResponse = await axios.get(`/api/auth/user/${resultData.user}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              resultData.user = userResponse.data.user;
            } catch (userError) {
              console.error('Error fetching user data:', userError);
            }
          }

          setResult(resultData);
          setLoading(false);
          setError('');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error: any) {
        console.error('Error fetching result:', error);
        setError(
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch result. Please try again later.'
        );
        setLoading(false);
      }
    };

    if (id) {
      fetchResult();
    } else {
      setError('Invalid exam result ID');
      setLoading(false);
    }
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
          <Alert severity="error">
            {error}
          </Alert>
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
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">
            No result data found. If you've just completed an exam, it may take a moment to process.
          </Alert>
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

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <ExamReport examData={result} />
      </Box>
    </Container>
  );
};

export default ResultPage; 