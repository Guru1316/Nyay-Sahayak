import express from 'express';
import Case from '../models/case.model.js';
import User from '../models/user.model.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();


// This is an array of the possible statuses in order
const statusWorkflow = [
    'Case Registered',
    'Verification Pending',
    'Sanction Pending',
    'Disbursed'
];

// ### OFFICER ROUTES ###

// ## Endpoint 3: Get all cases (Officer/Admin Only) ##
router.get('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Access denied.' });
    }
    try {
        // Find all cases and populate the 'beneficiary' field with their mobile number
        const cases = await Case.find().populate('beneficiary', 'mobileNumber');
        res.status(200).json({ cases });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ## Endpoint 4: Update a case's status (Officer/Admin Only) ##
router.put('/:caseId/status', authMiddleware, async (req, res) => {
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Access denied.' });
    }
    try {
        const caseToUpdate = await Case.findById(req.params.caseId);
        if (!caseToUpdate) {
            return res.status(404).json({ message: 'Case not found' });
        }

        const currentStatusIndex = statusWorkflow.indexOf(caseToUpdate.status);
        
        // Make sure we are not already at the final status
        if (currentStatusIndex >= statusWorkflow.length - 1) {
            return res.status(400).json({ message: 'Case is already at the final stage.' });
        }

        const nextStatus = statusWorkflow[currentStatusIndex + 1];
        caseToUpdate.status = nextStatus;
        
        // Add a record of this change to the case's history
        caseToUpdate.history.push({
            status: nextStatus,
            updatedBy: req.user.id,
            remarks: 'Status updated by officer.'
        });

        await caseToUpdate.save();
        res.status(200).json({ message: 'Case status updated successfully', case: caseToUpdate });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



// ## Endpoint 1: Create a New Case (Officer/Admin Only) ##
// This simulates the CCTNS trigger.
router.post('/', authMiddleware, async (req, res) => {
    // Check if the user making the request is an officer or admin
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only officers can create cases.' });
    }

    const { beneficiaryMobile, firDetails } = req.body;

    try {
        // Find the beneficiary by their mobile number
        const beneficiary = await User.findOne({ mobileNumber: beneficiaryMobile });
        if (!beneficiary) {
            return res.status(404).json({ message: 'Beneficiary not found with that mobile number.' });
        }

        // Generate a unique Case ID
        const caseId = `POA-TN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const newCase = new Case({
            caseId,
            beneficiary: beneficiary._id,
            firDetails,
            history: [{ status: 'Case Registered', updatedBy: req.user.id, remarks: 'Case created via system.' }]
        });

        await newCase.save();
        res.status(201).json({ message: 'Case created successfully', case: newCase });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// ## Endpoint 2: Get a Beneficiary's Case (Logged-in Beneficiary Only) ##
// ## Endpoint 2: Get a Beneficiary's Cases (Updated) ##
router.get('/my-case', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // --- DEBUGGING LOGS ---
        console.log('-----------------------------------------');
        console.log('Looking for cases for beneficiary ID:', userId);
        
        const cases = await Case.find({ beneficiary: userId }).sort({ createdAt: -1 });
        
        console.log(`Found ${cases.length} case(s) for this ID.`);
        console.log('-----------------------------------------');
        // --- END DEBUGGING ---

        res.status(200).json({ cases });

    } catch (error) {
        console.error("Error in /my-case route:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add this new route inside server/routes/case.routes.js

// ## Endpoint 5: Add a document to a case ##
router.post('/:caseId/documents', authMiddleware, async (req, res) => {
    const { docType, docName } = req.body;

    try {
        const caseToUpdate = await Case.findById(req.params.caseId);
        if (!caseToUpdate) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Ensure the person adding the doc is the beneficiary of the case
        if (caseToUpdate.beneficiary.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You are not the beneficiary of this case.' });
        }

        caseToUpdate.documents.push({ docType, docUrl: docName }); // We save the name as the URL for simulation
        await caseToUpdate.save();

        res.status(200).json({ message: 'Document added successfully', case: caseToUpdate });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;