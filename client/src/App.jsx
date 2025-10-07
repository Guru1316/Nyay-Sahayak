import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OfficerDashboardPage from './pages/OfficerDashboardPage'; // Import the new officer dashboard

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Render logic based on user and user role
    const renderDashboard = () => {
        if (!user) return <LoginPage />;

        switch (user.role) {
            case 'officer':
                return <OfficerDashboardPage />;
            case 'admin':
                 // For now, admin sees the same as officer. Can be changed later.
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