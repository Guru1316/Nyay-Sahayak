import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import { Box, CircularProgress } from '@mui/material';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            // Check for null OR the literal string "undefined" before parsing
            if (storedUser && storedUser !== 'undefined') {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage, clearing invalid data.", error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    // Show a loading spinner while we check for a user
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Now, decide which page to render
    if (!user) {
        return <LoginPage />;
    }

    switch (user.role) {
        case 'officer':
        case 'admin':
            return <OfficerDashboardPage />;
        case 'beneficiary':
        default:
            return <DashboardPage />;
    }
}

export default App;