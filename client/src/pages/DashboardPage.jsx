import React, { useState, useEffect } from 'react';
import { 
    AppBar, Box, Button, Container, Paper, Step, StepLabel, Stepper, Toolbar, 
    Typography, CircularProgress, Dialog, DialogActions, DialogContent, 
    DialogTitle, TextField, List, ListItem, ListItemText, Divider, Snackbar, Alert,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

const steps = ['Case Registered', 'Verification Pending', 'Sanction Pending', 'Disbursed'];

export default function DashboardPage() {
    // State to handle an array of cases
    const [cases, setCases] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [grievances, setGrievances] = useState([]);
    const [openGrievanceDialog, setOpenGrievanceDialog] = useState(false);
    const [grievanceDetails, setGrievanceDetails] = useState('');

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No token found");

            const casePromise = axios.get('http://localhost:5000/api/cases/my-case', { headers: { 'Authorization': `Bearer ${token}` } });
            const grievancePromise = axios.get('http://localhost:5000/api/grievances/my-grievances', { headers: { 'Authorization': `Bearer ${token}` } });

            const [caseResponse, grievanceResponse] = await Promise.all([casePromise, grievancePromise]);
            console.log("Frontend received cases:", caseResponse.data.cases);
            setCases(caseResponse.data.cases);
            setGrievances(grievanceResponse.data.grievances);

        } catch (err) {
            setError(err.message || 'Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const handleOpenGrievanceDialog = () => setOpenGrievanceDialog(true);
    const handleCloseGrievanceDialog = () => setOpenGrievanceDialog(false);

    const handleGrievanceSubmit = async () => {
        if (!grievanceDetails.trim()) {
            return alert("Please describe your issue.");
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/grievances', { details: grievanceDetails }, { headers: { 'Authorization': `Bearer ${token}` } });
            setGrievanceDetails('');
            handleCloseGrievanceDialog();
            fetchData();
        } catch (error) {
            console.error("Failed to submit grievance", error);
            alert("Failed to submit grievance.");
        }
    };
    
    const handleKycSubmit = () => {
        setSnackbarMessage('e-KYC verification successful (Simulated)');
        setSnackbarOpen(true);
    };

    const handleFileUpload = async (event, caseId) => {
        const file = event.target.files[0];
        if (!file || !caseId) return;

        try {
            const token = localStorage.getItem('token');
            const docData = { docType: 'Bank Passbook', docName: file.name };
            
            await axios.post(`http://localhost:5000/api/cases/${caseId}/documents`, docData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setSnackbarMessage(`'${file.name}' uploaded successfully!`);
            setSnackbarOpen(true);
            fetchData();
        } catch (error) {
            console.error("File upload failed", error);
            alert("File upload failed.");
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };
    
    const renderCaseContent = () => {
        console.log("Component is rendering with this many cases:", cases.length);
        if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
        if (error) return <Typography color="error" align="center" sx={{ mt: 4 }}>Error: {error}</Typography>;
        if (cases.length === 0) {
            return (
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6">No Active Cases Found</Typography>
                    <Typography color="text.secondary">When a case is registered for you, it will appear here.</Typography>
                </Paper>
            );
        }
        // Map over the cases array and create an Accordion for each one
        return cases.map((caseData) => {
            const activeStep = steps.indexOf(caseData.status);
            return (
                <Accordion key={caseData._id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>Case ID: {caseData.caseId}</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>Status: {caseData.status}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="h6">Case Progress</Typography>
                        <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 1, mb: 3 }}>
                            {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
                        </Stepper>
                        
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6">Verification & Documents</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <TextField label="Enter Aadhaar Number" variant="outlined" size="small" sx={{ flexGrow: 1 }} />
                            <Button variant="contained" onClick={handleKycSubmit}>Verify e-KYC</Button>
                        </Box>
                        <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ mt: 2, width: '100%' }}>
                            Upload Bank Passbook
                            <input type="file" hidden onChange={(e) => handleFileUpload(e, caseData._id)} />
                        </Button>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Uploaded Documents:</Typography>
                            <List dense>
                                {caseData.documents.length > 0 ? caseData.documents.map((doc, i) => (
                                    <ListItem key={i}><ListItemText primary={doc.docType} secondary={doc.docUrl} /></ListItem>
                                )) : <Typography color="text.secondary" sx={{p:1}}>No documents uploaded for this case.</Typography>}
                            </List>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            );
        });
    };

    return (
        <Box sx={{ flexGrow: 1, pb: 4 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Nyay Sahayak</Typography>
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>Welcome, {user.mobileNumber}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Here is the current status of your relief applications.
                </Typography>
                
                {renderCaseContent()}
                
                <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Grievance History</Typography>
                        <Button variant="outlined" onClick={handleOpenGrievanceDialog} disabled={cases.length === 0 || loading}>
                            Raise a Grievance
                        </Button>
                    </Box>
                    <List sx={{ mt: 2 }}>
                         {loading ? <CircularProgress size={24} /> : grievances.length > 0 ? (
                            grievances.map((g, index) => (
                                <React.Fragment key={g._id}>
                                    <ListItem>
                                        <ListItemText 
                                            primary={g.details}
                                            secondary={`Status: ${g.status} | Submitted: ${new Date(g.createdAt).toLocaleDateString()}`} 
                                        />
                                    </ListItem>
                                    {index < grievances.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        ) : (
                            <Typography color="text.secondary" sx={{ p: 2 }}>No grievances filed.</Typography>
                        )}
                    </List>
                </Paper>
            </Container>
            
            <Dialog open={openGrievanceDialog} onClose={handleCloseGrievanceDialog} fullWidth>
                <DialogTitle>Raise a New Grievance</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Describe your issue" type="text" fullWidth multiline rows={4} value={grievanceDetails} onChange={(e) => setGrievanceDetails(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGrievanceDialog}>Cancel</Button>
                    <Button onClick={handleGrievanceSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}