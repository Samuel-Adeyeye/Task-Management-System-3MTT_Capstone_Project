import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userValidationRules, validate } from '../middleware/validation.js';
import User from '../models/user.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/register', userValidationRules, validate, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', userValidationRules, validate, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout user from current device
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(tokenObj => {
            return tokenObj.token !== req.token
            
        })
        await req.user.save();
        res.status(200).send('Logged out successfully!')
    }
    catch (error) {
        res.status(500).send(error)
    }
})

// Logout user from all devices
router.post('/logoutAll', authenticateToken, async (req, res) => {
    console.log()
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send('Logged out from all devices successfully');
    }
    catch (error) {
        res.status(500).send(error);
    }
})

// List/read user's profile
router.get('/me', authenticateToken, async (req, res) => {
    res.send(req.user)
})

// Update a user
router.patch('/me', authenticateToken, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete a user
router.delete('/me', authenticateToken, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

export default router;