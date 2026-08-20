const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const user = await UserModel.getUserByUsername(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        if (user.Password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        await UserModel.updateLastLogin(user.UserID);

        const userData = {
            id: user.UserID,
            username: user.Username,
            fullName: user.FullName,
            email: user.Email,
            role: user.Role
        };

        const token = Buffer.from(JSON.stringify({
            userId: user.UserID,
            username: user.Username,
            timestamp: Date.now()
        })).toString('base64');

        res.json({
            success: true,
            data: userData,
            token: token,
            message: 'Login successful'
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: err.message
        });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        try {
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            const user = await UserModel.getUserById(decoded.userId);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            res.json({
                success: true,
                data: user,
                message: 'Token verified'
            });
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error verifying token'
        });
    }
});

router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;