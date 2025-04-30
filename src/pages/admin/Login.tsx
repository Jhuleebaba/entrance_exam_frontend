import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Alert,
    CircularProgress,
} from '@mui/material';
import axios from '../../config/axios';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
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

        if (!formData.email || !formData.password) {
            setError('Please enter email and password');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            console.log('Login response:', response.data);

            if (response.data.success) {
                const userData = response.data.user;

                // Check if user is admin
                if (userData.role !== 'admin') {
                    setError('Access denied. Admin privileges required.');
                    setIsLoading(false);
                    return;
                }

                // Store token and user data
                login(response.data.token, userData);

                // Redirect to admin dashboard
                navigate('/admin');
            }
        } catch (error: any) {
            console.error('Login error:', error);

            let errorMessage = 'Login failed';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (!error.response) {
                errorMessage = 'Network error - please check your connection';
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom color="primary">
                        Admin Login
                    </Typography>

                    <Typography variant="subtitle1" align="center" gutterBottom color="textSecondary" sx={{ mb: 3 }}>
                        Goodly Heritage School Administration Portal
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
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
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isLoading}
                            sx={{ mt: 3 }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                            For administrator access only
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default AdminLogin; 