import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, CircularProgress, Alert, AlertTitle } from '@mui/material';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function LoginPage() {
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(`${apiBaseUrl}/api/auth/send-otp`, { mobileNumber });
            setShowOtpInput(true);
        } catch (err) {
            setError('Failed to send OTP. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`${apiBaseUrl}/api/auth/verify-otp`, { mobileNumber, otp });
            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            window.location.reload();
        } catch (err) {
            setError('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Nyay Sahayak
                </Typography>
                <Typography component="p" sx={{ mt: 1, mb: 2 }}>
                    Welcome! Please sign in.
                </Typography>

                {!showOtpInput ? (
                    <Box component="form" onSubmit={handleSendOtp} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="mobile"
                            label="Mobile Number"
                            name="mobile"
                            autoComplete="tel"
                            autoFocus
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                        </Button>
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 1 }}>
                        <Typography>
                            An OTP has been sent to your number.
                        </Typography>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="otp"
                            label="OTP"
                            type="text"
                            id="otp"
                            autoFocus
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Verify OTP & Login'}
                        </Button>
                    </Box>
                )}
                {error && <Typography color="error">{error}</Typography>}

                <Alert severity="info" sx={{ mt: 4, textAlign: 'left' }}>
    <AlertTitle>For Hackathon Judges</AlertTitle>
    To test as a **Beneficiary**, use the mobile number:<br/>
    <strong>8888888888</strong>
    <br/><br/>
    To test as an **Officer**, use the mobile number:<br/>
    <strong>9999999999</strong>
    <br/><br/>
    (Any 4-digit OTP will work for these numbers)
</Alert>
            </Box>
        </Container>
    );
}