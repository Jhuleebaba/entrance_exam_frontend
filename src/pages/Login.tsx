import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    examNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginData = {
        examNumber: formData.examNumber,
        password: formData.password
      };

      console.log('Sending login request with:', loginData);
      const response = await axios.post('/api/auth/login', loginData);
      console.log('Login response:', response.data);

      if (response.data.success) {
        const userData = {
          examNumber: response.data.user.examNumber,
          fullName: response.data.user.fullName,
          email: response.data.user.email,
          role: response.data.user.role,
        };

        if (response.data.user.role === 'admin') {
          // Redirect admins to admin login page instead
          setError('Please use the admin login page');
          setIsLoading(false);
          return;
        }

        login(response.data.token, userData);
        navigate('/student');
      }
    } catch (error: any) {
      console.error('Login error:', error.response || error);
      setError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Student Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Exam Number"
              name="examNumber"
              value={formData.examNumber}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Enter your exam number"
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Enter your surname as password"
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 