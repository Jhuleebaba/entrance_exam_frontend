import React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Link,
    Divider,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    PeopleOutline as PeopleIcon,
    QuestionAnswer as QuestionsIcon,
    Assignment as ExamsIcon,
    Settings as SettingsIcon,
    PersonAdd as RegisterIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/ghs_logo.png';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        { text: 'Register Student', icon: <RegisterIcon />, path: '/admin/register' },
        { text: 'Students', icon: <PeopleIcon />, path: '/admin/students' },
        { text: 'Questions', icon: <QuestionsIcon />, path: '/admin/questions' },
        { text: 'Exam Results', icon: <ExamsIcon />, path: '/admin/results' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Watermark background */}
            <Box
                component="img"
                src={logo}
                alt="Watermark"
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.05,
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            />
            <AppBar position="static" color="primary" elevation={0}>
                <Toolbar>
                    <Box
                        component="img"
                        src={logo}
                        alt="School Logo"
                        sx={{
                            height: 40,
                            mr: 2,
                            filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))'
                        }}
                    />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <Link
                            component={RouterLink}
                            to="/admin"
                            color="inherit"
                            underline="none"
                        >
                            GHS Admin Portal
                        </Link>
                    </Typography>

                    <Tooltip title="Logout">
                        <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                {/* Side navigation */}
                <Box
                    component="nav"
                    sx={{
                        width: 240,
                        flexShrink: 0,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        borderRight: 1,
                        borderColor: 'divider',
                        p: 2,
                    }}
                >
                    <Typography variant="h6" color="primary" gutterBottom>
                        Admin Menu
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {navItems.map((item) => (
                        <Button
                            key={item.text}
                            component={RouterLink}
                            to={item.path}
                            startIcon={item.icon}
                            color={isActive(item.path) ? "primary" : "inherit"}
                            variant={isActive(item.path) ? "contained" : "text"}
                            fullWidth
                            sx={{
                                justifyContent: 'flex-start',
                                mb: 1,
                                textAlign: 'left',
                                py: 1
                            }}
                        >
                            {item.text}
                        </Button>
                    ))}
                </Box>

                {/* Main content */}
                <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'rgba(255,255,255,0.8)' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout; 