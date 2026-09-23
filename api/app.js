const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();

app.use(helmet());
app.use(cors({ credentials: true, origin: env.clientUrl }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());
if (!env.isTest) {
    app.use(morgan('dev'));
}
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(authRoutes);
app.use(postRoutes);
app.use(commentRoutes);

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mongo: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
    });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
