const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const groupRoutes = require('./routes/accountGroupRoutes');
const accountRoutes = require('./routes/accountInfoRoutes');
const authRoutes = require('./routes/authRoutes');
const firmRoutes = require('./routes/firmRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/firms', firmRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'AccSmart API is running',
        server: 'SQL Server 2008 R2',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start server
async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`\n🚀 AccSmart Server running on http://localhost:${PORT}`);
            console.log(`📊 API URL: http://localhost:${PORT}/api`);
            console.log(`🔐 Auth URL: http://localhost:${PORT}/api/auth`);
            console.log(`👤 Users URL: http://localhost:${PORT}/api/users`);
            console.log(`\n✨ Ready to accept requests!\n`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    process.exit(0);
});