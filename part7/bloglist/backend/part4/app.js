const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');
const testingRouter = require('./controllers/testing');
if (process.env.NODE_ENV === 'test') {
  console.log('Testing router initialized');
  app.use('/api/testing', testingRouter);
}

app.use(middleware.tokenExtractor);
app.use(middleware.userExtractor);

logger.info('Connecting to MongoDB');
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.json());

app.use('/api/login', loginRouter);

app.use('/api/blogs', middleware.userExtractor, blogsRouter);
app.use('/api/users', usersRouter);

module.exports = app;
