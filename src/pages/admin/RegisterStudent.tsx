import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    SelectChangeEvent,
    CircularProgress,
    Snackbar
} from '@mui/material';
import axios from '../../config/axios';

const RegisterStudent = () => {
    const [formData, setFormData] = useState({
        surname: '',
        firstName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        sex: '',
        stateOfOrigin: '',
        nationality: 'Nigerian',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (!formData.surname || !formData.firstName || !formData.email ||
            !formData.phoneNumber || !formData.dateOfBirth || !formData.sex || !formData.stateOfOrigin) {
            setError('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        try {
            const registrationData = {
                surname: formData.surname.trim(),
                firstName: formData.firstName.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                dateOfBirth: new Date(formData.dateOfBirth),
                sex: formData.sex,
                stateOfOrigin: formData.stateOfOrigin,
                nationality: formData.nationality,
            };

            console.log('Sending registration data:', registrationData);
            console.log('Using API URL:', axios.defaults.baseURL);

            const response = await axios.post('/api/auth/register', registrationData);

            console.log('Registration response:', response.data);

            if (response.data.success) {
                setSuccess(`Registration successful! Exam number: ${response.data.user.examNumber}`);
                setShowSnackbar(true);
                // Reset form after successful registration
                setFormData({
                    surname: '',
                    firstName: '',
                    email: '',
                    phoneNumber: '',
                    dateOfBirth: '',
                    sex: '',
                    stateOfOrigin: '',
                    nationality: 'Nigerian',
                });
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error headers:', error.response?.headers);

            let errorMessage = 'An error occurred during registration';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (!error.response) {
                errorMessage = 'Network error - please check if the server is running';
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Nigerian states list
    const nigerianStates = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
        'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
        'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
        'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
        'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ];

    // Countries list (just a few for example)
    const countries = [
        'Nigerian', 'Ghanaian', 'South African', 'Kenyan', 'American', 'British', 'Canadian', 'Other'
    ];

    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Register New Student
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Surname"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleTextChange}
                                    required
                                    disabled={isLoading}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleTextChange}
                                    required
                                    disabled={isLoading}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleTextChange}
                                    required
                                    disabled={isLoading}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleTextChange}
                                    required
                                    disabled={isLoading}
                                    placeholder="e.g. 08012345678"
                                    helperText="Enter student's phone number"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleTextChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    disabled={isLoading}
                                    helperText="Enter student's date of birth"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required disabled={isLoading}>
                                    <InputLabel id="sex-label">Sex</InputLabel>
                                    <Select
                                        labelId="sex-label"
                                        id="sex"
                                        name="sex"
                                        value={formData.sex}
                                        onChange={handleSelectChange}
                                        label="Sex"
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                    </Select>
                                    <FormHelperText>Select student's sex</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required disabled={isLoading}>
                                    <InputLabel id="state-label">State of Origin</InputLabel>
                                    <Select
                                        labelId="state-label"
                                        id="stateOfOrigin"
                                        name="stateOfOrigin"
                                        value={formData.stateOfOrigin}
                                        onChange={handleSelectChange}
                                        label="State of Origin"
                                    >
                                        {nigerianStates.map((state) => (
                                            <MenuItem key={state} value={state}>{state}</MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>Select student's state of origin</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required disabled={isLoading}>
                                    <InputLabel id="nationality-label">Nationality</InputLabel>
                                    <Select
                                        labelId="nationality-label"
                                        id="nationality"
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleSelectChange}
                                        label="Nationality"
                                    >
                                        {countries.map((country) => (
                                            <MenuItem key={country} value={country}>{country}</MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>Select student's nationality</FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>

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
                                'Register Student'
                            )}
                        </Button>
                    </form>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" align="center">
                            After registration, the student will receive an exam number and their surname will be their password.
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={success}
            />
        </Container>
    );
};

export default RegisterStudent; 