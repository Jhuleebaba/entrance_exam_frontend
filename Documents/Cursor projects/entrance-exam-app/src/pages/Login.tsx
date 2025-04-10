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
  IconButton,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import axios from '../config/axios';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    examNumber: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const toggleAdminLogin = () => {
    setIsAdminLogin(!isAdminLogin);
    setFormData({
      examNumber: '',
      email: '',
      password: '',
    });
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const loginData = isAdminLogin
        ? { email: formData.email, password: formData.password }
        : { examNumber: formData.examNumber, password: formData.password };

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
        
        login(response.data.token, userData);
        
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error.response || error);
      setError(error.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton
          onClick={toggleAdminLogin}
          color={isAdminLogin ? 'primary' : 'default'}
          sx={{ 
            backgroundColor: isAdminLogin ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
            '&:hover': {
              backgroundColor: isAdminLogin ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <AdminPanelSettingsIcon />
        </IconButton>
      </Box>

      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            {isAdminLogin ? 'Admin Login' : 'Student Login'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {isAdminLogin ? (
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                helperText="Enter your admin email"
              />
            ) : (
              <TextField
                fullWidth
                label="Exam Number"
                name="examNumber"
                value={formData.examNumber}
                onChange={handleChange}
                margin="normal"
                required
                helperText="Enter your exam number"
              />
            )}
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText={isAdminLogin ? "Enter your admin password" : "Enter your surname as password"}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 