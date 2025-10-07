import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import twilio from 'twilio'; 

const router = express.Router();
const otpStore = {};
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ## Endpoint 1: Send OTP (Final Version) ##
router.post('/send-otp', async (req, res) => {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
        return res.status(400).json({ message: "Mobile number is required" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[mobileNumber] = { otp, expires: Date.now() + 300000 };

    // --- FINAL HACKATHON FIX ---
    // If the number is a special demo number, don't send a real SMS.
    if (mobileNumber === '9999999999' || mobileNumber === '8888888888') {
        console.log(`✅ DEMO OTP for ${mobileNumber} is: ${otp}`);
        return res.status(200).json({ message: "OTP sent successfully (Demo)" });
    }
    // --- END FIX ---

    try {
        const formattedMobileNumber = `+91${mobileNumber}`; // Use your verified number for testing this part
        await client.messages.create({
            body: `Your OTP for Nyay Sahayak is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedMobileNumber
        });
        console.log(`✅ OTP sent via SMS to ${formattedMobileNumber}`);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Failed to send SMS via Twilio:", error);
        res.status(500).json({ message: "Failed to send OTP. (Note: Trial accounts can only send to verified numbers)." });
    }
});

// ## Endpoint 2: Verify OTP and Login/Register (Final Version) ##
router.post('/verify-otp', async (req, res) => {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber || !otp) {
        return res.status(400).json({ message: "Mobile number and OTP are required" });
    }

    const storedOtpData = otpStore[mobileNumber];
    const isDemoNumber = mobileNumber === '9999999999' || mobileNumber === '8888888888';

    // For demo numbers, accept any OTP. For real numbers, check the OTP.
    if (!isDemoNumber && (!storedOtpData || storedOtpData.otp !== otp)) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    try {
        let user = await User.findOne({ mobileNumber });
        if (!user) {
            user = new User({ mobileNumber });
        }

        // Assign officer role for the specific magic number
        if (user.mobileNumber === '9999999999') {
            user.role = 'officer';
        }
        
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '3d' }
        );

        delete otpStore[mobileNumber];

        res.status(200).json({ 
            message: "Login successful",
            token,
            user: { id: user._id, mobileNumber: user.mobileNumber, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;