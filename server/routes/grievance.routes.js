import express from 'express';
import Grievance from '../models/grievance.model.js';
import Case from '../models/case.model.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// ### OFFICER ROUTES ###

// ## Endpoint 3: Get all open grievances (Officer/Admin only) ##
router.get('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Access denied.' });
    }
    try {
        const grievances = await Grievance.find({ status: 'Open' })
            .populate('beneficiary', 'mobileNumber')
            .populate('case', 'caseId')
            .sort({ createdAt: 1 }); // Show oldest first
        res.status(200).json({ grievances });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ## Endpoint 4: Resolve a grievance (Officer/Admin only) ##
router.put('/:grievanceId/resolve', authMiddleware, async (req, res) => {
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Access denied.' });
    }
    try {
        const grievance = await Grievance.findById(req.params.grievanceId);
        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }
        grievance.status = 'Resolved';
        await grievance.save();
        res.status(200).json({ message: 'Grievance resolved successfully', grievance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ## Endpoint 1: Create a new grievance (Beneficiary only) ##
router.post('/', authMiddleware, async (req, res) => {
    const { details } = req.body;
    const beneficiaryId = req.user.id;

    if (!details) {
        return res.status(400).json({ message: 'Grievance details are required.' });
    }

    try {
        // Find the case associated with this beneficiary
        const userCase = await Case.findOne({ beneficiary: beneficiaryId });
        if (!userCase) {
            return res.status(404).json({ message: 'No case found for this user to file a grievance against.' });
        }

        const newGrievance = new Grievance({
            case: userCase._id,
            beneficiary: beneficiaryId,
            details
        });

        await newGrievance.save();
        res.status(201).json({ message: 'Grievance submitted successfully', grievance: newGrievance });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ## Endpoint 2: Get all grievances for a user's case ##
router.get('/my-grievances', authMiddleware, async (req, res) => {
    const beneficiaryId = req.user.id;
    try {
        const userCase = await Case.findOne({ beneficiary: beneficiaryId });
        if (!userCase) {
            return res.status(200).json({ grievances: [] }); // No case, so no grievances
        }

        const grievances = await Grievance.find({ case: userCase._id }).sort({ createdAt: -1 });
        res.status(200).json({ grievances });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;