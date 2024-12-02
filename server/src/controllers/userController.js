import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user (password will be hashed by the schema middleware)
        const user = new User({
            email,
            password    // No need to hash here, schema middleware will do it
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Use the schema's findByCredentials method
        const user = await User.findByCredentials(email, password);
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: 'Invalid credentials' });
    }
};

export const logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(tokenObj => {
            return tokenObj.token !== req.token
        });
        await req.user.save();
        res.status(200).send('Logged out successfully!')
    } catch (error) {
        res.status(500).send(error)
    }
};

export const logoutAll = async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send('Logged out from all devices successfully');
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getProfile = async (req, res) => {
    res.send(req.user);
};

export const updateProfile = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
};

export const deleteProfile = async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
};