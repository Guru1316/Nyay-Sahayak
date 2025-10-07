import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['beneficiary', 'officer', 'admin'],
        default: 'beneficiary',
    },
    // We can add more details later, like name or district
    name: {
        type: String,
        trim: true,
    },
    district: {
        type: String,
        trim: true,
    }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt fields automatically

const User = mongoose.model('User', userSchema);

export default User;