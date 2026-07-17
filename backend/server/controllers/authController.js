import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import user from '../models/authModel.js';


//Register 
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // verifing user if exists!
        const userExists = await user.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        // Hash password for safety
        const hashedPassword = await bcrypt.hash(password, 10);

        // saving data to database
        const newUser = new user({ name, email, password: hashedPassword, role });
        await newUser.save();

        //generating token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expires: '1d' }
        );


        res.status(201).json({
            message: "User Registered Successfully!",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// Login

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // checking email
        const existingUser = await user.findOne({ email });
        if (!existingUser) return res.status(404).json({ message: "User not found!" });

        // comparing password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong password!" });

        // generating token
        const token = jwt.sign(
            { id: existingUser._id, role: existingUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: "Logged In Successfully!",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            }
        });

    } catch (error) {
        console.log("FULL ERROR:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
