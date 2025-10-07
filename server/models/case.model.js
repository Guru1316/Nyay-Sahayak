import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
    caseId: {
        type: String,
        required: true,
        unique: true,
        // Example: 'POA-MH-2025-12345'
    },
    beneficiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This creates a link to the User model
        required: true,
    },
    firDetails: {
        firNumber: String,
        policeStation: String,
        dateOfIncident: Date,
    },
    status: {
        type: String,
        required: true,
        enum: [
            'Case Registered',
            'Verification Pending',
            'Sanction Pending',
            'Disbursed',
            'Rejected'
        ],
        default: 'Case Registered',
    },
    documents: [{
        docType: String, // e.g., 'Aadhaar Card', 'Bank Passbook'
        docUrl: String,  // URL to the stored document
    }],
    history: [{
        status: String,
        updatedBy: String, // Could be 'System', or an officer's ID
        remarks: String,
        timestamp: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

const Case = mongoose.model('Case', caseSchema);

export default Case;