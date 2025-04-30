import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
} from '@mui/material';

const Navbar = () => {
  return (
    <Box> 
      <AppBar position="static" color="primary" sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Goodly Heritage Comprehensive High School
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar; 