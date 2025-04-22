import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../utils/token.js";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password should be atleast 6 characters long" });
        }

        if (username.length < 3) {
            return res
                .status(400)
                .json({ message: "Username should be atleast 3 characters long" });
        }

        //check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists)
            return res.status(400).json({ message: "Email already exists" });

        //check if username already exists
        const usernameExists = await User.findOne({ username });
        if (usernameExists)
            return res.status(400).json({ message: "Username already exists" });

        //get random avatar as per username
        const profileImage = `https://api.dicebear.com/9.x/adventurer/png?seed=${username}`;

        const user = new User({
            email,
            username,
            password,
            profileImage,
        });

        await user.save();

        const token = generateToken(user._id);

        //201 - resource created in backend
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.log("error in register", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        //check if password is correct

        const isPasswordMatching = await user.comparePassword(password);

        if (!isPasswordMatching)
            return res.status(400).json({ message: "Invalid Credentials" });

        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        console.log("error in login", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const userprofile = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("error in fetching user profile", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, bio, profileImage } = req.body;

        if (!username || !bio) {
            return res
                .status(400)
                .json({ message: "Username and bio are required." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check for duplicate username
        const existingUser = await User.findOne({
            username: username.trim(),
            _id: { $ne: userId },
        });
        if (existingUser) {
            return res.status(400).json({ message: "Username is already taken." });
        }

        //upload a new image
        //if base64 then upload to cloudinary
        //if url then save the url
        //if no image then keep the old image
        let imageUrl = profileImage;
        if (profileImage && profileImage.startsWith("data:image")) {
            const imageUploadResponse = await cloudinary.uploader.upload(
                profileImage
            );
            imageUrl = imageUploadResponse.secure_url;
        }

        //save the updated user to db

        const newUser = {
            bio: bio.trim(),
            username: username.trim(),
            profileImage: imageUrl,
        };

        const updatedUser = await User.findByIdAndUpdate(userId, newUser, {
            new: true,
            runValidators: true,
        });

        res
            .status(200)
            .json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.log("error in updating user profile", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendResetCode = async (req, res) => {
    //GET EMAIL FROM REQ BODY
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res
            .status(404)
            .json({ message: "We could not find the user with given email" });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetCode = code;
    user.resetCodeExpiry = Date.now() + 10 * 60 * 1000; //10 mins
    user.save();

    const html = `
  <div style="font-family: Arial, sans-serif; font-size: 16px;">
    <h2 style="color: #333;">ThoughtShelf - Password Reset Code</h2>
    <p>Your password reset code is:</p>
    <p style="font-size: 24px; font-weight: bold;">${code}</p>
    <p>This code is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
    <br>
    <p>– The ThoughtShelf Team</p>
  </div>
`;

    await sendEmail(email, "Your ThoughtShelf Reset Code", html);
    res.status(200).json({ message: "Password reset code sent" });
};

export const verifyPasswordResetCode = async (req, res) => {
    const { code, email } = req.body;
    const user = await User.findOne({ email });

    if (user.resetCode !== code || user.resetCodeExpiry < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.status(200).json({ message: "Code verified" });
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (newPassword.length < 6) {
            return res
                .status(400)
                .json({ message: "Password should be at least 6 characters long" });
        }

        const user = await User.findOne({ email });

        user.password = newPassword;
        user.resetCode = undefined;
        user.resetCodeExpiry = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.log("error in resetPassword", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};