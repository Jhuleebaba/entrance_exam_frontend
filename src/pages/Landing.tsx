import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import logo from '../assets/ghs_logo.png';

const Landing = () => {
  return (
    <Container maxWidth="lg" sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Watermark background */}
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
          opacity: 0.1,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      {/* Foreground content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header with large logo above title */}
        <Box
          sx={{
            mt: 8,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Goodly Heritage School logo"
            sx={{ 
              height: 300, 
              mb: 3, 
              backgroundColor: 'transparent',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          <Typography variant="h2" color="primary" gutterBottom align="center">
            Goodly Heritage Comprehensive High School
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph align="center">
            Online Entrance Examination Portal
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Excellence in Education
              </Typography>
              <Typography align="center" color="textSecondary">
                Join our prestigious institution known for academic excellence and character development.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Online Examination
              </Typography>
              <Typography align="center" color="textSecondary">
                Take your entrance examination online from the comfort of your home.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Join Our Community
              </Typography>
              <Typography align="center" color="textSecondary">
                Become part of our diverse and inclusive learning community.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 4, mb: 8 }}>
          <Typography variant="h5" align="center" gutterBottom>
            How to Register for the Entrance Exam
          </Typography>
          <Typography align="center" paragraph>
            Registration for the entrance examination is managed by our administrative staff.
          </Typography>
          <Typography align="center" paragraph>
            Please contact the school office to register for the upcoming entrance exam.
            After registration, you will receive your exam number and login credentials.
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            size="large"
          >
            Student Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Landing; 