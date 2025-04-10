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

const Landing = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography
          variant="h2"
          align="center"
          color="primary"
          gutterBottom
        >
          Welcome to Goodly Heritage School
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="textSecondary"
          paragraph
        >
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

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 8 }}>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          color="primary"
          size="large"
        >
          Register for Exam
        </Button>
        <Button
          component={RouterLink}
          to="/login"
          variant="outlined"
          color="primary"
          size="large"
        >
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default Landing; 