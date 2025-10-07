import React, { useState, useEffect } from 'react';
import { 
    AppBar, Box, Button, Container, Paper, Toolbar, Typography, Table, 
    TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField 
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Import the icon for the resolve button
import axios from 'axios';

export default function OfficerDashboardPage() {
    const [cases, setCases] = useState([]);
    const [grievances, setGrievances] = useState([]); // State for grievances
    const [loading, setLoading] = useState(true);
    
    // State for the "Create Case" dialog
    const [open, setOpen] = useState(false);
    const [beneficiaryMobile, setBeneficiaryMobile] = useState('');
    const [firNumber, setFirNumber] = useState('');
    const [policeStation, setPoliceStation] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Fetch both cases and open grievances simultaneously
            const casesPromise = axios.get('http://localhost:5000/api/cases', { headers: { 'Authorization': `Bearer ${token}` } });
            const grievancesPromise = axios.get('http://localhost:5000/api/grievances', { headers: { 'Authorization': `Bearer ${token}` } });

            const [casesResponse, grievancesResponse] = await Promise.all([casesPromise, grievancesPromise]);
            
            setCases(casesResponse.data.cases);
            setGrievances(grievancesResponse.data.grievances);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (caseId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/cases/${caseId}/status`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(); 
        } catch (error) {
            console.error("Failed to update case status", error);
            alert('Failed to update status. The case might already be at the final stage.');
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setBeneficiaryMobile('');
        setFirNumber('');
        setPoliceStation('');
    };

    const handleCreateCase = async () => {
        if (!beneficiaryMobile || !firNumber || !policeStation) {
            return alert("Please fill all fields.");
        }
        try {
            const token = localStorage.getItem('token');
            const caseData = { beneficiaryMobile, firDetails: { firNumber, policeStation } };
            await axios.post('http://localhost:5000/api/cases', caseData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            handleClose();
            fetchData();
        } catch (error) {
            console.error("Failed to create case", error);
            alert(`Failed to create case: ${error.response?.data?.message || 'Server error'}`);
        }
    };

    const handleResolveGrievance = async (grievanceId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/grievances/${grievanceId}/resolve`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(); // Refresh all data to remove the resolved grievance from the list
        } catch (error) {
            console.error("Failed to resolve grievance", error);
            alert('Failed to resolve grievance.');
        }
    };

    return (
        <Box sx={{ flexGrow: 1, pb: 4 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Nyay Sahayak (Officer Portal)
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {/* Cases Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" gutterBottom>Case Management</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickOpen}>Create New Case</Button>
                </Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead><TableRow><TableCell>Case ID</TableCell><TableCell>Beneficiary Mobile</TableCell><TableCell>Current Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                        <TableBody>
                            {loading ? (<TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>) : (
                                cases.map((c) => (
                                    <TableRow key={c._id}>
                                        <TableCell>{c.caseId}</TableCell>
                                        <TableCell>{c.beneficiary?.mobileNumber || 'N/A'}</TableCell>
                                        <TableCell>{c.status}</TableCell>
                                        <TableCell align="right"><Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => handleUpdateStatus(c._id)} disabled={c.status === 'Disbursed'}>Promote</Button></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Grievances Section */}
                <Typography variant="h4" gutterBottom sx={{ mt: 6 }}>Open Grievances</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead><TableRow><TableCell>Beneficiary Mobile</TableCell><TableCell>Case ID</TableCell><TableCell>Grievance Details</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                        <TableBody>
                            {loading ? (<TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>) : (
                                grievances.map((g) => (
                                    <TableRow key={g._id}>
                                        <TableCell>{g.beneficiary?.mobileNumber || 'N/A'}</TableCell>
                                        <TableCell>{g.case?.caseId || 'N/A'}</TableCell>
                                        <TableCell>{g.details}</TableCell>
                                        <TableCell align="right"><Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleResolveGrievance(g._id)}>Mark as Resolved</Button></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

            {/* Create Case Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Register a New Case</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the details for the new case. The beneficiary must already be registered in the system.
                    </DialogContentText>
                    <TextField autoFocus margin="dense" label="Beneficiary Mobile Number" type="text" fullWidth variant="standard" value={beneficiaryMobile} onChange={(e) => setBeneficiaryMobile(e.target.value)} />
                    <TextField margin="dense" label="FIR Number" type="text" fullWidth variant="standard" value={firNumber} onChange={(e) => setFirNumber(e.target.value)} />
                    <TextField margin="dense" label="Police Station" type="text" fullWidth variant="standard" value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleCreateCase}>Create Case</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}