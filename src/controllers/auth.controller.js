import User from '../models/user.model.js';
import { generateToken } from '../utils/token.js';

export const register = async (req, res) => {
    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password should be atleast 6 characters long" })
        }

        if (username.length < 3) {
            return res.status(400).json({ message: "Username should be atleast 3 characters long" })
        }

        //check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: "Email already exists" })

        //check if username already exists
        const usernameExists = await User.findOne({ username });
        if (usernameExists) return res.status(400).json({ message: "Username already exists" })

        //get random avatar as per username
        const profileImage = `https://api.dicebear.com/9.x/adventurer/png?seed=${username}`

        const user = new User({
            email,
            username,
            password,
            profileImage
        })

        await user.save();

        const token = generateToken(user._id)

        //201 - resource created in backend
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        })

    } catch (error) {
        console.log("error in register", error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        //check if user exists
        const user = await User.findOne({ email })

        if (!user) return res.status(400).json({ message: "Invalid Credentials" })

        //check if password is correct

        const isPasswordMatching = await user.comparePassword(password)

        if (!isPasswordMatching) return res.status(400).json({ message: "Invalid Credentials" })

        const token = generateToken(user._id)

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                profileImage: user.profileImage
            }
        })

    } catch (error) {
        console.log("error in login", error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

export const userprofile = async (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("error in fetching user profile", error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
