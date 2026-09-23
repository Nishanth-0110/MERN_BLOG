const mongoose = require('mongoose');
const env = require('./config/env');
const app = require('./app');

mongoose.set('strictQuery', true);
mongoose
    .connect(env.mongoUri)
    .then(() => {
        console.log('MongoDB connected successfully');
        app.listen(env.port, () => {
            console.log(`Server running on port ${env.port}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
