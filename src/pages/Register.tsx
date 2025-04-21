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
} from '@mui/material';
import axios from '../config/axios';
import RegistrationConfirmation from '../components/RegistrationConfirmation';

const Register = () => {
  //const navigate = useNavigate();
  const [formData, setFormData] = useState({
    surname: '',
    firstName: '',
    email: '',
    dateOfBirth: '',
    sex: '',
    stateOfOrigin: '',
    nationality: 'Nigerian',
  });
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [error, setError] = useState('');

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
    setRegistrationResult(null);

    if (!formData.surname || !formData.firstName || !formData.email || 
        !formData.dateOfBirth || !formData.sex || !formData.stateOfOrigin) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const registrationData = {
        surname: formData.surname.trim(),
        firstName: formData.firstName.trim(),
        email: formData.email.trim(),
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
        setRegistrationResult(response.data.user);
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

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Student Registration
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {registrationResult ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                Registration successful! Your examination details are below.
              </Alert>
              <RegistrationConfirmation userData={registrationResult} />
            </>
          ) : (
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
                    helperText="Enter your surname (this will be your password)"
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    required
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
                    helperText="Enter your date of birth"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
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
                    <FormHelperText>Select your sex</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
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
                    <FormHelperText>Select your state of origin</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleTextChange}
                    required
                    defaultValue="Nigerian"
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3 }}
              >
                Register
              </Button>
            </form>
          )}

          {!registrationResult && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" align="center">
                After registration, you will receive an exam number and your surname will be your password.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 