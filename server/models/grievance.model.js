import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case', // Links to the specific case
        required: true,
    },
    beneficiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to the user who raised it
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open',
    },
}, { timestamps: true });

const Grievance = mongoose.model('Grievance', grievanceSchema);

export default Grievance;