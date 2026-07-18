import jwt from 'jsonwebtoken';


const verifyToken = (req, res, next) => {
    // extracting token from authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];//format: 'bearer <token>'

    if (!token) return res.status(401).json({ message: "No Token, Access Denied!" });

    try {
        // verifying TokenA
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({message: "Invalid Token!"});
    }

};

export default verifyToken;