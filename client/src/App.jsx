import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import { Box, CircularProgress } from '@mui/material';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            // If parsing fails, clear the invalid item
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            setLoading(false); // Stop loading once user is checked
        }
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const renderDashboard = () => {
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
    };

    return (
        <div>
            {renderDashboard()}
        </div>
    );
}

export default App;