import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'

const protectedRoute = async (req, res, next) => {
    try {
        const token = req.headers.token

        if (!token) {
            return res.status(401).json({ message: "Not authorized to access this page" })
        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //find user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: 'Invalid Token' })
        }

        //append the user object to req object
        req.user = user

        next();
    } catch (error) {
        console.log('error in getting user profile', error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

export default protectedRoute;
