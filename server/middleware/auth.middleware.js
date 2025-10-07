import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // Get token from the Authorization header (e.g., 'Bearer TOKEN_STRING')
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization denied. No token provided.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user info to the request object for later use
        req.user = decoded; 
        next(); // Proceed to the next function (the controller)
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

export default authMiddleware;