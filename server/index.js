import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import the new auth router
import authRoutes from './routes/auth.routes.js';
import caseRoutes from './routes/case.routes.js';
import grievanceRoutes from './routes/grievance.routes.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- API Routes ---
// All routes starting with /api/auth will be handled by authRoutes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/grievances', grievanceRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: "Nyay Sahayak API is running! 🚀" });
});


// --- Mongoose Connection ---
// We've removed the deprecated options object
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected successfully! ✅");
    // Only start the server if the DB connection is successful
    app.listen(PORT, () => {
      console.log(`Server is live and running on http://localhost:${PORT}`);
    });
})
.catch((error) => {
    console.error("MongoDB connection failed: ❌", error.message);
    process.exit(1); // Exit the process with an error code
});